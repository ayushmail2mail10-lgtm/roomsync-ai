from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class MessageCreate(BaseModel):
    conversation_id: int
    text: str
    is_icebreaker: Optional[bool] = False

class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    sender_name: Optional[str] = None
    text: str
    is_icebreaker: bool
    created_at: datetime
    is_read: bool

    class Config:
        orm_mode = True

class ConversationStart(BaseModel):
    recipient_id: int
    initial_message: Optional[str] = None

class ConversationOut(BaseModel):
    id: int
    other_user_id: int
    other_user_name: str
    other_user_avatar: Optional[str] = None
    other_user_city: Optional[str] = None
    other_user_neighborhood: Optional[str] = None
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    messages: List[MessageOut] = []

    class Config:
        orm_mode = True
