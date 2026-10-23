import { serve } from '@hono/node-server';
import { config } from './config.js';
import { pool } from './db/client.js';
import { createApp } from './app.js';
import { supabaseVerifier } from './auth.js';
import { postgresCredentialStore } from './db/credential-store.js';
import { postgresProgressStore } from './db/progress-store.js';

const app=createApp({
 ping:async()=>{await pool.query('SELECT 1');},
 listTracks:async()=>{
  const result=await pool.query('SELECT id,slug,title,curriculum_version AS "curriculumVersion" FROM tracks WHERE published=true ORDER BY title');
  return result.rows;
 },
 verifyToken:supabaseVerifier(config.AUTH_ISSUER,config.AUTH_AUDIENCE),
 progressStore:postgresProgressStore(pool),
 ...(config.CREDENTIAL_PRIVATE_KEY_PEM?{credentialStore:postgresCredentialStore(pool,config.CREDENTIAL_PRIVATE_KEY_PEM.replace(/\\n/g,'\n'),config.CREDENTIAL_KEY_ID,config.PUBLIC_WEB_URL)}:{})
},config.WEB_ORIGIN);
const server=serve({fetch:app.fetch,port:config.PORT,hostname:config.HOST});
console.log(`OpenFront API listening on ${config.HOST}:${config.PORT}`);
for(const signal of ['SIGINT','SIGTERM'] as const) process.on(signal,()=>server.close(()=>{void pool.end().then(()=>process.exit(0));}));
