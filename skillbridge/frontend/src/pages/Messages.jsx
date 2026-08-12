import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Send, 
  User, 
  MessageSquare,
  MessageCircle,
  Clock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  
  // Lists
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Selected conversation
  const [activeContact, setActiveContact] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  
  // Scrolling
  const messagesEndRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    try {
      const data = await api.get('/messages/conversations');
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const data = await api.get(`/messages?contactId=${contactId}`);
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.contact_id);
      const interval = setInterval(() => fetchMessages(activeContact.contact_id), 5000); // poll chat every 5s
      return () => clearInterval(interval);
    }
  }, [activeContact]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeContact) return;

    try {
      const sentMsg = await api.post('/messages', {
        receiver_id: activeContact.contact_id,
        content: messageInput
      });
      setMessages([...messages, sentMsg]);
      setMessageInput('');
      scrollToBottom();
      fetchConversations(); // refresh sidebar snippet
    } catch (err) {
      console.error(err);
    }
  };

  const selectContact = (c) => {
    setActiveContact(c);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden h-[80vh] flex shadow-xl">
      {/* 1. Conversations Sidebar */}
      <div className={`
        w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-900/60
        ${activeContact ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-5 border-b border-slate-800 flex items-center gap-2">
          <MessageCircle className="text-emerald-500" size={20} />
          <h2 className="font-bold text-base font-outfit text-white">Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-850 p-2 space-y-1">
          {conversations.length > 0 ? (
            conversations.map(c => (
              <button
                key={c.contact_id}
                onClick={() => selectContact(c)}
                className={`w-full p-3.5 rounded-2xl text-left transition flex items-center gap-3 ${activeContact?.contact_id === c.contact_id ? 'bg-slate-800' : 'hover:bg-slate-800/40'}`}
              >
                <img 
                  src={c.contact_image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${c.contact_name}`} 
                  alt={c.contact_name} 
                  className="w-10 h-10 rounded-full bg-slate-950 border border-slate-850"
                />
                <div className="overflow-hidden flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-xs text-slate-200 truncate block">{c.contact_name}</span>
                    <span className="text-[8px] text-slate-500">{new Date(c.last_message_time).toLocaleDateString()}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold tracking-wide block uppercase mt-0.5">
                    {c.contact_type === 'STUDENT' ? '🎓 Student' : '👤 Community'}
                  </span>
                  <p className="text-[11px] text-slate-400 truncate mt-1 leading-none">{c.last_message}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 text-slate-600 space-y-2">
              <MessageSquare size={32} className="mx-auto" />
              <p className="text-xs">No active chat sessions.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Messages Box */}
      <div className={`
        flex-1 flex flex-col bg-slate-950/30
        ${!activeContact ? 'hidden md:flex items-center justify-center text-slate-600' : 'flex'}
      `}>
        {activeContact ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center gap-3">
              <button 
                onClick={() => setActiveContact(null)}
                className="md:hidden text-slate-400 hover:text-white mr-1"
              >
                <ArrowLeft size={20} />
              </button>
              
              <img 
                src={activeContact.contact_image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeContact.contact_name}`} 
                alt={activeContact.contact_name} 
                className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800"
              />
              
              <div>
                <span className="font-bold text-xs text-slate-200 block leading-tight">{activeContact.contact_name}</span>
                <span className="text-[9px] text-slate-500 font-semibold uppercase">
                  {activeContact.contact_type === 'STUDENT' ? 'Student Worker' : 'Community Employer'}
                </span>
              </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map(msg => {
                const isMine = msg.sender_id === user.id;
                return (
                  <div 
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`
                      max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm
                      ${isMine 
                        ? 'bg-emerald-600 text-white rounded-br-none' 
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'}
                    `}>
                      <p>{msg.content}</p>
                      <span className={`text-[8px] block mt-1 text-right ${isMine ? 'text-emerald-200' : 'text-slate-500'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/60 flex gap-3">
              <input 
                type="text" 
                placeholder="Write your message..." 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition shadow-lg shadow-emerald-950/20"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center p-8 space-y-2">
            <MessageSquare size={40} className="mx-auto text-slate-800" />
            <p className="text-xs font-semibold">Select a conversation thread to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
