import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Coffee, 
  ShieldCheck, 
  CheckCheck,
  MapPin
} from 'lucide-react';
import { Conversation, Message } from '../../types';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: number;
  icebreakers: Array<{ category: string; text: string }>;
  onSendMessage: (text: string, isIcebreaker?: boolean) => Promise<void>;
  onScheduleSafeMeet: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  currentUserId,
  icebreakers,
  onSendMessage,
  onScheduleSafeMeet
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-dark-900 border border-slate-800 rounded-2xl">
        <Sparkles className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-base font-bold text-white">Select a Flatmate Conversation</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Discuss lifestyle habits, kitchen rules, rent splits, and align on expectations before moving in.
        </p>
      </div>
    );
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText;
    setInputText('');
    setIsSending(true);
    try {
      await onSendMessage(text, false);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendIcebreaker = async (icebreakerText: string) => {
    await onSendMessage(icebreakerText, true);
  };

  return (
    <div className="h-full flex flex-col bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-dark-850 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={conversation.other_user_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"}
              alt={conversation.other_user_name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-700"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon-green border-2 border-dark-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                {conversation.other_user_name}
              </h4>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                Aadhaar Verified
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <MapPin className="w-3 h-3 text-neon-green" />
              <span>{conversation.other_user_neighborhood || 'HSR Layout'}, {conversation.other_user_city || 'Bengaluru'}</span>
            </div>
          </div>
        </div>

        {/* Action Button: SafeMeet */}
        <button
          onClick={onScheduleSafeMeet}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-black bg-neon-cyan hover:bg-[#38f8ff] shadow-sm transition-all flex items-center gap-1.5"
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>SafeMeet</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m) => {
          const isMe = m.sender_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? 'bg-neon-green text-black font-medium rounded-tr-none shadow-md shadow-neon-green/10'
                    : m.is_icebreaker
                    ? 'bg-gradient-to-r from-dark-800 to-dark-750 text-neon-cyan border border-neon-cyan/40 rounded-tl-none font-medium'
                    : 'bg-dark-800 text-slate-100 border border-slate-750 rounded-tl-none'
                }`}
              >
                {m.is_icebreaker && (
                  <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-neon-yellow mb-1 font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>Indian Roommate Icebreaker</span>
                  </div>
                )}
                <p>{m.text}</p>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Icebreaker Prompts Bar */}
      {icebreakers.length > 0 && (
        <div className="px-4 py-2 bg-dark-950/80 border-t border-slate-800 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-neon-yellow uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
            <Sparkles className="w-3 h-3" /> Icebreakers:
          </span>
          {icebreakers.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendIcebreaker(item.text)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-dark-850 hover:bg-dark-800 border border-slate-700/80 text-slate-300 hover:text-neon-cyan transition-colors whitespace-nowrap"
            >
              {item.category}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-dark-850 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask about kitchen rules, sleep habits, AC bill split, or move-in dates..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-dark-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-green"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-2.5 rounded-xl bg-neon-green text-black hover:bg-[#05ffa1] disabled:opacity-50 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
