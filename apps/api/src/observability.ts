import type { MiddlewareHandler } from 'hono';
import { randomUUID } from 'node:crypto';
/** Privacy-safe request logging: no tokens, query strings, bodies or source code. */
export function requestObservability(): MiddlewareHandler {
 return async (c,next)=>{
  const requestId=randomUUID(); const start=performance.now();
  c.header('X-Request-ID',requestId);
  try { await next(); } finally {
   const ms=Math.round(performance.now()-start);
   const route=c.req.routePath || 'unmatched';
   console.log(JSON.stringify({event:'http_request',requestId,method:c.req.method,route,status:c.res.status,durationMs:ms}));
  }
 };
}
