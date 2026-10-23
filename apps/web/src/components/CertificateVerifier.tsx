import {useEffect,useState} from 'react';
import {apiBase} from '../lib/auth';
export default function CertificateVerifier({id}:{id:string}){
 const [result,setResult]=useState<any>(null);const [error,setError]=useState('');
 useEffect(()=>{const controller=new AbortController();fetch(`${apiBase}/certificates/${encodeURIComponent(id)}/verify`,{signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('Certificate not found or verification unavailable');return r.json();}).then(r=>setResult(r.data)).catch(e=>{if(!controller.signal.aborted)setError(e.message);});return()=>controller.abort();},[id]);
 return <section aria-live="polite">{error?<p role="alert">{error}</p>:!result?<p>Checking certificate…</p>:<><h2>{result.valid?'Signature valid and not revoked':'Certificate cannot be verified as valid'}</h2><dl><dt>Track</dt><dd>{result.trackId}</dd><dt>Curriculum version</dt><dd>{result.curriculumVersion}</dd><dt>Credential assurance</dt><dd>Self-paced completion only</dd><dt>Signature</dt><dd>{result.signatureVerified?'Verified':'Invalid'}</dd><dt>Revocation</dt><dd>{result.revoked?'Revoked':'Not revoked'}</dd></dl></>}</section>;
}
