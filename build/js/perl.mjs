



















import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const wasmPath = path.join(here, 'perl.wasm');


const defaultLib = path.join(here, 'lib');

const wasmtime = process.env.WASMTIME || 'wasmtime';




export async function runPerl(args = [], { env = {}, mounts = {}, lib = defaultLib } = {}) {
  
  
  
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'perl-wasm-'));
  const devDir = path.join(scratch, 'dev');
  fs.mkdirSync(devDir);
  fs.writeFileSync(path.join(devDir, 'null'), '');

  const preopens = { '/dev': devDir, ...mounts };
  if (lib && fs.existsSync(lib)) preopens['/perl/lib'] = lib;

  
  
  const fullEnv = { PERL_SKIP_LOCALE_INIT: '1', ...env };

  
  
  
  
  const cli = ['run', '-W', 'exceptions=y'];
  for (const [k, v] of Object.entries(fullEnv)) cli.push('--env', `${k}=${v}`);
  for (const [guest, host] of Object.entries(preopens)) cli.push('--dir', `${host}::${guest}`);
  cli.push(wasmPath, ...args);

  try {
    const res = spawnSync(wasmtime, cli, {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    if (res.error) {
      if (res.error.code === 'ENOENT') {
        throw new Error(
          `wasmtime not found (looked for "${wasmtime}"). perl.wasm is a WASI `
          + `preview 2 component; install wasmtime or set the WASMTIME env var.`,
        );
      }
      throw res.error;
    }
    return {
      code: res.status ?? 1,
      stdout: res.stdout ?? '',
      stderr: res.stderr ?? '',
    };
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

export default runPerl;
