#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
  // Set UTF-8 encoding for the current process
  process.stdout.setEncoding('utf8');
  process.stderr.setEncoding('utf8');
  
  const args = process.argv.slice(2);
  
  console.log('Starting tests...');
  
  const child = exec('npx playwright test --project=chromium ' + args.join(' '), {
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      LESSCHARSET: 'utf-8',
      LANG: 'en_US.UTF-8',
      LC_ALL: 'en_US.UTF-8'
    }
  });
  
  child.stdout?.setEncoding('utf8');
  child.stderr?.setEncoding('utf8');
  
  child.stdout?.on('data', (data) => {
    process.stdout.write(data);
  });
  
  child.stderr?.on('data', (data) => {
    process.stderr.write(data);
  });
  
  child.on('close', (code) => {
    process.exit(code || 0);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
