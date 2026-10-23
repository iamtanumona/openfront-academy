import { createPrivateKey, createPublicKey, sign, verify, type KeyObject } from 'node:crypto';
import { z } from 'zod';

export const issueSchema = z.object({trackId:z.string().regex(/^[a-z0-9-]{1,120}$/),curriculumVersion:z.string().regex(/^\d+\.\d+\.\d+$/)}).strict();
export const revokeSchema = z.object({reasonCode:z.enum(['issued_in_error','policy_violation','other'])}).strict();
export type CredentialPayload = {
 schemaVersion:'1.0'; id:string; issuer:'OpenFront Academy'; credentialType:'CourseCompletion';
 trackId:string; curriculumVersion:string; subjectId:string;
 assuranceLevel:'self_paced_completion'; issuedAt:string;
};
// Fixed schema and insertion order; payload is signed as UTF-8 JSON bytes.
// Do not change serialization without introducing a new schemaVersion.
export function credentialBytes(p:CredentialPayload):Buffer {
 return Buffer.from(JSON.stringify({schemaVersion:p.schemaVersion,id:p.id,issuer:p.issuer,
 credentialType:p.credentialType,trackId:p.trackId,curriculumVersion:p.curriculumVersion,
 subjectId:p.subjectId,assuranceLevel:p.assuranceLevel,issuedAt:p.issuedAt}),'utf8');
}
export function signingKeys(pem:string,keyId:string){
 const privateKey=createPrivateKey(pem);
 if(privateKey.asymmetricKeyType!=='ed25519')throw new Error('Signing key must be Ed25519');
 const publicKey=createPublicKey(privateKey);
 return {keyId,privateKey,publicKey};
}
export function signCredential(payload:CredentialPayload,key:KeyObject):string {
 return sign(null,credentialBytes(payload),key).toString('base64url');
}
export function verifyCredential(payload:CredentialPayload,signature:string,key:KeyObject):boolean {
 try{return verify(null,credentialBytes(payload),key,Buffer.from(signature,'base64url'));}
 catch{return false;}
}
export type CredentialStore = {
 issue(userId:string,input:z.infer<typeof issueSchema>):Promise<unknown>;
 list(userId:string):Promise<unknown[]>;
 verify(id:string):Promise<unknown|null>;
 revoke(actorUserId:string,id:string,reasonCode:z.infer<typeof revokeSchema>['reasonCode']):Promise<unknown>;
 publicKeys():unknown[];
};
