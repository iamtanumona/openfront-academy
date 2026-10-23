import { randomUUID, createHash } from 'node:crypto';
import type { Pool } from 'pg';
import { type CredentialStore, type CredentialPayload, signingKeys, signCredential, verifyCredential } from '../credentials.js';
import { DomainError } from './progress-store.js';

export function postgresCredentialStore(pool:Pool,privateKeyPem:string,keyId:string,publicBaseUrl:string):CredentialStore {
 const keys=signingKeys(privateKeyPem,keyId);
 const url=publicBaseUrl.replace(/\/$/,'');
 const publicKey=keys.publicKey.export({type:'spki',format:'pem'}).toString();
 async function status(id:string){
  const r=await pool.query(`SELECT c.id,c.track_id AS "trackId",c.curriculum_version AS "curriculumVersion",c.payload,c.signature,c.signing_key_id AS "signingKeyId",c.issued_at AS "issuedAt",r.revoked_at AS "revokedAt" FROM certificates c LEFT JOIN certificate_revocations r ON r.certificate_id=c.id WHERE c.id=$1`,[id]);
  return r.rows[0]??null;
 }
 return {
  publicKeys:()=>[{kid:keyId,algorithm:'Ed25519',publicKeyPem:publicKey}],
  async issue(userId,input){
   const client=await pool.connect();
   try{
    await client.query('BEGIN');
    // Serialize issuance per user+track+version, including concurrent retries.
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`${userId}:${input.trackId}:${input.curriculumVersion}`]);
    const existing=await client.query(`SELECT id FROM certificates WHERE user_id=$1 AND track_id=$2 AND curriculum_version=$3`,[userId,input.trackId,input.curriculumVersion]);
    if(existing.rowCount){await client.query('COMMIT');return {certificateId:existing.rows[0].id,verificationUrl:`${url}/verify/?id=${existing.rows[0].id}`,created:false};}
    const track=await client.query(`SELECT id FROM tracks WHERE id=$1 AND curriculum_version=$2 AND published=true`,[input.trackId,input.curriculumVersion]);
    if(!track.rowCount)throw new DomainError('TRACK_NOT_AVAILABLE',404);
    const enrolled=await client.query('SELECT 1 FROM enrollments WHERE user_id=$1 AND track_id=$2',[userId,input.trackId]);
    if(!enrolled.rowCount)throw new DomainError('NOT_ENROLLED',422);
    // The published track's required modules must have lessons; every published lesson must be completed at the CURRENT version.
    const eligibility=await client.query(`SELECT COUNT(*)::int AS total,
      COUNT(lp.lesson_id)::int AS completed
      FROM lessons l JOIN track_modules tm ON tm.module_id=l.module_id
      LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=$1 AND lp.completed_version=l.content_version
      WHERE tm.track_id=$2 AND l.published=true`,[userId,input.trackId]);
    const {total,completed}=eligibility.rows[0];
    if(total===0||completed!==total)throw new DomainError('TRACK_INCOMPLETE',422);
    const id=randomUUID();const issuedAt=new Date().toISOString();
    // Domain-separated pseudonymous subject identifier; not an email or public user UUID.
    const subjectId=createHash('sha256').update(`ofa-subject-v1:${userId}`).digest('hex');
    const payload:CredentialPayload={schemaVersion:'1.0',id:`urn:uuid:${id}`,issuer:'OpenFront Academy',credentialType:'CourseCompletion',trackId:input.trackId,curriculumVersion:input.curriculumVersion,subjectId,assuranceLevel:'self_paced_completion',issuedAt};
    const signature=signCredential(payload,keys.privateKey);
    await client.query(`INSERT INTO certificates(id,user_id,track_id,curriculum_version,credential_type,payload,signature,signing_key_id,issued_at)
      VALUES($1,$2,$3,$4,'completion',$5::jsonb,$6,$7,$8)`,[id,userId,input.trackId,input.curriculumVersion,JSON.stringify(payload),signature,keyId,issuedAt]);
    await client.query(`INSERT INTO credential_audit_events(certificate_id,actor_user_id,action) VALUES($1,$2,'issued')`,[id,userId]);
    await client.query('COMMIT');
    return {certificateId:id,verificationUrl:`${url}/verify/?id=${id}`,created:true,assuranceLevel:'self_paced_completion'};
   }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  },
  async list(userId){const r=await pool.query(`SELECT c.id AS "certificateId",c.track_id AS "trackId",c.curriculum_version AS "curriculumVersion",c.issued_at AS "issuedAt",r.revoked_at AS "revokedAt" FROM certificates c LEFT JOIN certificate_revocations r ON r.certificate_id=c.id WHERE c.user_id=$1 ORDER BY c.issued_at DESC`,[userId]);return r.rows.map(row=>({...row,verificationUrl:`${url}/verify/?id=${row.certificateId}`}));},
  async verify(id){const c=await status(id);if(!c)return null;
   const validSignature=c.signingKeyId===keyId&&verifyCredential(c.payload,c.signature,keys.publicKey);
   return {certificateId:id,valid:validSignature&&!c.revokedAt,signatureVerified:validSignature,revoked:Boolean(c.revokedAt),credentialType:'CourseCompletion',trackId:c.trackId,curriculumVersion:c.curriculumVersion,assuranceLevel:'self_paced_completion',issuedAt:c.issuedAt};
  },
  async revoke(actorUserId,id,reasonCode){
   // Administrative action: route must check privileged role; this method does not grant access.
   const client=await pool.connect();try{await client.query('BEGIN');
    const r=await client.query('SELECT id FROM certificates WHERE id=$1 FOR UPDATE',[id]);
    if(!r.rowCount)throw new DomainError('CERTIFICATE_NOT_FOUND',404);
    const inserted=await client.query('INSERT INTO certificate_revocations(certificate_id,reason_code) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING certificate_id',[id,reasonCode]);
    if(inserted.rowCount)await client.query(`INSERT INTO credential_audit_events(certificate_id,actor_user_id,action,reason_code) VALUES($1,$2,'revoked',$3)`,[id,actorUserId,reasonCode]);
    await client.query('COMMIT');return {certificateId:id,revoked:true,created:Boolean(inserted.rowCount)};
   }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  }
 };
}
