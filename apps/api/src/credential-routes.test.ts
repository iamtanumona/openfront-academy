import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import type { CredentialStore } from './credentials.js';
const id='11111111-1111-4111-8111-111111111111';
const store:CredentialStore={
 publicKeys:()=>[],list:async()=>[],
 issue:async()=>({certificateId:id,created:true}),
 verify:async()=>({valid:true,revoked:false}),
 revoke:async()=>({revoked:true})
};
const app=createApp({ping:async()=>{},listTracks:async()=>[],verifyToken:async token=>{if(token!=='valid')throw new Error('invalid');return {id};},credentialStore:store},'http://localhost:4321');
describe('credential API',()=>{
 it('rejects unauthenticated issuance',async()=>expect((await app.request('/v1/certificates/issue',{method:'POST'})).status).toBe(401));
 it('validates request schema',async()=>expect((await app.request('/v1/certificates/issue',{method:'POST',headers:{authorization:'Bearer valid','content-type':'application/json'},body:JSON.stringify({trackId:'../x',curriculumVersion:'0.2.0'})})).status).toBe(400));
 it('issues for authenticated users',async()=>expect((await app.request('/v1/certificates/issue',{method:'POST',headers:{authorization:'Bearer valid','content-type':'application/json'},body:JSON.stringify({trackId:'frontend-foundations',curriculumVersion:'0.2.0'})})).status).toBe(201));
 it('verifies public certificate',async()=>expect((await app.request(`/v1/certificates/${id}/verify`)).status).toBe(200));
 it('rejects invalid certificate identifiers',async()=>expect((await app.request('/v1/certificates/bad/verify')).status).toBe(400));
});
