import { describe,it,expect } from 'vitest';
import {lessonSchema,trackSchema,testsSchema} from './index.js';
describe('curriculum schema',()=>{
 it('rejects invalid lesson objectives',()=>expect(()=>lessonSchema.parse({id:'bad'})).toThrow());
 it('rejects executable test payloads',()=>expect(()=>testsSchema.parse({version:1,tests:[{id:'x',testType:'dom-query',selector:'h1',assertion:'count-at-least',expected:1,weight:1,code:'alert(1)'}]})).toThrow());
 it('rejects tracks without modules',()=>expect(()=>trackSchema.parse({id:'x',version:'1.0.0',locale:'en',title:'Sample',description:'A sufficiently long description',level:'beginner',modules:[],completion:{requireAllLessons:true,requireCapstone:false,credentialType:'completion'}})).toThrow());
});
