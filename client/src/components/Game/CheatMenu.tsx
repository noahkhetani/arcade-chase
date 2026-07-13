import React from 'react';
import { useGame } from '../../lib/stores/useGame';
import { X, Settings, Zap, Target, Users, Shield, Gamepad2 } from 'lucide-react';

interface CheatMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheatMenu({ isOpen, onClose }: CheatMenuProps) {
  const { activeCheatEffects, toggleCheatEffect, clearAllCheats } = useGame();

  if (!isOpen) return null;

  const cheatCategories = [
    {
      title: "Movement & Speed",
      icon: <Zap className="w-5 h-5" />,
      cheats: [
        { key: 'superSpeed', name: 'Super Speed', desc: 'Lightning fast movement' },
        { key: 'maxSpeed', name: 'Max Speed', desc: 'Ludicrous speed' },
        { key: 'slowMotion', name: 'Slow Motion', desc: 'Time slows down' },
        { key: 'timeFreeze', name: 'Time Freeze', desc: 'Everything slows' },
      ]
    },
    {
      title: "Player Size",
      icon: <Users className="w-5 h-5" />,
      cheats: [
        { key: 'bigPlayer', name: 'Big Player', desc: 'Giant player' },
        { key: 'tinyPlayer', name: 'Tiny Player', desc: 'Small player' },
        { key: 'gigaPlayer', name: 'Giga Player', desc: 'Massive player' },
        { key: 'microPlayer', name: 'Micro Player', desc: 'Microscopic player' },
      ]
    },
    {
      title: "Scoring",
      icon: <Target className="w-5 h-5" />,
      cheats: [
        { key: 'doubleScore', name: 'Double Score', desc: '2x points' },
        { key: 'tripleScore', name: 'Triple Score', desc: '3x points' },
        { key: 'scoreBoost', name: 'Score Boost', desc: '1.5x points' },
      ]
    },
    {
      title: "Lives & Survival",
      icon: <Shield className="w-5 h-5" />,
      cheats: [
        { key: 'godMode', name: 'God Mode', desc: 'Invincibility' },
        { key: 'infiniteLives', name: 'Infinite Lives', desc: 'Never lose lives' },
        { key: 'extraLives', name: 'Extra Lives', desc: 'Gain lives when hit' },
      ]
    },
    {
      title: "Gameplay",
      icon: <Gamepad2 className="w-5 h-5" />,
      cheats: [
        { key: 'noObstacles', name: 'No Obstacles', desc: 'Clear path' },
        { key: 'autoCollect', name: 'Auto Collect', desc: 'Items come to you' },
        { key: 'allPowerUps', name: 'All Power-ups', desc: 'Permanent abilities' },
        { key: 'rainbowMode', name: 'Rainbow Mode', desc: 'Psychedelic colors' },
      ]
    }
  ];

  const handleCheatToggle = (cheatKey: string) => {
    const { enableCheatMode } = useGame.getState();
    
    // Handle mutually exclusive cheats
    if (cheatKey === 'tripleScore' && activeCheatEffects.doubleScore) {
      toggleCheatEffect('doubleScore');
    } else if (cheatKey === 'doubleScore' && activeCheatEffects.tripleScore) {
      toggleCheatEffect('tripleScore');
    }

    // Handle size exclusivity
    const sizeEffects = ['bigPlayer', 'tinyPlayer', 'gigaPlayer', 'microPlayer'];
    if (sizeEffects.includes(cheatKey)) {
      sizeEffects.forEach(effect => {
        if (effect !== cheatKey && activeCheatEffects[effect as keyof typeof activeCheatEffects]) {
          toggleCheatEffect(effect as keyof typeof activeCheatEffects);
        }
      });
    }

    // Enable cheat mode when any cheat is activated
    enableCheatMode();
    
    toggleCheatEffect(cheatKey as keyof typeof activeCheatEffects);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-cyan-400 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-cyan-400 font-mono">CHEAT MENU</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cheat Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cheatCategories.map((category) => (
            <div key={category.title} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-cyan-400">{category.icon}</div>
                <h3 className="text-lg font-bold text-white font-mono">{category.title}</h3>
              </div>
              
              <div className="space-y-2">
                {category.cheats.map((cheat) => {
                  const isActive = activeCheatEffects[cheat.key as keyof typeof activeCheatEffects];
                  

                  return (
                    <button
                      key={cheat.key}
                      onClick={() => handleCheatToggle(cheat.key)}
                      className={`w-full text-left p-3 rounded border transition-all ${
                        isActive
                          ? 'bg-cyan-600 border-cyan-400 text-white'
                          : 'bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-semibold text-sm">{cheat.name}</div>
                      <div className="text-xs opacity-75">{cheat.desc}</div>
                      {isActive && (
                        <div className="text-xs mt-1 font-bold text-cyan-200">ACTIVE</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => clearAllCheats()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-mono transition-colors"
          >
            CLEAR ALL
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-mono transition-colors"
          >
            CLOSE MENU
          </button>
        </div>

        {/* Active Cheats Counter */}
        <div className="text-center mt-4 text-gray-400 text-sm font-mono">
          Active Cheats: {Object.values(activeCheatEffects).filter(Boolean).length}
        </div>
      </div>
    </div>
  );
}