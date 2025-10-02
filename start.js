// Simple cross-platform runner for dev servers without extra dependencies
// Usage: npm start (from repo root)

const { spawn } = require('child_process');
const path = require('path');

function run(cmd, args, cwd, name) {
  const proc = spawn(cmd, args, {
    cwd,
    shell: true,
    stdio: 'inherit',
  });
  proc.on('exit', (code) => {
    console.log(`[${name}] exited with code ${code}`);
  });
  return proc;
}

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

console.log('Starting Backend (http://localhost:5000) ...');
const backend = run('npm', ['run', 'dev'], backendDir, 'backend');

console.log('Starting Frontend (http://localhost:3000) ...');
const frontend = run('npm', ['run', 'dev'], frontendDir, 'frontend');

function shutdown() {
  if (backend && !backend.killed) backend.kill();
  if (frontend && !frontend.killed) frontend.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
