import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const OP_REF = /^op:\/\/[^/]+\/[^/]+\/[^/]+$/;

export function validateOnePasswordReference(reference) {
  const value = String(reference ?? '').trim();
  return {
    valid: OP_REF.test(value),
    warning: OP_REF.test(value) ? null : '1Password references must look like op://Vault/Item/field.'
  };
}

export function maskSecret(secret) {
  const value = String(secret ?? '').trim();
  if (value.length <= 8) return value ? '***' : '';
  return `${value.slice(0, 3)}...${value.slice(-4)}`;
}

export async function findOnePasswordCli({
  env = process.env,
  pathExists = existsSync,
  runner = runCommand
} = {}) {
  const pathResult = await runner({ command: 'op', args: ['--version'] });
  if (pathResult.exitCode === 0) return { ok: true, path: 'op', version: pathResult.stdout.trim() };

  const localAppData = env.LOCALAPPDATA;
  const candidates = localAppData
    ? [
        join(
          localAppData,
          'Microsoft',
          'WinGet',
          'Packages',
          'AgileBits.1Password.CLI_Microsoft.Winget.Source_8wekyb3d8bbwe',
          'op.exe'
        )
      ]
    : [];
  const path = candidates.find((candidate) => pathExists(candidate));
  return path
    ? { ok: true, path, version: null }
    : { ok: false, path: null, error: '1Password CLI was not found.' };
}

export async function resolveOnePasswordReference(reference, { opPath = 'op', runner = runCommand, account = '' } = {}) {
  const validation = validateOnePasswordReference(reference);
  if (!validation.valid) {
    return { ok: false, reference, error: validation.warning };
  }

  const args = ['read', reference];
  if (String(account ?? '').trim()) {
    args.push('--account', String(account).trim());
  }
  const result = await runner({ command: opPath, args });
  if (result.exitCode !== 0 || !String(result.stdout ?? '').trim()) {
    return {
      ok: false,
      reference,
      error: sanitizeError(result.stderr || result.stdout || '1Password reference did not resolve.')
    };
  }

  const secret = String(result.stdout).trim();
  return {
    ok: true,
    reference,
    masked: maskSecret(secret),
    getSecret: () => secret
  };
}

export function sanitizeError(error) {
  return String(error ?? '')
    .replaceAll(/\b(sk-[A-Za-z0-9_-]{8,})\b/g, '[redacted-secret]')
    .trim();
}

function runCommand({ command, args }) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(command, args, { windowsHide: true });
    } catch (error) {
      resolve({ exitCode: 1, stdout: '', stderr: error.message });
      return;
    }
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (error) => {
      resolve({ exitCode: 1, stdout, stderr: error.message });
    });
    child.on('close', (exitCode) => {
      resolve({ exitCode, stdout, stderr });
    });
  });
}
