import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// 1. Run npm run build
execSync('npm run build', { stdio: 'inherit' });

// 2. Read the dist/wrangler.json file
const wranglerPath = join('dist', 'wrangler.json');
const wranglerConfig = JSON.parse(readFileSync(wranglerPath, 'utf-8'));

// 3. Removes the assets key
delete wranglerConfig.assets;

// 4. Writes the modified wrangler.json back to dist/wrangler.json
writeFileSync(wranglerPath, JSON.stringify(wranglerConfig, null, 2));

// 5. Run npx wrangler pages deploy dist
execSync('npx wrangler pages deploy dist', { stdio: 'inherit' });
