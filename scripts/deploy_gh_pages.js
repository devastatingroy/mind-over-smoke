import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist');

console.log('1. Preparing dist folder for GitHub Pages...');

// Create .nojekyll to prevent Jekyll from altering files
fs.writeFileSync(path.join(distPath, '.nojekyll'), '');

// Copy index.html to 404.html for SPA fallback
fs.copyFileSync(path.join(distPath, 'index.html'), path.join(distPath, '404.html'));

console.log('2. Pushing dist to gh-pages branch...');
try {
  // Execute git commands inside dist
  execSync('git init', { cwd: distPath, stdio: 'inherit' });
  execSync('git checkout -B gh-pages', { cwd: distPath, stdio: 'inherit' });
  execSync('git add -A', { cwd: distPath, stdio: 'inherit' });
  execSync('git commit -m "deploy: release MindOverSmoke on GitHub Pages"', { cwd: distPath, stdio: 'inherit' });
  
  // Set remote and push
  try {
    execSync('git remote remove origin', { cwd: distPath, stdio: 'ignore' });
  } catch (e) {}
  
  execSync('git remote add origin https://github.com/devastatingroy/mind-over-smoke.git', { cwd: distPath, stdio: 'inherit' });
  execSync('git push origin gh-pages --force', { cwd: distPath, stdio: 'inherit' });

  // Clean up .git directory inside dist
  fs.rmSync(path.join(distPath, '.git'), { recursive: true, force: true });

  console.log('3. Successfully pushed dist to gh-pages branch!');
} catch (err) {
  console.error('Deployment error:', err);
  process.exit(1);
}
