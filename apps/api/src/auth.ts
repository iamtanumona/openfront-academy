import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Context, Next } from 'hono';

export type AuthUser = { id: string };
export type AuthVerifier = (token: string) => Promise<AuthUser>;
export function supabaseVerifier(issuer: string, audience: string): AuthVerifier {
  const url = new URL(issuer.replace(/\/$/, '') + '/.well-known/jwks.json');
  const jwks = createRemoteJWKSet(url);
  return async token => {
    const { payload } = await jwtVerify(token, jwks, { issuer, audience, algorithms: ['ES256', 'RS256'] });
    if (typeof payload.sub !== 'string' || !/^[0-9a-f-]{36}$/i.test(payload.sub)) throw new Error('Invalid subject');
    return { id: payload.sub };
  };
}
export function requireAuth(verify: AuthVerifier) {
  return async (c: Context, next: Next) => {
    const header = c.req.header('authorization') ?? '';
    const match = /^Bearer (\S+)$/i.exec(header);
    if (!match) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
    try {
      const user = await verify(match[1]);
      c.set('userId', user.id);
      await next();
    } catch {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401);
    }
  };
}
