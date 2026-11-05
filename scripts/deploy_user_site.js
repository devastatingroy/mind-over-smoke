import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist');

console.log('1. Preparing dist folder for user root site...');
fs.writeFileSync(path.join(distPath, '.nojekyll'), '');
fs.copyFileSync(path.join(distPath, 'index.html'), path.join(distPath, '404.html'));

console.log('2. Pushing dist to devastatingroy.github.io main branch...');
try {
  execSync('git init', { cwd: distPath, stdio: 'inherit' });
  execSync('git checkout -B main', { cwd: distPath, stdio: 'inherit' });
  execSync('git add -A', { cwd: distPath, stdio: 'inherit' });
  execSync('git commit -m "deploy: MindOverSmoke root user site"', { cwd: distPath, stdio: 'inherit' });
  
  try {
    execSync('git remote remove user-origin', { cwd: distPath, stdio: 'ignore' });
  } catch (e) {}

  execSync('git remote add user-origin https://github.com/devastatingroy/devastatingroy.github.io.git', { cwd: distPath, stdio: 'inherit' });
  execSync('git push user-origin main --force', { cwd: distPath, stdio: 'inherit' });

  fs.rmSync(path.join(distPath, '.git'), { recursive: true, force: true });
  console.log('3. Successfully pushed to devastatingroy.github.io main branch!');
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
