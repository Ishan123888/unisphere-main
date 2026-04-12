'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { studyLobbyService, LobbyResponse, ParticipantResponse, ChatMessageResponse } from '@/services/studyLobbyService';
import LobbyCard from './LobbyCard';

interface User {
  id: string;
  username: string;
}

interface StudyLobbyComponentProps {
  currentUser?: User;
}

export default function StudyLobbyComponent({ currentUser }: StudyLobbyComponentProps) {
  // Current user (mock if not provided)
  // Use useMemo to ensure consistent user generation on server and client
  const user = useMemo(() => {
    if (currentUser) return currentUser;
    return {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      username: 'Member ' + Math.floor(Math.random() * 1000),
    };
  }, [currentUser]);

  // State management
  const [view, setView] = useState<'browse' | 'create' | 'join' | 'lobby'>('browse');
  const [lobbies, setLobbies] = useState<LobbyResponse[]>([]);
  const [currentLobby, setCurrentLobby] = useState<LobbyResponse | null>(null);
  const [participants, setParticipants] = useState<ParticipantResponse[]>([]);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    title: '',
    maxParticipants: 5,
  });

  const [joinForm, setJoinForm] = useState({
    lobbyCode: '',
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch initial lobbies from API
  useEffect(() => {
    if (view === 'browse') {
      fetchLobbies();
    }
  }, [view]);

  // Function to fetch lobbies from API
  const fetchLobbies = async () => {
    setLoading(true);
    try {
      const fetchedLobbies = await studyLobbyService.getAllLobbies();
      setLobbies(fetchedLobbies);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch lobbies');
      // Fallback to mock data if API fails
      const mockLobbies: LobbyResponse[] = [
        {
          id: 1,
          lobbyCode: 'LOBBY001',
          hostUserId: 'host-1',
          hostUsername: 'Alex Chen',
          title: 'Advanced Calculus Study Group',
          maxParticipants: 5,
          currentCount: 3,
          status: 'ACTIVE',
          isFull: false,
          createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
          startedAt: null,
          endedAt: null,
        },
        {
          id: 2,
          lobbyCode: 'LOBBY002',
          hostUserId: 'host-2',
          hostUsername: 'Sarah Johnson',
          title: 'Physics Problem Solving Session',
          maxParticipants: 4,
          currentCount: 2,
          status: 'ACTIVE',
          isFull: false,
          createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
          startedAt: null,
          endedAt: null,
        },
        {
          id: 3,
          lobbyCode: 'LOBBY003',
          hostUserId: 'host-3',
          hostUsername: 'Mike Kumar',
          title: 'Database Design & SQL Workshop',
          maxParticipants: 6,
          currentCount: 6,
          status: 'ACTIVE',
          isFull: true,
          createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
          startedAt: null,
          endedAt: null,
        },
      ];
      setLobbies(mockLobbies);
    } finally {
      setLoading(false);
    }
  };

  // Poll for new messages if in lobby
  useEffect(() => {
    if (view === 'lobby' && currentLobby) {
      const interval = setInterval(async () => {
        try {
          const history = await studyLobbyService.getChatHistory(currentLobby.lobbyCode);
          setMessages(history);
        } catch (err) {
          console.error('Error polling messages:', err);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [view, currentLobby]);

  // Create Lobby Handler
  const handleCreateLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const lobby = await studyLobbyService.createLobby({
        title: createForm.title,
        maxParticipants: createForm.maxParticipants,
        hostUserId: user.id,
        hostUsername: user.username,
      });

      setCurrentLobby(lobby);
      setParticipants([
        {
          id: 1,
          userId: user.id,
          username: user.username,
          joinedAt: new Date().toISOString(),
          active: true,
        },
      ]);
      setMessages([]);
      setView('lobby');
      setCreateForm({ title: '', maxParticipants: 5 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create lobby');
    } finally {
      setLoading(false);
    }
  };

  // Join Lobby Handler
  const handleJoinLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const lobby = await studyLobbyService.joinLobby({
        lobbyCode: joinForm.lobbyCode,
        userId: user.id,
        username: user.username,
      });

      setCurrentLobby(lobby);
      const parts = await studyLobbyService.getParticipants(joinForm.lobbyCode);
      setParticipants(parts);
      const msgs = await studyLobbyService.getChatHistory(joinForm.lobbyCode);
      setMessages(msgs);
      setView('lobby');
      setJoinForm({ lobbyCode: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join lobby');
    } finally {
      setLoading(false);
    }
  };

  // Browse Lobby Handler - Now actually joins the lobby
  const handleBrowseLobby = async (lobbyCode: string) => {
    setLoading(true);
    setError(null);

    try {
      // Actually join the lobby instead of just viewing it
      const lobby = await studyLobbyService.joinLobby({
        lobbyCode: lobbyCode,
        userId: user.id,
        username: user.username,
      });

      setCurrentLobby(lobby);
      const parts = await studyLobbyService.getParticipants(lobbyCode);
      setParticipants(parts);
      const msgs = await studyLobbyService.getChatHistory(lobbyCode);
      setMessages(msgs);
      setView('lobby');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join lobby');
    } finally {
      setLoading(false);
    }
  };

  // Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentLobby) return;

    setLoading(true);
    try {
      const newMessage = await studyLobbyService.sendMessage(currentLobby.lobbyCode, {
        senderId: user.id,
        senderUsername: user.username,
        content: messageInput,
      });

      setMessages([...messages, newMessage]);
      setMessageInput('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Leave Lobby Handler
  const handleLeaveLobby = async () => {
    if (!currentLobby) return;

    setLoading(true);
    try {
      await studyLobbyService.leaveLobby(currentLobby.lobbyCode, user.id);
      setCurrentLobby(null);
      setParticipants([]);
      setMessages([]);
      setView('browse');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to leave lobby');
    } finally {
      setLoading(false);
    }
  };

  // Delete Lobby Handler (Newly Added)
  const handleDeleteLobby = async () => {
    if (!currentLobby) return;

    setLoading(true);
    try {
      await studyLobbyService.deleteLobby(currentLobby.lobbyCode, user.id);
      setCurrentLobby(null);
      setParticipants([]);
      setMessages([]);
      setView('browse');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete lobby');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: Browse Lobbies View
  // ═══════════════════════════════════════════════════════════════════════
  if (view === 'browse') {
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Header */}
          <div className="px-4 py-8 sm:px-6 lg:px-8 bg-black/40 backdrop-blur-sm border-b border-purple-500/20">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                    Study Lobby
                  </h1>
                  <p className="text-purple-200">
                    Welcome <span className="font-bold text-purple-300">{user.username}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1">User ID</p>
                  <p className="text-sm font-mono text-purple-300 truncate max-w-xs">
                    {user.id}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => setView('create')}
                    className="px-5 py-2.5 bg-linear-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  ➕ Create Lobby
                </button>
                <button
                    onClick={() => setView('join')}
                    className="px-5 py-2.5 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-all"
                >
                  🔗 Join Lobby
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
              <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
          )}

          {/* Available Lobbies */}
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-6">Available Study Lobbies</h2>

              {lobbies.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-lg">No lobbies available yet.</p>
                    <p className="text-slate-500">Create one or come back later!</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lobbies.map((lobby) => (
                        <LobbyCard
                            key={lobby.lobbyCode}
                            lobby={lobby}
                            onJoin={handleBrowseLobby}
                            loading={loading}
                        />
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: Create Lobby View
  // ═══════════════════════════════════════════════════════════════════════
  if (view === 'create') {
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <button
                onClick={() => setView('browse')}
                className="mb-6 text-slate-400 hover:text-white font-bold flex items-center gap-2 transition-colors"
            >
              ← Back
            </button>

            {/* Card */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-6">Create Study Lobby</h2>

              {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
              )}

              <form onSubmit={handleCreateLobby} className="space-y-5">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-2">
                    Lobby Title
                  </label>
                  <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) =>
                          setCreateForm({ ...createForm, title: e.target.value })
                      }
                      placeholder="e.g., Calculus Study Group"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                      required
                      minLength={3}
                      maxLength={100}
                  />
                </div>

                {/* Max Participants Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-2">
                    Max Participants: {createForm.maxParticipants}
                  </label>
                  <input
                      type="range"
                      min="2"
                      max="10"
                      value={createForm.maxParticipants}
                      onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            maxParticipants: parseInt(e.target.value),
                          })
                      }
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Between 2 and 10 participants
                  </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !createForm.title.trim()}
                    className={`w-full py-3 font-bold rounded-lg transition-all text-white ${
                        loading || !createForm.title.trim()
                            ? 'bg-slate-600 cursor-not-allowed'
                            : 'bg-linear-to-r from-purple-500 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/50'
                    }`}
                >
                  {loading ? '⏳ Creating...' : '✨ Create Lobby'}
                </button>
              </form>
            </div>
          </div>
        </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: Join Lobby View
  // ═══════════════════════════════════════════════════════════════════════
  if (view === 'join') {
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <button
                onClick={() => setView('browse')}
                className="mb-6 text-slate-400 hover:text-white font-bold flex items-center gap-2 transition-colors"
            >
              ← Back
            </button>

            {/* Card */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-6">Join Study Lobby</h2>

              {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
              )}

              <form onSubmit={handleJoinLobby} className="space-y-5">
                {/* Lobby Code Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-2">
                    Lobby Code
                  </label>
                  <input
                      type="text"
                      value={joinForm.lobbyCode}
                      onChange={(e) =>
                          setJoinForm({ lobbyCode: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., LOBBY001"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors text-center font-mono text-lg tracking-widest"
                      required
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Ask the lobby host for the code
                  </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !joinForm.lobbyCode.trim()}
                    className={`w-full py-3 font-bold rounded-lg transition-all text-white ${
                        loading || !joinForm.lobbyCode.trim()
                            ? 'bg-slate-600 cursor-not-allowed'
                            : 'bg-linear-to-r from-purple-500 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/50'
                    }`}
                >
                  {loading ? '⏳ Joining...' : '🔗 Join Lobby'}
                </button>
              </form>
            </div>
          </div>
        </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: Lobby View (Main Chat & Participants)
  // ═══════════════════════════════════════════════════════════════════════
  if (view === 'lobby' && currentLobby) {
    const isHost = currentLobby.hostUserId === user.id;

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
          {/* Header */}
          <div className="px-4 py-4 sm:px-6 lg:px-8 bg-black/40 backdrop-blur-sm border-b border-purple-500/20 shrink-0">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {currentLobby.title}
                  </h1>
                  {isHost && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300">
                    👑 Host
                  </span>
                  )}
                </div>
                <p className="text-sm text-slate-400">
                  Code: <span className="font-mono text-purple-300">{currentLobby.lobbyCode}</span>
                </p>
              </div>

              <div className="flex gap-2">
                {isHost && (
                    <button
                        onClick={handleDeleteLobby}
                        disabled={loading}
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition-all text-sm"
                    >
                      {loading ? '⏳' : '🗑️'} Delete
                    </button>
                )}
                <button
                    onClick={handleLeaveLobby}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all text-sm"
                >
                  {loading ? '⏳' : '🚪'} Leave
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
              <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Chat Section */}
            <div className="flex-1 flex flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto w-full h-full flex flex-col gap-4">
                {/* Chat Messages */}
                <div className="flex-1 bg-slate-800/50 border border-purple-500/20 rounded-xl overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 text-center">
                          <div>
                            <p className="text-sm mb-1">💬 No messages yet</p>
                            <p className="text-xs">Start the conversation!</p>
                          </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-300">
                            {msg.senderUsername}
                          </span>
                                <span className="text-xs text-slate-500">
                            {new Date(msg.sentAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                              </div>
                              <p className="text-sm text-slate-200 ml-4 bg-slate-700/50 rounded p-2 rounded-tl-none">
                                {msg.content}
                              </p>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form
                      onSubmit={handleSendMessage}
                      className="border-t border-slate-700 p-3 bg-slate-800/30 flex gap-2"
                  >
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none text-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading || !messageInput.trim()}
                        className={`px-4 py-2 font-bold rounded-lg transition-all text-sm ${
                            loading || !messageInput.trim()
                                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                    >
                      {loading ? '⏳' : '📤'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Participants Sidebar */}
            <div className="w-64 border-l border-purple-500/20 bg-slate-800/30 flex flex-col lg:flex">
              <div className="px-4 py-4 border-b border-purple-500/20">
                <h3 className="font-bold text-white mb-2">
                  Participants ({participants.length}/{currentLobby.maxParticipants})
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {participants.map((participant) => (
                    <div
                        key={participant.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">
                      {participant.username.charAt(0).toUpperCase()}
                    </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {participant.username}
                        </p>
                        <p className="text-xs text-slate-400">
                          {participant.active ? '🟢 Active' : '🔴 Offline'}
                        </p>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    );
  }

  // Fallback
  return <div className="text-white p-4">Loading...</div>;
}

