import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Chrome Extension ZIP download route
router.get('/arcade-collector-chrome-extension.zip', (req, res) => {
  const zipPath = path.join(__dirname, '../public/arcade-collector-chrome-extension.zip');
  
  // Check if ZIP file exists
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="arcade-collector-chrome-extension.zip"');
    res.download(zipPath, 'arcade-collector-chrome-extension.zip');
  } else {
    // If ZIP doesn't exist, serve a message explaining how to build it
    res.status(404).json({
      error: 'Chrome Extension ZIP not found',
      message: 'To generate the Chrome Extension ZIP file, run: npm run build:chrome-extension',
      buildInstructions: [
        '1. Navigate to the chrome-extension directory',
        '2. Run: npm run package',
        '3. Copy the generated ZIP to server/public/'
      ]
    });
  }
});

export default router;