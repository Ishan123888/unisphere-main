'use client';
import { LobbyResponse } from '@/services/studyLobbyService';

interface LobbyCardProps {
  lobby: LobbyResponse;
  onJoin: (lobbyCode: string) => void;
  loading: boolean;
}

export default function LobbyCard({ lobby, onJoin, loading }: LobbyCardProps) {
  const capacityPercent = (lobby.currentCount / lobby.maxParticipants) * 100;
  const isNearlFull = capacityPercent > 70;
  const isFull = lobby.isFull;

  const getCapacityColor = () => {
    if (isFull) return 'from-red-500 to-red-600';
    if (isNearlFull) return 'from-amber-500 to-amber-600';
    return 'from-emerald-500 to-emerald-600';
  };

  const getCapacityBgColor = () => {
    if (isFull) return 'bg-red-500/20 text-red-300';
    if (isNearlFull) return 'bg-amber-500/20 text-amber-300';
    return 'bg-emerald-500/20 text-emerald-300';
  };

  return (
    <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-5 hover:border-purple-500/60 transition-all hover:shadow-xl hover:shadow-purple-500/20">
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-indigo-500/0 group-hover:from-purple-500/10 group-hover:to-indigo-500/10 rounded-xl transition-all pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-2">
            <h3 className="font-bold text-white text-lg line-clamp-2 group-hover:text-purple-300 transition-colors">
              {lobby.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Hosted by {lobby.hostUsername}</p>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ml-2 ${
              lobby.status === 'ACTIVE'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-600/50 text-slate-300'
            }`}
          >
            {lobby.status === 'ACTIVE' ? '🟢 Active' : '⚫ Inactive'}
          </span>
        </div>

        {/* Lobby Info Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="bg-slate-700/30 rounded p-2">
            <span className="text-slate-400 block">Code</span>
            <span className="font-mono text-purple-300 font-bold">{lobby.lobbyCode}</span>
          </div>
          <div className="bg-slate-700/30 rounded p-2">
            <span className="text-slate-400 block">Participants</span>
            <span className={`font-bold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
              {lobby.currentCount}/{lobby.maxParticipants}
            </span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mb-4">
          <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden border border-slate-600/50">
            <div
              className={`h-full bg-gradient-to-r ${getCapacityColor()} transition-all duration-300`}
              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {isFull ? (
              <span className="text-red-400 font-bold">🔴 Lobby is full</span>
            ) : isNearlFull ? (
              <span className="text-amber-400">⚠️ Almost full - {lobby.maxParticipants - lobby.currentCount} spot{lobby.maxParticipants - lobby.currentCount !== 1 ? 's' : ''} left</span>
            ) : (
              <span className="text-emerald-400">✓ {lobby.maxParticipants - lobby.currentCount} spot{lobby.maxParticipants - lobby.currentCount !== 1 ? 's' : ''} available</span>
            )}
          </p>
        </div>

        {/* Timestamps */}
        <div className="text-xs text-slate-500 mb-4 pb-3 border-t border-slate-700/50 pt-3">
          <p>Created: {new Date(lobby.createdAt).toLocaleDateString()} {new Date(lobby.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        {/* Join Button */}
        <button
          onClick={() => onJoin(lobby.lobbyCode)}
          disabled={isFull || loading}
          className={`w-full py-2.5 font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2 ${
            isFull
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-lg hover:shadow-purple-500/30'
          }`}
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Joining...
            </>
          ) : isFull ? (
            <>
              🔒 Full
            </>
          ) : (
            <>
              👉 Join Lobby
            </>
          )}
        </button>
      </div>
    </div>
  );
}

