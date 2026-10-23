import { createClient, type SupabaseClient } from '@supabase/supabase-js';
let client:SupabaseClient|null=null;
export function authClient():SupabaseClient {
 if(!client) {
  const url=import.meta.env.PUBLIC_SUPABASE_URL;
  const key=import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key) throw new Error('Supabase public configuration is missing');
  client=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 }
 return client;
}
export const apiBase=import.meta.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001/v1';
export async function authorizedFetch(path:string,init:RequestInit={}) {
 const {data:{session}}=await authClient().auth.getSession();
 if(!session) throw new Error('Please sign in first');
 const headers=new Headers(init.headers);
 headers.set('Authorization',`Bearer ${session.access_token}`);
 if(init.body) headers.set('Content-Type','application/json');
 const response=await fetch(`${apiBase}${path}`,{...init,headers});
 if(!response.ok) throw new Error(`Request failed (${response.status})`);
 return response.json();
}
