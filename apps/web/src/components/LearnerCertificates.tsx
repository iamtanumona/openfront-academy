import {useEffect,useState} from 'react';
import {authorizedFetch} from '../lib/auth';
type Certificate={certificateId:string;trackId:string;curriculumVersion:string;issuedAt:string;revokedAt:string|null;verificationUrl:string};
export default function LearnerCertificates(){
 const [items,setItems]=useState<Certificate[]>([]);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 async function refresh(){try{const r=await authorizedFetch('/me/certificates');setItems(r.data);setMessage('');}catch(e){setMessage(e instanceof Error?e.message:'Unable to load certificates');}}
 useEffect(()=>{void refresh();},[]);
 async function issue(){setBusy(true);try{await authorizedFetch('/certificates/issue',{method:'POST',body:JSON.stringify({trackId:'frontend-foundations',curriculumVersion:'0.2.0'})});await refresh();}catch(e){setMessage(e instanceof Error?e.message:'Track is not yet complete');}finally{setBusy(false);}}
 return <section aria-labelledby="credentials-title"><h2 id="credentials-title">Completion certificates</h2><p>These certificates attest to self-paced lesson completion, not independent skill verification.</p>
 <button type="button" disabled={busy} onClick={()=>void issue()}>{busy?'Checking…':'Check eligibility and issue certificate'}</button>
 {message&&<p role="status">{message}</p>}
 {items.length?<ul>{items.map(c=><li key={c.certificateId}><a href={c.verificationUrl}>{c.trackId} — version {c.curriculumVersion}</a> {c.revokedAt?'(revoked)':''}</li>)}</ul>:<p>No certificates issued yet.</p>}</section>;
}
