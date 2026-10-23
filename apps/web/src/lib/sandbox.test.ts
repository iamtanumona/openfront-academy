import {describe,it,expect} from 'vitest';
import {makeSandboxDocument,RUNNER_CSP} from './sandbox';
const suite={version:1 as const,tests:[{id:'h',testType:'dom-query' as const,selector:'h1',assertion:'count-at-least' as const,expected:1,weight:100}]};
describe('sandbox boundaries',()=>{
 it('blocks outbound network via CSP',()=>expect(RUNNER_CSP).toContain("connect-src 'none'"));
 it('blocks forms and nested frames',()=>{expect(RUNNER_CSP).toContain("form-action 'none'");expect(RUNNER_CSP).toContain("frame-src 'none'")});
 it('does not interpolate a closing learner script',()=>{
  const doc=makeSandboxDocument({html:'<h1>Hi</h1>',css:'',javascript:'console.log("</script><script>bad()</script>")'},suite,crypto.randomUUID(),'nonce_nonce_nonce_123');
  expect(doc).toContain('<\\/script>');
 });
 it('does not permit remote scripts by policy',()=>expect(RUNNER_CSP).not.toContain('https:'));
});
