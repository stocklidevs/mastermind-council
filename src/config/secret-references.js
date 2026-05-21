const ENV_NAME = /^[A-Z_][A-Z0-9_]*$/;
const PLAINTEXT_PATTERNS = [/^sk-[A-Za-z0-9_-]{20,}/, /^sk-proj-[A-Za-z0-9_-]{20,}/, /^sk-ant-[A-Za-z0-9_-]{20,}/];

export function looksLikePlaintextSecret(value) {
  return PLAINTEXT_PATTERNS.some((pattern) => pattern.test(String(value ?? '').trim()));
}

export function validateSecretReference({ mode, reference }) {
  const value = String(reference ?? '').trim();

  if (looksLikePlaintextSecret(value)) {
    return {
      valid: false,
      warning: 'Use a secret reference, not a plaintext API key.'
    };
  }

  if (mode === 'environment') {
    return ENV_NAME.test(value)
      ? { valid: true, warning: null }
      : { valid: false, warning: 'Environment references must look like OPENAI_API_KEY.' };
  }

  if (mode === 'one-password') {
    return value.startsWith('op://')
      ? { valid: true, warning: null }
      : { valid: false, warning: '1Password references must start with op://.' };
  }

  return {
    valid: false,
    warning: 'Choose environment or 1Password reference mode.'
  };
}

export function formatSecretReference({ mode, reference }) {
  const value = String(reference ?? '').trim();
  if (!value) return 'Not configured';
  if (mode === 'environment') return `Environment: ${value}`;
  if (mode === 'one-password') {
    const parts = value.split('/');
    const field = parts.at(-1) ?? 'field';
    const vault = parts[2] ?? 'vault';
    return `1Password: op://${vault}/.../${field}`;
  }
  return 'Unknown reference';
}
