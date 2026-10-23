import { pool } from './client.js';
// Minimal relational seed matching published Sprint 2 lessons.
// Read from checked-in curriculum metadata; avoid divergent hard-coded lesson lists.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
const root=path.resolve(process.cwd(),'../../content/en');
function files(dir:string,name:string):string[]{
 if(!fs.existsSync(dir)) return [];
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(path.join(dir,x.name),name):x.name===name?[path.join(dir,x.name)]:[]);
}
try {
 for(const file of files(root,'track.yaml')) {
  const t=YAML.parse(fs.readFileSync(file,'utf8'));
  await pool.query(`INSERT INTO tracks(id,slug,title,curriculum_version,published) VALUES($1,$1,$2,$3,true)
   ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,curriculum_version=EXCLUDED.curriculum_version,published=true`,[t.id,t.title,t.version]);
 }
 for(const file of files(root,'module.yaml')) {
  const m=YAML.parse(fs.readFileSync(file,'utf8'));
  await pool.query(`INSERT INTO modules(id,title,position) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,position=EXCLUDED.position`,[m.id,m.title,m.position]);
  await pool.query(`INSERT INTO track_modules(track_id,module_id,position) VALUES($1,$2,$3) ON CONFLICT(track_id,module_id) DO UPDATE SET position=EXCLUDED.position`,[m.trackId,m.id,m.position]);
 }
 const positions=new Map<string,number>();
 for(const file of files(root,'metadata.yaml').sort()) {
  const l=YAML.parse(fs.readFileSync(file,'utf8'));
  const position=positions.get(l.moduleId)??0;positions.set(l.moduleId,position+1);
  await pool.query(`INSERT INTO lessons(id,module_id,slug,content_version,title,position,published) VALUES($1,$2,$3,$4,$5,$6,true)
   ON CONFLICT(id) DO UPDATE SET content_version=EXCLUDED.content_version,title=EXCLUDED.title,published=true`,[l.id,l.moduleId,l.slug,l.version,l.title,position]);
 }
 for(const file of files(root,'exercise.yaml').sort()) {
  const e=YAML.parse(fs.readFileSync(file,'utf8'));
  await pool.query(`INSERT INTO exercises(id,lesson_id,exercise_version,engine,passing_score)
   VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO UPDATE SET exercise_version=EXCLUDED.exercise_version,passing_score=EXCLUDED.passing_score`,
   [e.id,e.lessonId,e.version,e.engine,e.grading.passingScore]);
 }
 console.log('Curriculum seed complete');
} finally {await pool.end();}
