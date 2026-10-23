import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import {trackSchema,moduleSchema,lessonSchema,exerciseSchema,testsSchema} from './index.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../../content');
const files=(dir:string):string[]=>existsSync(dir)?readdirSync(dir).flatMap(n=>{const path=join(dir,n);return statSync(path).isDirectory()?files(path):[path]}):[];
const errors:string[]=[];
const parse=(path:string,schema:{parse:(v:unknown)=>any})=>{
 try{return schema.parse(YAML.parse(readFileSync(path,'utf8')))}catch(e){errors.push(`${relative(root,path)}: ${String(e)}`);return null}
};
const tracks=new Map<string,any>(),modules=new Map<string,any>(),lessons=new Map<string,any>(),exercises=new Map<string,any>();
const unique=(map:Map<string,any>,item:any,path:string)=>{if(map.has(item.id))errors.push(`Duplicate ID ${item.id}: ${path}`);else map.set(item.id,item)};
for(const path of files(root)){
 const name=path.split('/').at(-1);
 if(name==='track.yaml'){const v=parse(path,trackSchema);if(v)unique(tracks,v,path)}
 if(name==='module.yaml'){const v=parse(path,moduleSchema);if(v)unique(modules,v,path)}
 if(name==='metadata.yaml'){
  const v=parse(path,lessonSchema);if(v){unique(lessons,{...v,path},path);if(!existsSync(join(dirname(path),'lesson.mdx')))errors.push(`Missing lesson.mdx for ${v.id}`)}
 }
 if(name==='exercise.yaml'){
  const v=parse(path,exerciseSchema);if(v){unique(exercises,v,path);
   for(const starter of v.starterFiles)if(starter.includes('..')||starter.startsWith('/')||!existsSync(join(dirname(path),'starter',starter)))errors.push(`Missing/unsafe starter ${starter} in ${path}`);
   if(v.grading.testsFile.includes('..')||v.grading.testsFile.startsWith('/'))errors.push(`Unsafe tests path in ${path}`);
   else {const testsPath=join(dirname(path),v.grading.testsFile);try{testsSchema.parse(JSON.parse(readFileSync(testsPath,'utf8')))}catch(e){errors.push(`Invalid tests ${testsPath}: ${String(e)}`)}}
  }}
}
for(const t of tracks.values())for(const m of t.modules)if(!modules.has(m.id)||modules.get(m.id).trackId!==t.id)errors.push(`Track ${t.id} references missing/wrong module ${m.id}`);
for(const m of modules.values())if(!tracks.has(m.trackId))errors.push(`Module ${m.id} missing track ${m.trackId}`);
for(const l of lessons.values()){
 if(!modules.has(l.moduleId))errors.push(`Lesson ${l.id} missing module ${l.moduleId}`);
 for(const pre of l.prerequisites)if(!lessons.has(pre))errors.push(`Lesson ${l.id} missing prerequisite ${pre}`);
 for(const ex of l.exerciseIds)if(!exercises.has(ex)||exercises.get(ex).lessonId!==l.id)errors.push(`Lesson ${l.id} missing/mismatched exercise ${ex}`);
}
for(const ex of exercises.values())if(!lessons.has(ex.lessonId))errors.push(`Exercise ${ex.id} missing lesson ${ex.lessonId}`);
const visiting=new Set<string>(),visited=new Set<string>();
function visit(id:string){if(visiting.has(id)){errors.push(`Circular prerequisite at ${id}`);return}if(visited.has(id))return;visiting.add(id);for(const pre of lessons.get(id)?.prerequisites??[])if(lessons.has(pre))visit(pre);visiting.delete(id);visited.add(id)}
for(const id of lessons.keys())visit(id);
if(!tracks.size||!modules.size||!lessons.size)errors.push('Curriculum cannot be empty');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`Validated ${tracks.size} track(s), ${modules.size} modules, ${lessons.size} lessons, ${exercises.size} exercises.`);
