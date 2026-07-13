// Create app icons for PWA
function createGameIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(0, 0, size, size);
    
    // Scale factor
    const scale = size / 192;
    
    // Player triangle
    ctx.fillStyle = '#4ECDC4';
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.25);
    ctx.lineTo(size * 0.4, size * 0.4);
    ctx.lineTo(size * 0.6, size * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // Collectibles
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(size * 0.35, size * 0.55, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(size * 0.65, size * 0.55, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#95E1D3';
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.65, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    // Convert to PNG data URL
    return canvas.toDataURL('image/png');
}

// Create and download icons
if (typeof window !== 'undefined') {
    // Create 192x192 icon
    const icon192 = createGameIcon(192);
    const icon512 = createGameIcon(512);
    
    console.log('Icons created - you can save these data URLs as PNG files');
    console.log('192x192:', icon192.substring(0, 50) + '...');
    console.log('512x512:', icon512.substring(0, 50) + '...');
}

module.exports = { createGameIcon };