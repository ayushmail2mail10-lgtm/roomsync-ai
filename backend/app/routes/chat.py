from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from ..database import get_db
from ..models.user import User
from ..models.profile import Profile
from ..models.chat import Conversation, Message
from ..schemas.chat import MessageCreate, MessageOut, ConversationStart, ConversationOut
from ..services.auth_utils import get_current_user

router = APIRouter(prefix="/chat", tags=["Pre-Move-In In-App Chat"])

INDIAN_ROOMMATE_ICEBREAKERS = [
    {"category": "Food & Kitchen", "text": "Are you comfortable with non-veg cooking in the kitchen, or do you prefer pure-veg cookware?"},
    {"category": "Work & Routine", "text": "What is your typical work-from-home schedule and sleep rhythm on weekdays?"},
    {"category": "Housekeeping", "text": "Are you open to sharing a daily cook and maid for cleaning and cooking?"},
    {"category": "Guests & Social", "text": "What are your ground rules for having friends over or weekend visitors?"},
    {"category": "Expenses & Bills", "text": "How do you prefer to handle high AC/electricity bills in peak summer?"},
    {"category": "Move-in Timeline", "text": "When are you planning to shift, and do you want to do a SafeMeet coffee chat first?"}
]

@router.get("/icebreakers")
def get_icebreakers():
    return INDIAN_ROOMMATE_ICEBREAKERS

@router.get("/conversations", response_model=List[ConversationOut])
def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = db.query(Conversation).filter(
        or_(Conversation.user_one_id == current_user.id, Conversation.user_two_id == current_user.id)
    ).order_by(Conversation.updated_at.desc()).all()

    results = []
    for c in convs:
        other_user_id = c.user_two_id if c.user_one_id == current_user.id else c.user_one_id
        other_user = db.query(User).filter(User.id == other_user_id).first()
        other_profile = other_user.profile if other_user else None

        last_msg = c.messages[-1] if c.messages else None

        results.append(
            ConversationOut(
                id=c.id,
                other_user_id=other_user_id,
                other_user_name=other_user.full_name if other_user else "Roommate",
                other_user_avatar=other_profile.avatar_url if other_profile else None,
                other_user_city=other_profile.city if other_profile else "Bengaluru",
                other_user_neighborhood=other_profile.neighborhood if other_profile else "HSR Layout",
                last_message=last_msg.text if last_msg else "Started conversation",
                last_message_at=last_msg.created_at if last_msg else c.updated_at,
                messages=[]
            )
        )
    return results

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageOut])
def get_messages(conversation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
    
    # Mark as read
    for m in messages:
        if m.sender_id != current_user.id:
            m.is_read = True
    db.commit()

    return [
        MessageOut(
            id=m.id,
            conversation_id=m.conversation_id,
            sender_id=m.sender_id,
            sender_name=m.sender.full_name if m.sender else "User",
            text=m.text,
            is_icebreaker=m.is_icebreaker,
            created_at=m.created_at,
            is_read=m.is_read
        )
        for m in messages
    ]

@router.post("/conversations/start", response_model=ConversationOut)
def start_conversation(
    conv_start: ConversationStart,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if conv_start.recipient_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    # Check if conversation already exists
    conv = db.query(Conversation).filter(
        or_(
            and_(Conversation.user_one_id == current_user.id, Conversation.user_two_id == conv_start.recipient_id),
            and_(Conversation.user_one_id == conv_start.recipient_id, Conversation.user_two_id == current_user.id)
        )
    ).first()

    if not conv:
        conv = Conversation(
            user_one_id=current_user.id,
            user_two_id=conv_start.recipient_id
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    if conv_start.initial_message:
        msg = Message(
            conversation_id=conv.id,
            sender_id=current_user.id,
            text=conv_start.initial_message,
            is_icebreaker=False
        )
        db.add(msg)
        conv.updated_at = datetime.utcnow()
        db.commit()

    other_user = db.query(User).filter(User.id == conv_start.recipient_id).first()
    p = other_user.profile if other_user else None

    return ConversationOut(
        id=conv.id,
        other_user_id=conv_start.recipient_id,
        other_user_name=other_user.full_name if other_user else "Roommate",
        other_user_avatar=p.avatar_url if p else None,
        other_user_city=p.city if p else "Bengaluru",
        other_user_neighborhood=p.neighborhood if p else "HSR Layout",
        last_message=conv_start.initial_message or "Conversation initialized",
        last_message_at=datetime.utcnow(),
        messages=[]
    )

@router.post("/messages", response_model=MessageOut)
def send_message(
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == msg_in.conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    new_msg = Message(
        conversation_id=msg_in.conversation_id,
        sender_id=current_user.id,
        text=msg_in.text,
        is_icebreaker=msg_in.is_icebreaker or False
    )
    db.add(new_msg)
    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(new_msg)

    return MessageOut(
        id=new_msg.id,
        conversation_id=new_msg.conversation_id,
        sender_id=new_msg.sender_id,
        sender_name=current_user.full_name,
        text=new_msg.text,
        is_icebreaker=new_msg.is_icebreaker,
        created_at=new_msg.created_at,
        is_read=new_msg.is_read
    )
