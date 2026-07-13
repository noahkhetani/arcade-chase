import React, { useState } from 'react';
import { Button } from '../ui/button';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Gamepad2, 
  Monitor, 
  Play, 
  Bell,
  RotateCcw,
  Download,
  Upload,
  Save
} from 'lucide-react';
import { useGameSettings, GameSettings } from '../../lib/gameSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSetting, resetToDefaults, exportSettings, importSettings } = useGameSettings();
  const [activeTab, setActiveTab] = useState<'audio' | 'controls' | 'display' | 'gameplay' | 'notifications'>('audio');
  const [importData, setImportData] = useState('');
  const [showImport, setShowImport] = useState(false);

  if (!isOpen) return null;

  const handleSliderChange = (
    category: string,
    key: string,
    value: number
  ) => {
    // Direct call with type assertion for simplicity
    (updateSetting as any)(category, key, value);
  };

  const handleToggleChange = (
    category: string,
    key: string,
    checked: boolean
  ) => {
    // Direct call with type assertion for simplicity
    (updateSetting as any)(category, key, checked);
  };

  const handleSelectChange = (
    category: string,
    key: string,
    value: string
  ) => {
    // Direct call with type assertion for simplicity
    (updateSetting as any)(category, key, value);
  };

  const handleExport = () => {
    const data = exportSettings();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neon-runner-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importSettings(importData)) {
      setShowImport(false);
      setImportData('');
      alert('Settings imported successfully!');
    } else {
      alert('Failed to import settings. Please check the file format.');
    }
  };

  const tabs = [
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'controls', label: 'Controls', icon: Gamepad2 },
    { id: 'display', label: 'Display', icon: Monitor },
    { id: 'gameplay', label: 'Gameplay', icon: Play },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-1 sm:p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-[98vh] sm:h-[95vh] md:max-h-[85vh] overflow-hidden border border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Game Settings</h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleExport}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleExport();
              }}
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white touch-manipulation"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button
              onClick={() => setShowImport(!showImport)}
              onTouchEnd={(e) => {
                e.preventDefault();
                setShowImport(!showImport);
              }}
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white touch-manipulation"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
            <Button
              onClick={resetToDefaults}
              onTouchEnd={(e) => {
                e.preventDefault();
                resetToDefaults();
              }}
              size="sm"
              variant="ghost"
              className="text-orange-400 hover:text-orange-300 touch-manipulation"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <button
              onClick={onClose}
              onTouchEnd={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="text-gray-400 hover:text-white transition-colors touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Import Section */}
        {showImport && (
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex space-x-2">
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste settings JSON here..."
                className="flex-1 bg-gray-700 text-white p-2 rounded text-sm"
                rows={3}
              />
              <Button 
                onClick={handleImport}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleImport();
                }}
                size="sm"
                className="touch-manipulation"
              >
                <Save className="w-4 h-4 mr-1" />
                Import
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-32 sm:w-48 bg-gray-800 border-r border-gray-700 flex-shrink-0">
            <div className="p-4 space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    setActiveTab(id);
                  }}
                  className={`w-full flex items-center space-x-2 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm transition-colors touch-manipulation ${
                    activeTab === id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden text-xs">{label.slice(0,4)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Audio Settings */}
              {activeTab === 'audio' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Audio Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Master Volume: {Math.round(settings.audio.masterVolume * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.audio.masterVolume}
                        onChange={(e) => handleSliderChange('audio', 'masterVolume', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Sound Effects</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.audio.soundEffects}
                          onChange={(e) => handleToggleChange('audio', 'soundEffects', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Background Music</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.audio.backgroundMusic}
                          onChange={(e) => handleToggleChange('audio', 'backgroundMusic', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Haptic Feedback</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.audio.hapticFeedback}
                          onChange={(e) => handleToggleChange('audio', 'hapticFeedback', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Controls Settings */}
              {activeTab === 'controls' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Control Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Joystick Mode</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.controls.joystickMode}
                          onChange={(e) => handleToggleChange('controls', 'joystickMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Joystick Sensitivity: {Math.round(settings.controls.joystickSensitivity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={settings.controls.joystickSensitivity}
                        onChange={(e) => handleSliderChange('controls', 'joystickSensitivity', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Touch Controls Opacity: {Math.round(settings.controls.touchControlsOpacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={settings.controls.touchControlsOpacity}
                        onChange={(e) => handleSliderChange('controls', 'touchControlsOpacity', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Invert Y-Axis</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.controls.invertYAxis}
                          onChange={(e) => handleToggleChange('controls', 'invertYAxis', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Settings */}
              {activeTab === 'display' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Display Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Show FPS Counter</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.display.showFPS}
                          onChange={(e) => handleToggleChange('display', 'showFPS', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Particle Effects</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.display.particleEffects}
                          onChange={(e) => handleToggleChange('display', 'particleEffects', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Screen Shake Effects</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.display.screenShake}
                          onChange={(e) => handleToggleChange('display', 'screenShake', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Color Blind Mode</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.display.colorBlindMode}
                          onChange={(e) => handleToggleChange('display', 'colorBlindMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Gameplay Settings */}
              {activeTab === 'gameplay' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Gameplay Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={settings.gameplay.difficultyLevel}
                        onChange={(e) => handleSelectChange('gameplay', 'difficultyLevel', e.target.value)}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                      >
                        <option value="easy">Easy</option>
                        <option value="normal">Normal</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Auto Save Progress</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.gameplay.autoSave}
                          onChange={(e) => handleToggleChange('gameplay', 'autoSave', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Show Hints</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.gameplay.showHints}
                          onChange={(e) => handleToggleChange('gameplay', 'showHints', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Pause on Focus Loss</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.gameplay.pauseOnFocusLoss}
                          onChange={(e) => handleToggleChange('gameplay', 'pauseOnFocusLoss', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Enable Notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.enabled}
                          onChange={(e) => handleToggleChange('notifications', 'enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {settings.notifications.enabled && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Game Updates</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications.gameUpdates}
                              onChange={(e) => handleToggleChange('notifications', 'gameUpdates', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Daily Challenges</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications.challenges}
                              onChange={(e) => handleToggleChange('notifications', 'challenges', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Play Reminders</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications.reminders}
                              onChange={(e) => handleToggleChange('notifications', 'reminders', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </>
                    )}

                    {!settings.notifications.enabled && (
                      <p className="text-sm text-gray-400">
                        Enable notifications to receive game updates, challenges, and reminders.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}