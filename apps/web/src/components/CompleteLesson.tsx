import { useState } from 'react';
import { authorizedFetch } from '../lib/auth';
export default function CompleteLesson({lessonId,contentVersion}:{lessonId:string;contentVersion:string}){
 const [status,setStatus]=useState('');
 async function complete(){
  try{
   await authorizedFetch(`/me/lessons/${encodeURIComponent(lessonId)}/progress`,{method:'PUT',body:JSON.stringify({contentVersion,status:'completed'})});
   setStatus('Lesson completion saved.');
  }catch(e){setStatus(e instanceof Error?e.message:'Could not save progress');}
 }
 return <section aria-label="Lesson progress"><button type="button" onClick={()=>void complete()}>Mark lesson complete</button><p role="status" aria-live="polite">{status}</p></section>;
}
