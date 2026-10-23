import { describe,it,expect } from 'vitest';
import { generateKeyPairSync, createPublicKey } from 'node:crypto';
import { credentialBytes, signCredential, verifyCredential, issueSchema } from './credentials.js';
const {privateKey}=generateKeyPairSync('ed25519');
const payload={schemaVersion:'1.0' as const,id:'urn:uuid:11111111-1111-4111-8111-111111111111',issuer:'OpenFront Academy' as const,credentialType:'CourseCompletion' as const,trackId:'frontend-foundations',curriculumVersion:'0.2.0',subjectId:'subject',assuranceLevel:'self_paced_completion' as const,issuedAt:'2026-10-23T00:00:00.000Z'};
describe('credentials',()=>{
 it('signs and verifies',()=>{const signature=signCredential(payload,privateKey);expect(verifyCredential(payload,signature,createPublicKey(privateKey))).toBe(true);});
 it('rejects tampering',()=>{const signature=signCredential(payload,privateKey);expect(verifyCredential({...payload,trackId:'different'},signature,createPublicKey(privateKey))).toBe(false);});
 it('rejects malformed issue requests',()=>{expect(issueSchema.safeParse({trackId:'../bad',curriculumVersion:'0.2.0'}).success).toBe(false);});
 it('uses deterministic bytes',()=>expect(credentialBytes(payload).equals(credentialBytes({...payload}))).toBe(true));
});
