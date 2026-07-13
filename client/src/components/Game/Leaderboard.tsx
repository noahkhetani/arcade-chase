import React, { useState } from 'react';
import { useHighScore } from '../../lib/stores/useHighScore';
import { Trophy, Crown, Star, Zap, User, Calendar, Target, X, Medal, Sparkles } from 'lucide-react';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Leaderboard({ isOpen, onClose }: LeaderboardProps) {
  const { 
    personalHighScore, 
    allTimeHighScore, 
    leaderboard, 
    playerName, 
    setPlayerName,
    getTopScores,
    cleanupDuplicates,
    loadLeaderboard 
  } = useHighScore();
  
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  React.useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
      // Automatically clean duplicates when leaderboard loads
      cleanupDuplicates();
    }
  }, [isOpen, loadLeaderboard, cleanupDuplicates]);

  if (!isOpen) return null;

  const handleNameSave = () => {
    setPlayerName(tempName);
    setEditingName(false);
  };



  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-8 h-8 text-yellow-400" />;
      case 1: return <Trophy className="w-7 h-7 text-gray-300" />;
      case 2: return <Medal className="w-7 h-7 text-orange-400" />;
      default: return <Star className="w-6 h-6 text-purple-400" />;
    }
  };

  const topScores = getTopScores(10);

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="relative w-full max-w-6xl h-[95vh] mx-4 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-cyan-500/5 to-pink-500/5 animate-pulse"></div>
        
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 blur-xl"></div>
        
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-purple-500/20">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse"></div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent tracking-wider">
                  HALL OF FAME
                </h1>
                <p className="text-gray-400 text-lg font-medium mt-1">Elite Arcade Champions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 flex items-center justify-center border border-red-500/30 hover:border-red-500/50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Player Profile Section */}
          <div className="p-8">
            <div className="bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg"></div>
                  </div>
                  {editingName ? (
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-black/30 text-white px-6 py-3 rounded-xl border border-purple-500/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-xl font-bold"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleNameSave();
                          if (e.key === 'Escape') setEditingName(false);
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleNameSave}
                        className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-xl transition-all duration-200 font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingName(false)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl transition-all duration-200 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <h3 className="text-3xl font-bold text-white">{playerName}</h3>
                      <button
                        onClick={() => {
                          setTempName(playerName);
                          setEditingName(true);
                        }}
                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-all duration-200 border border-purple-500/30 hover:border-purple-400/50"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-black/20 rounded-xl p-6 border border-cyan-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-cyan-400" />
                    <span className="text-gray-300 font-medium">Personal Best</span>
                  </div>
                  <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
                    {personalHighScore.toLocaleString()}
                  </div>
                </div>
                <div className="bg-black/20 rounded-xl p-6 border border-yellow-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    <span className="text-gray-300 font-medium">World Record</span>
                  </div>
                  <div className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-mono">
                    {allTimeHighScore.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Champions Leaderboard */}
          <div className="flex-1 px-8 pb-8 overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <Target className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-black text-white">CHAMPIONS</h2>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500"></div>
            </div>
            
            {topScores.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-3xl border border-purple-500/20">
                <div className="relative mb-8">
                  <Trophy className="w-24 h-24 mx-auto text-purple-400/50" />
                  <div className="absolute inset-0 w-24 h-24 mx-auto bg-purple-400/10 rounded-full blur-2xl"></div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">The Arena Awaits</h3>
                <p className="text-gray-400 text-lg">Be the first legend to claim the throne!</p>
              </div>
            ) : (
              <div className="relative">
                {topScores.length > 5 && (
                  <div className="absolute top-0 right-0 z-10 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg text-sm font-medium border border-purple-500/30">
                    Scroll to see more →
                  </div>
                )}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 elite-scrollbar scroll-smooth hover:pr-2 transition-all duration-200">
                {topScores.map((entry, index) => (
                  <div 
                    key={entry.id || `${entry.playerName}-${entry.score}-${index}`}
                    className={`relative p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group overflow-hidden ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-yellow-500/20 border-2 border-yellow-400/60 shadow-2xl shadow-yellow-400/30'
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-400/20 via-gray-300/10 to-gray-400/20 border-2 border-gray-300/60 shadow-2xl shadow-gray-300/30'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-500/20 via-orange-400/10 to-orange-500/20 border-2 border-orange-400/60 shadow-2xl shadow-orange-400/30'
                        : 'bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-pink-500/10 border border-purple-500/30 hover:border-purple-400/60'
                    }`}
                  >
                    {/* Animated background particles for top 3 */}
                    {index < 3 && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className={`absolute w-32 h-32 rounded-full blur-xl opacity-30 animate-pulse ${
                          index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-orange-400'
                        } -top-16 -left-16`}></div>
                        <div className={`absolute w-20 h-20 rounded-full blur-lg opacity-20 animate-bounce ${
                          index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-orange-400'
                        } -bottom-10 -right-10`}></div>
                      </div>
                    )}
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {getRankIcon(index)}
                            {index < 3 && (
                              <div className="absolute inset-0 blur-lg opacity-60 animate-pulse">
                                {getRankIcon(index)}
                              </div>
                            )}
                          </div>
                          <div className={`text-3xl font-black px-4 py-2 rounded-xl ${
                            index === 0 ? 'bg-yellow-400/30 text-yellow-200 border border-yellow-400/50'
                            : index === 1 ? 'bg-gray-300/30 text-gray-100 border border-gray-300/50'
                            : index === 2 ? 'bg-orange-400/30 text-orange-200 border border-orange-400/50'
                            : 'bg-purple-400/30 text-purple-200 border border-purple-400/50'
                          }`}>
                            #{index + 1}
                          </div>
                        </div>
                        <div>
                          <div className={`font-black text-2xl group-hover:scale-105 transition-transform ${
                            index === 0 ? 'text-yellow-100' : index === 1 ? 'text-gray-100' : index === 2 ? 'text-orange-100' : 'text-white'
                          }`}>
                            {entry.playerName}
                          </div>
                          <div className="text-gray-400 flex items-center gap-3 mt-1">
                            <span className="font-medium">Level {entry.level || 1}</span>
                            <span>•</span>
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(entry.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-black text-4xl font-mono group-hover:scale-110 transition-transform ${
                          index === 0 ? 'text-yellow-400'
                          : index === 1 ? 'text-gray-300'
                          : index === 2 ? 'text-orange-400'
                          : 'text-purple-400'
                        }`}>
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-gray-500 text-sm font-medium">POINTS</div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}