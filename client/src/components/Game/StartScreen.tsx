import { useState } from 'react';
import { useGame } from '../../lib/stores/useGame';
import { useAudio } from '../../lib/stores/useAudio';
import { useHighScore } from '../../lib/stores/useHighScore';
import { FaPlay, FaCog, FaTrophy, FaVolumeUp, FaVolumeOff } from 'react-icons/fa';
import Leaderboard from './Leaderboard';
import SettingsModal from './SettingsModal';

function StartScreen() {
  const { resetGame, startTransition } = useGame();
  const { isMuted, toggleMute, initializeAudio } = useAudio();
  const { personalHighScore, allTimeHighScore, playerName } = useHighScore();
  
  const [showSettings, setShowSettings] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const handleStartGame = () => {
    try {
      initializeAudio();
    } catch (e) {}
    resetGame();
    startTransition("playing", "fadeIn");
  };

  const handleShowLeaderboard = () => {
    setLeaderboardOpen(true);
  };

  const quickStats = [
    { label: 'Personal Best', value: personalHighScore, color: 'text-[#00FF88]' },
    { label: 'All-Time Best', value: allTimeHighScore, color: 'text-[#FFB800]' },
    { label: 'Player', value: playerName || 'Anonymous', color: 'text-[#7000FF]', isText: true }
  ];

  return (
    <div className="relative w-full min-h-screen bg-[#0A0A1A] overflow-auto">
      <div className="relative z-10 flex flex-col w-full min-h-screen max-w-full">
        <header className="flex justify-between items-center p-6 lg:p-8">
          <button
            onClick={() => { initializeAudio(); toggleMute(); }}
            onTouchEnd={(e) => { e.preventDefault(); initializeAudio(); toggleMute(); }}
            className="p-3 rounded-full bg-[#12122A] hover:bg-[#1A1A3A] transition-all text-white border border-[#00FF88]/30 touch-manipulation"
          >
            {!isMuted ? <FaVolumeUp size={20} /> : <FaVolumeOff size={20} />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            onTouchEnd={(e) => { e.preventDefault(); setShowSettings(!showSettings); }}
            className="p-3 rounded-full bg-[#12122A] hover:bg-[#1A1A3A] transition-all text-white border border-[#00FF88]/30 touch-manipulation"
          >
            <FaCog size={20} />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 text-center">
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider"
              style={{
                color: '#00FF88',
                textShadow: '0 0 20px #00FF88, 0 0 40px #00FF88, 0 0 80px #00FF88'
              }}>
              NEON
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest mb-4"
              style={{
                background: 'linear-gradient(90deg, #FF006E, #7000FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              RUNNER
            </h2>
            <p className="text-[#888] text-sm tracking-[0.3em] uppercase">by NK</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 w-full max-w-lg">
            {quickStats.map((stat, index) => (
              <div key={stat.label} className="p-4 rounded-lg bg-[#12122A] border border-white/10 text-center">
                <p className="text-[#666] text-xs mb-1 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-xl lg:text-2xl font-bold ${stat.color}`}>
                  {stat.isText ? stat.value : typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleStartGame}
              onTouchEnd={(e) => { e.preventDefault(); handleStartGame(); }}
              className="px-10 py-4 rounded-lg text-black font-bold text-lg tracking-wider transition-all transform hover:scale-105 touch-manipulation"
              style={{
                background: '#00FF88',
                boxShadow: '0 0 20px #00FF88, 0 0 40px #00FF88'
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <FaPlay className="text-sm" />
                <span>PLAY</span>
              </div>
            </button>
            
            <button 
              onClick={handleShowLeaderboard}
              onTouchEnd={(e) => { e.preventDefault(); handleShowLeaderboard(); }}
              className="px-8 py-4 rounded-lg text-white font-bold text-lg tracking-wider border border-[#FF006E] transition-all hover:bg-[#FF006E]/10 hover:border-[#FF006E]/50 touch-manipulation"
            >
              <div className="flex items-center justify-center space-x-2">
                <FaTrophy className="text-sm" />
                <span>LEADERBOARD</span>
              </div>
            </button>
          </div>
        </div>

        <footer className="p-4 text-center text-[#444] text-xs">
          NK © 2026
        </footer>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <Leaderboard isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
    </div>
  );
}

export default StartScreen;