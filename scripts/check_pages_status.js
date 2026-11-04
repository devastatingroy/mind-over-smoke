import { execSync } from 'child_process';

function getGitHubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    const creds = execSync('echo protocol=https\nhost=github.com | git credential fill', { encoding: 'utf-8' });
    const match = creds.match(/password=(.+)/);
    return match ? match[1].trim() : '';
  } catch (e) {
    return '';
  }
}

const token = getGitHubToken();

async function poll() {
  for (let i = 0; i < 15; i++) {
    const res = await fetch('https://api.github.com/repos/devastatingroy/mind-over-smoke/pages', {
      headers: {
        'Authorization': 'token ' + token,
        'User-Agent': 'MindOverSmoke-Deployer',
        'Accept': 'application/vnd.github+json'
      }
    });
    const data = await res.json();
    console.log(`Poll ${i+1}: status = ${data.status}`);
    if (data.status === 'built') {
      console.log('GitHub Pages is READY at', data.html_url);
      return data.html_url;
    }
    await new Promise(r => setTimeout(r, 4000));
  }
}

poll().catch(console.error);
