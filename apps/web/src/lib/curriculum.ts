import type { Track, Module, Lesson } from '@ofa/curriculum';
import { trackSchema,moduleSchema,lessonSchema } from '@ofa/curriculum';
import YAML from 'yaml';
const tracks=import.meta.glob('../../../../content/en/**/track.yaml',{query:'?raw',import:'default',eager:true});
const modules=import.meta.glob('../../../../content/en/**/module.yaml',{query:'?raw',import:'default',eager:true});
const lessons=import.meta.glob('../../../../content/en/**/metadata.yaml',{query:'?raw',import:'default',eager:true});
export const catalog={
 tracks:Object.values(tracks).map(raw=>trackSchema.parse(YAML.parse(String(raw)))) as Track[],
 modules:Object.values(modules).map(raw=>moduleSchema.parse(YAML.parse(String(raw)))) as Module[],
 lessons:Object.values(lessons).map(raw=>lessonSchema.parse(YAML.parse(String(raw)))) as Lesson[]
};
export const orderedModules=(trackId:string)=>{
 const track=catalog.tracks.find(t=>t.id===trackId);
 return (track?.modules??[]).map(m=>catalog.modules.find(x=>x.id===m.id)).filter((x):x is Module=>Boolean(x));
};
export const moduleLessons=(moduleId:string)=>catalog.lessons.filter(l=>l.moduleId===moduleId);
