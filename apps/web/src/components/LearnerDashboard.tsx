import { useEffect,useState } from 'react';
import { authClient,authorizedFetch } from '../lib/auth';

type Enrollment={trackId:string;title:string;enrolledAt:string};
type Lesson={lessonId:string;contentVersion:string;completedAt:string};
type Progress={enrollments:Enrollment[];lessons:Lesson[]};
export default function LearnerDashboard(){
 const [email,setEmail]=useState('');const [message,setMessage]=useState('');
 const [signedIn,setSignedIn]=useState(false);const [loading,setLoading]=useState(true);
 const [progress,setProgress]=useState<Progress|null>(null);
 async function refresh(){
  try {const data=await authorizedFetch('/me/progress');setProgress(data.data);setMessage('');}
  catch(e){setMessage(e instanceof Error?e.message:'Unable to load progress');}
 }
 useEffect(()=>{
  const auth=authClient();
  let active=true;
  void auth.auth.getSession().then(({data})=>{
   if(!active)return;
   setSignedIn(Boolean(data.session));setLoading(false);
   if(data.session)void refresh();
  });
  const {data:{subscription}}=auth.auth.onAuthStateChange((_event,session)=>{
   if(!active)return;setSignedIn(Boolean(session));
   if(session)void refresh();else setProgress(null);
  });
  return ()=>{active=false;subscription.unsubscribe();};
 },[]);
 async function signIn(event:React.FormEvent){
  event.preventDefault();setMessage('');
  const {error}=await authClient().auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+'/dashboard'}});
  setMessage(error?error.message:'Check your email for a sign-in link.');
 }
 async function enroll(){
  try{await authorizedFetch('/me/enrollments',{method:'POST',body:JSON.stringify({trackId:'frontend-foundations'})});await refresh();}
  catch(e){setMessage(e instanceof Error?e.message:'Unable to enroll');}
 }
 return <section aria-label="Learner account">
  {loading?<p role="status">Checking session…</p>:signedIn?<>
   <p>You are signed in. Your learning progress is private.</p>
   <button type="button" onClick={()=>void authClient().auth.signOut()}>Sign out</button>
   <h2>Your learning paths</h2>
   {progress?.enrollments.length?<ul>{progress.enrollments.map(e=><li key={e.trackId}>{e.title} — <a href={`/tracks/${e.trackId}`}>View lessons</a></li>)}</ul>:<p>No enrollments yet.</p>}
   <button type="button" onClick={()=>void enroll()}>Enroll in Frontend Foundations</button>
   <h2>Completed lessons ({progress?.lessons.length??0})</h2>
   <ul>{progress?.lessons.map(l=><li key={l.lessonId}><a href={`/lessons/${l.lessonId}`}>{l.lessonId}</a></li>)}</ul>
  </>:<form onSubmit={e=>void signIn(e)}>
   <label htmlFor="learner-email">Email address</label>
   <input id="learner-email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" />
   <button type="submit">Email me a sign-in link</button>
  </form>}
  {message&&<p role="status" aria-live="polite">{message}</p>}
 </section>;
}
