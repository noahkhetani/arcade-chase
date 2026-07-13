// background script for the chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Arcade Collector extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // The popup will handle the game launch
});

// Storage utilities for high scores
const storage = {
  async get(key) {
    const result = await chrome.storage.local.get([key]);
    return result[key];
  },
  
  async set(key, value) {
    await chrome.storage.local.set({ [key]: value });
  }
};

// Export for use in game
if (typeof window !== 'undefined') {
  window.extensionStorage = storage;
}