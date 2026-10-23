import {describe,it,expect} from 'vitest';
import {makeSandboxDocument,RUNNER_CSP} from './sandbox';
const suite={version:1,tests:[{id:'heading',testType:'dom-query',selector:'h1',assertion:'count-at-least',expected:1,weight:100}]} as Parameters<typeof makeSandboxDocument>[1];
describe('sandbox security invariants',()=>{
 it('denies network connections and forms',()=>{
  expect(RUNNER_CSP).toContain("connect-src 'none'");
  expect(RUNNER_CSP).toContain("form-action 'none'");
  expect(RUNNER_CSP).toContain("default-src 'none'");
 });
 it('escapes script terminators in learner code',()=>{
  const doc=makeSandboxDocument({html:'<h1>Hi</h1>',css:'',javascript:'console.log("</script><script>alert(1)</script>")'},suite,'req','nonce');
  expect(doc).toContain('<\\/script>');
  expect(doc).toContain('Content-Security-Policy');
 });
});
