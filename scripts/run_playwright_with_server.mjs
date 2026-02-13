import { spawn } from 'node:child_process';

const root = process.cwd();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: root,
    stdio: 'ignore',
    windowsHide: true,
  });

  let done = false;
  const stopServer = () => {
    if (done) return;
    done = true;
    if (!server.killed) {
      server.kill('SIGTERM');
    }
  };

  process.on('exit', stopServer);
  process.on('SIGINT', () => {
    stopServer();
    process.exit(130);
  });

  await sleep(1500);

  const args = [
    'scripts/web_game_playwright_client.js',
    '--url',
    'http://localhost:5173',
    '--actions-file',
    './test/actions-smoke.json',
    '--iterations',
    '2',
    '--pause-ms',
    '250',
    '--screenshot-dir',
    './output/web-game',
  ];

  const client = spawn(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
  });

  client.on('exit', (code) => {
    stopServer();
    process.exit(code ?? 1);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
