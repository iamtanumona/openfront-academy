import { describe,expect,it,vi } from 'vitest';
import { createApp } from './app.js';
import type { ProgressStore } from './progress.js';
const user='11111111-1111-4111-8111-111111111111';
const store:ProgressStore={
 profile:vi.fn(async id=>({id})),
 progress:vi.fn(async()=>({enrollments:[],lessons:[]})),
 enroll:vi.fn(async(_id,input)=>({created:true,trackId:input.trackId})),
 completeLesson:vi.fn(async(_id,lessonId)=>({lessonId})),
 submit:vi.fn(async()=>({submissionId:'example',trustedAssessment:false}))
};
const app=createApp({ping:async()=>{},listTracks:async()=>[],verifyToken:async token=>{
 if(token!=='valid') throw new Error('invalid');return {id:user};
},progressStore:store},'http://localhost:4321');
const auth={authorization:'Bearer valid'};
describe('Sprint 4 authorization and validation',()=>{
 it('rejects missing credentials',async()=>{expect((await app.request('/v1/me/progress')).status).toBe(401);});
 it('rejects invalid bearer tokens',async()=>{expect((await app.request('/v1/me',{headers:{authorization:'Bearer bad'}})).status).toBe(401);});
 it('uses token identity for reads',async()=>{
  const response=await app.request('/v1/me/progress',{headers:auth});
  expect(response.status).toBe(200);expect(store.progress).toHaveBeenCalledWith(user);
 });
 it('does not accept client userId as enrollment input',async()=>{
  const response=await app.request('/v1/me/enrollments',{method:'POST',headers:{...auth,'content-type':'application/json'},body:JSON.stringify({trackId:'frontend-foundations',userId:'attacker'})});
  expect(response.status).toBe(400);
 });
 it('validates formative scores',async()=>{
  const response=await app.request('/v1/submissions',{method:'POST',headers:{...auth,'content-type':'application/json'},body:JSON.stringify({exerciseId:'a',exerciseVersion:'1.0.0',score:999,passed:true,results:[]})});
  expect(response.status).toBe(400);
 });
 it('enrolls using verified user ID',async()=>{
  const response=await app.request('/v1/me/enrollments',{method:'POST',headers:{...auth,'content-type':'application/json'},body:JSON.stringify({trackId:'frontend-foundations'})});
  expect(response.status).toBe(201);expect(store.enroll).toHaveBeenCalledWith(user,{trackId:'frontend-foundations'});
 });
});
