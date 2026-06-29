import { useGame } from "../../lib/stores/useGame";
import { useHighScore } from "../../lib/stores/useHighScore";
import { useAudio } from "../../lib/stores/useAudio";
import { Heart, Volume2, VolumeX, Shield, Zap, Magnet } from "lucide-react";

export default function GameUI() {
  const { score, level, lives, combo, comboTimer, activePowerUps, cheatMode, activeCheatEffects } = useGame();
  const { personalHighScore } = useHighScore();
  const { isMuted, toggleMute } = useAudio();

  const activeCheatsList = activeCheatEffects ? Object.entries(activeCheatEffects)
    .filter(([_, active]) => active)
    .map(([effect]) => effect) : [];

  return (
    <div className="game-ui">
      <div className="ui-top">
        <div className="score-display">
          <div className="score">{score.toLocaleString()}</div>
          <div className="high-score">PB: {personalHighScore.toLocaleString()}</div>
          {combo > 0 && (
            <div className="combo-display">
              <span className="combo-text">x{combo}</span>
              <div className="combo-bar">
                <div 
                  className="combo-progress" 
                  style={{ width: `${(comboTimer / 180) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="level-display">
          Lv {level}
          {(cheatMode || activeCheatsList.length > 0) && (
            <div className="cheat-indicator">
              CHEATS ON
              <div className="active-cheats">
                {activeCheatsList.map(effect => (
                  <span key={effect} className="cheat-effect">
                    {effect === 'godMode' && 'GOD'}
                    {effect === 'doubleScore' && '2X'}
                    {effect === 'superSpeed' && 'SPEED'}
                    {effect === 'infiniteLives' && '∞LIVES'}
                    {effect === 'autoCollect' && 'AUTO'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="controls">
          <button onClick={toggleMute} className="mute-button" aria-label={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
      
      <div className="ui-middle">
        {(activePowerUps.shield > 0 || activePowerUps.speed > 0 || activePowerUps.magnet > 0) && (
          <div className="power-ups-display">
            {activePowerUps.shield > 0 && (
              <div className="power-up-item shield">
                <Shield size={16} />
                <span>{Math.ceil(activePowerUps.shield / 60)}s</span>
              </div>
            )}
            {activePowerUps.speed > 0 && (
              <div className="power-up-item speed">
                <Zap size={16} />
                <span>{Math.ceil(activePowerUps.speed / 60)}s</span>
              </div>
            )}
            {activePowerUps.magnet > 0 && (
              <div className="power-up-item magnet">
                <Magnet size={16} />
                <span>{Math.ceil(activePowerUps.magnet / 60)}s</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="ui-bottom">
        <div className="lives-display">
          {Array.from({ length: lives }, (_, i) => (
            <Heart key={i} className="life-heart" fill="#FF006E" color="#FF006E" />
          ))}
        </div>
        <div className="instructions-label">WASD / Arrows</div>
      </div>
    </div>
  );
}
