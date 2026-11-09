import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Sparkles, Coffee, ShieldCheck, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Conversation, Message, RoommateMatch } from '../types';
import { ChatWindow } from '../components/chat/ChatWindow';
import { SafeMeetModal } from '../components/verification/SafeMeetModal';

interface MessagesPageProps {
  initialTargetMatch?: RoommateMatch | null;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ initialTargetMatch }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [icebreakers, setIcebreakers] = useState<Array<{ category: string; text: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSafeMeetOpen, setIsSafeMeetOpen] = useState(false);
  const [targetMatchForMeet, setTargetMatchForMeet] = useState<any>(null);

  const fetchConversations = async () => {
    try {
      const convList = await api.getConversations();
      setConversations(convList);

      const icebreakerList = await api.getIcebreakers();
      setIcebreakers(icebreakerList);

      // If initialTargetMatch was passed, check if conversation exists or start one
      if (initialTargetMatch) {
        const found = convList.find((c: Conversation) => c.other_user_id === initialTargetMatch.user_id);
        if (found) {
          setActiveConv(found);
        } else {
          const started = await api.startConversation(
            initialTargetMatch.user_id,
            `Hey ${initialTargetMatch.full_name}! Saw your profile on RoomSync AI (${initialTargetMatch.compatibility.overall_score}% match). Would love to discuss flat options!`
          );
          setConversations([started, ...convList]);
          setActiveConv(started);
        }
      } else if (convList.length > 0 && !activeConv) {
        setActiveConv(convList[0]);
      }
    } catch (e) {
      console.error("Error fetching conversations:", e);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [initialTargetMatch]);

  // Fetch messages whenever active conversation changes
  useEffect(() => {
    if (activeConv) {
      api.getMessages(activeConv.id).then(setMessages).catch(console.error);
    }
  }, [activeConv]);

  const handleSendMessage = async (text: string, isIcebreaker: boolean = false) => {
    if (!activeConv) return;
    try {
      const newMsg = await api.sendMessage(activeConv.id, text, isIcebreaker);
      setMessages(prev => [...prev, newMsg]);
      // Update snippet in conversations list
      setConversations(prev => prev.map(c => 
        c.id === activeConv.id ? { ...c, last_message: text, last_message_at: new Date().toISOString() } : c
      ));
    } catch (e) {
      console.error("Failed to send message:", e);
    }
  };

  const handleOpenSafeMeet = () => {
    if (!activeConv) return;
    setTargetMatchForMeet({
      user_id: activeConv.other_user_id,
      full_name: activeConv.other_user_name,
      profile: {
        avatar_url: activeConv.other_user_avatar,
        occupation: 'Verified Roommate',
        city: activeConv.other_user_city || 'Bengaluru',
        neighborhood: activeConv.other_user_neighborhood || 'HSR Layout'
      },
      compatibility: { overall_score: 95 }
    });
    setIsSafeMeetOpen(true);
  };

  const filteredConversations = conversations.filter(c => 
    c.other_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.other_user_neighborhood && c.other_user_neighborhood.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 text-xs font-mono mb-2">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>PRE-MOVE-IN COMMUNICATOR</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Roommate Chat & Negotiation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Align on food habits, kitchen rules, guest policies, and lease terms before signing agreements.
        </p>
      </div>

      {/* Main Chat Layout: Left List + Right Chat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[650px]">
        
        {/* Left Column: Conversations List */}
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl flex flex-col space-y-4">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
            />
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No conversations found. Explore roommates and click "Connect & Chat" to start messaging!
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = activeConv?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConv(c)}
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                      isActive
                        ? 'bg-dark-850 border border-neon-cyan/40 shadow-sm'
                        : 'hover:bg-dark-850/60 border border-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={c.other_user_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"}
                        alt={c.other_user_name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon-green border-2 border-dark-900" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">
                          {c.other_user_name}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {c.last_message || 'Start chatting...'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Chat Window */}
        <div className="md:col-span-2 h-full">
          <ChatWindow
            conversation={activeConv}
            messages={messages}
            currentUserId={user?.id || 1}
            icebreakers={icebreakers}
            onSendMessage={handleSendMessage}
            onScheduleSafeMeet={handleOpenSafeMeet}
          />
        </div>

      </div>

      {/* SafeMeet Modal */}
      <SafeMeetModal
        isOpen={isSafeMeetOpen}
        onClose={() => setIsSafeMeetOpen(false)}
        targetMatch={targetMatchForMeet}
        onConfirmSchedule={async (meetData) => {
          await api.scheduleSafeMeet(meetData);
        }}
      />

    </div>
  );
};
