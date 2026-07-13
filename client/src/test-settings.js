// Test script to verify all settings functionality
// Run this in browser console to test settings integration

console.log('🔧 Testing Settings System Integration...');

// Test 1: Settings persistence
console.log('\n1. Testing Settings Persistence:');
const { gameSettings } = window;
if (gameSettings) {
  const currentSettings = gameSettings.getSettings();
  console.log('✓ Current settings loaded:', currentSettings);
  
  // Test master volume
  const oldVolume = currentSettings.audio.masterVolume;
  gameSettings.updateSetting('audio', 'masterVolume', 0.5);
  const newVolume = gameSettings.getSettings().audio.masterVolume;
  console.log(`✓ Volume updated: ${oldVolume} → ${newVolume}`);
  
  // Test FPS toggle
  const oldFPS = currentSettings.display.showFPS;
  gameSettings.updateSetting('display', 'showFPS', !oldFPS);
  const newFPS = gameSettings.getSettings().display.showFPS;
  console.log(`✓ FPS toggle: ${oldFPS} → ${newFPS}`);
  
  // Restore original settings
  gameSettings.updateSetting('audio', 'masterVolume', oldVolume);
  gameSettings.updateSetting('display', 'showFPS', oldFPS);
} else {
  console.log('❌ gameSettings not available on window');
}

// Test 2: Export/Import functionality
console.log('\n2. Testing Export/Import:');
try {
  const exported = gameSettings.exportSettings();
  const parsed = JSON.parse(exported);
  console.log('✓ Settings export successful');
  console.log('✓ Export contains all categories:', Object.keys(parsed));
  
  const importSuccess = gameSettings.importSettings(exported);
  console.log('✓ Import successful:', importSuccess);
} catch (error) {
  console.log('❌ Export/Import failed:', error);
}

// Test 3: Check FPS counter integration
console.log('\n3. Testing FPS Counter Integration:');
const fpsCounters = document.querySelectorAll('[class*="fps"]');
console.log(`Found ${fpsCounters.length} FPS-related elements`);

// Test 4: Check audio integration
console.log('\n4. Testing Audio Integration:');
// This would require audio context testing

// Test 5: Responsive design check
console.log('\n5. Testing Responsive Design:');
const settingsModal = document.querySelector('[class*="settings"]');
if (settingsModal) {
  console.log('✓ Settings modal found in DOM');
} else {
  console.log('⚠️  Settings modal not currently visible');
}

console.log('\n🎯 Settings test completed!');