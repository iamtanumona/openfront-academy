import {useEffect,useRef,useState} from 'react';
import {grade,resultSchema,validateFiles,suiteSchema,type Suite} from '@ofa/exercise-engine';
import {makeSandboxDocument,type SourceFiles} from '../lib/sandbox';
type Props={title:string;starter:SourceFiles;suite:Suite;maxSourceBytes:number;maxRuntimeMs:number};
export default function CodePlayground({title,starter,suite,maxSourceBytes,maxRuntimeMs}:Props){
 const [files,setFiles]=useState<SourceFiles>(starter);
 const [run,setRun]=useState<{requestId:string;nonce:string;doc:string}|null>(null);
 const [status,setStatus]=useState('Edit code and select Run tests.');
 const [feedback,setFeedback]=useState<ReturnType<typeof grade>|null>(null);
 const iframe=useRef<HTMLIFrameElement>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const expected=useRef<{requestId:string;nonce:string}|null>(null);
 useEffect(()=>{
  function receive(event:MessageEvent){
   // srcDoc sandbox without allow-same-origin has an opaque origin.
   if(event.source!==iframe.current?.contentWindow || event.origin!=='null')return;
   const parsed=resultSchema.safeParse(event.data);
   if(!parsed.success||!expected.current)return;
   const result=parsed.data;
   if(result.requestId!==expected.current.requestId||result.nonce!==expected.current.nonce)return;
   if(timer.current)clearTimeout(timer.current);
   const scored=grade(suite,result.results);
   setFeedback(scored);setStatus(scored.passed?'All tests passed.':`Score: ${scored.score}%. Review the checks below.`);
  }
  window.addEventListener('message',receive);
  return()=>{window.removeEventListener('message',receive);if(timer.current)clearTimeout(timer.current)};
 },[suite]);
 function execute(){
  try{validateFiles(files,maxSourceBytes)}catch(e){setStatus(String(e));return;}
  if(timer.current)clearTimeout(timer.current);
  const requestId=crypto.randomUUID();
  const nonce=crypto.randomUUID()+crypto.randomUUID();
  expected.current={requestId,nonce};setFeedback(null);setStatus('Running checks…');
  setRun({requestId,nonce,doc:makeSandboxDocument(files,suite,requestId,nonce)});
  timer.current=setTimeout(()=>{expected.current=null;setRun(null);setStatus('Preview timed out; sandbox stopped.');},maxRuntimeMs);
 }
 return <section aria-label={`${title} coding exercise`} className="panel playground">
  <h2>{title}</h2><p>Runs locally in an isolated browser iframe. Practice results are not secure certification evidence.</p>
  {(['html','css','javascript'] as const).map(language=><div className="editor-field" key={language}>
   <label htmlFor={`code-${language}`}>{language==='javascript'?'JavaScript':language.toUpperCase()}</label>
   <textarea id={`code-${language}`} spellCheck={false} rows={language==='html'?9:5} value={files[language]} onChange={e=>setFiles(old=>({...old,[language]:e.target.value}))}/>
  </div>)}
  <div className="playground-actions"><button type="button" onClick={execute}>Run tests</button><button type="button" onClick={()=>{setFiles(starter);setRun(null);setFeedback(null);setStatus('Starter code restored.');}}>Reset</button></div>
  <p role="status" aria-live="polite">{status}</p>
  <h3>Preview</h3>
  {run?<iframe key={run.requestId} ref={iframe} title="Untrusted code preview" sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={run.doc} className="sandbox-preview"/>:<p>Run your code to see a preview.</p>}
  {feedback&&<section aria-label="Test feedback"><h3>Test results</h3><ul>{feedback.results.map(result=><li key={result.testId}>{result.passed?'Passed':'Failed'}: {result.testId}</li>)}</ul></section>}
 </section>;
}
