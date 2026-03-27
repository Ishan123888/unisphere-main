'use client';
import { useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  senderName: string;
  senderId: string;
  content: string;
  timestamp: string;
  avatarColor: string;
}

export default function ChatComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [currentUser] = useState({
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    name: 'Member ' + Math.floor(Math.random() * 1000),
  });

  // Mock chat data for demonstration
  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        senderName: 'Alex Chen',
        senderId: 'user-1',
        content: 'Hey everyone! Ready to start the study session?',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        avatarColor: 'from-blue-500 to-blue-600',
      },
      {
        id: '2',
        senderName: 'Sarah Johnson',
        senderId: 'user-2',
        content: 'Yes! I have some questions about calculus derivatives.',
        timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
        avatarColor: 'from-purple-500 to-purple-600',
      },
      {
        id: '3',
        senderName: 'Mike Kumar',
        senderId: 'user-3',
        content: 'Same here! Can someone explain the chain rule?',
        timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
        avatarColor: 'from-emerald-500 to-emerald-600',
      },
      {
        id: '4',
        senderName: 'Alex Chen',
        senderId: 'user-1',
        content: 'Sure! The chain rule is used when you have a composite function...',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        avatarColor: 'from-blue-500 to-blue-600',
      },
    ];
    setMessages(mockMessages);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: currentUser.name,
      senderId: currentUser.id,
      content: messageInput,
      timestamp: new Date().toISOString(),
      avatarColor: 'from-indigo-500 to-indigo-600',
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 sm:px-6 lg:px-8 bg-black/40 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Global Chat</h1>
          <p className="text-purple-200">Connect with other students in the community</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-4 animate-fade-in">
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${msg.avatarColor} flex items-center justify-center flex-shrink-0 shadow-lg`}
              >
                <span className="text-xs font-bold text-white">
                  {msg.senderName.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Message Bubble */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white">{msg.senderName}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-3 text-slate-200 text-sm break-words hover:border-purple-500/40 transition-colors">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="px-4 py-4 sm:px-6 lg:px-8 bg-black/40 backdrop-blur-sm border-t border-purple-500/20">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className={`px-6 py-3 font-bold rounded-lg transition-all ${
                messageInput.trim()
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              📤 Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

