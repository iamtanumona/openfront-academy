import {describe,it,expect} from 'vitest';
import {grade,suiteSchema,resultSchema,validateFiles,safeJson} from './index';
const suite=suiteSchema.parse({version:1,tests:[{id:'a',testType:'dom-query',selector:'h1',assertion:'count-at-least',expected:1,weight:50},{id:'b',testType:'dom-query',selector:'main',assertion:'count-exactly',expected:1,weight:50}]});
describe('formative grading',()=>{
 it('computes weighted score',()=>expect(grade(suite,[{testId:'a',passed:true,actual:1},{testId:'b',passed:false,actual:0}]).score).toBe(50));
 it('rejects executable assertions',()=>expect(()=>suiteSchema.parse({version:1,tests:[{id:'a',testType:'eval',code:'alert(1)'}]})).toThrow());
 it('validates result protocol',()=>expect(resultSchema.safeParse({type:'OFA_RESULT',nonce:'x',requestId:'bad',results:[]}).success).toBe(false));
 it('rejects oversized source',()=>expect(()=>validateFiles({html:'123456',css:'',javascript:''},3)).toThrow());
 it('escapes HTML delimiters',()=>expect(safeJson('</script>')).not.toContain('</script>'));
});
