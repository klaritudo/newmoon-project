import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function globalSetup() {
  // Create test-results directory if it doesn't exist
  const testResultsDir = path.join(__dirname, '..', 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
    console.log('📁 Created test-results directory');
  }

  // Check if the development server is running
  try {
    const response = await fetch('http://125.187.89.85:5173');
    if (response.ok) {
      console.log('✅ Development server is running on http://125.187.89.85:5173');
    } else {
      console.log('⚠️ Development server responded with status:', response.status);
    }
  } catch (error) {
    console.log('❌ Development server is not running. Please start it with: npm run dev');
    console.log('Error:', error.message);
  }

  console.log('🚀 Global setup complete');
}

export default globalSetup;