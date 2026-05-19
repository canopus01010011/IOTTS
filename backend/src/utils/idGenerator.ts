import { randomBytes } from 'crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export function generateCode(prefix: string): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = '';

  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }

  return `${prefix}-${code}`;
}
