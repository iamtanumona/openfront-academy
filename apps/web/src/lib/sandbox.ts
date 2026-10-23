import { safeJson, type Suite } from '@ofa/exercise-engine';
export type SourceFiles={html:string;css:string;javascript:string};
export const RUNNER_CSP="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'";
function escapeClosingScript(text:string){return text.replace(/<\/script/gi,'<\\/script').replace(/<!--/g,'<\\!--');}
function escapeStyle(text:string){return text.replace(/<\/style/gi,'<\\/style');}
export function makeSandboxDocument(files:SourceFiles,suite:Suite,requestId:string,nonce:string){
 const data=safeJson({suite,requestId,nonce});
 // Trusted evaluator is appended after learner JS; results are formative and forgeable.
 const bootstrap=`(function(){
  const config=${data};
  const results=[];
  for(const t of config.suite.tests){
   try { const count=document.querySelectorAll(t.selector).length;
    results.push({testId:t.id,actual:count,passed:t.assertion==='count-at-least'?count>=t.expected:count===t.expected});
   }catch(e){results.push({testId:t.id,actual:0,passed:false});}
  }
  parent.postMessage({type:'OFA_RESULT',requestId:config.requestId,nonce:config.nonce,results},'*');
 })();`;
 const learner=escapeClosingScript(files.javascript);
 const html=files.html.replace(/<script\b[^>]*src\s*=/gi,'<script data-blocked-src=');
 return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${RUNNER_CSP}"><meta name="referrer" content="no-referrer"><style>${escapeStyle(files.css)}</style></head><body>${html}<script>${learner}</script><script>${bootstrap}</script></body></html>`;
}
