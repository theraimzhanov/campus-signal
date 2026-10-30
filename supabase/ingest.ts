// Scoped n8n ingress. The Supabase service key stays inside the Edge runtime.
const SB=Deno.env.get('SUPABASE_URL')!;
const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const h={apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'};
const json=(d:unknown,status=200)=>new Response(JSON.stringify(d),{status,headers:{'Content-Type':'application/json'}});
async function db(path:string,options:RequestInit={}){const r=await fetch(SB+'/rest/v1/'+path,{...options,headers:{...h,...options.headers}});if(!r.ok)throw Error('Database write failed');const t=await r.text();return t?JSON.parse(t):null}
Deno.serve(async request=>{
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 try{
 const token=request.headers.get('x-campus-key')||'';if(token.length<40||token.length>128)return json({error:'Unauthorized'},401);
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
 const hash=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
 const keys=await db('integration_keys?hash=eq.'+hash+'&enabled=eq.true&select=hash');if(keys.length!==1)return json({error:'Unauthorized'},401);
 const raw=await request.text();if(raw.length>150000)return json({error:'Payload too large'},413);const body=JSON.parse(raw);
 const sourceMap:Record<string,string>={news:'Hugging Face Blog',internships:'Greenhouse employer boards',events:'Major League Hacking',tools:'GitHub open-source AI projects',conferences:'Python community events'};
 if(body.action==='expire'){const count=await db('rpc/expire_listings',{method:'POST',body:'{}'});return json({expired:count})}
 if(body.action==='error'){await db('collection_runs',{method:'POST',body:JSON.stringify({workflow:'Campus Signal collectors',result:'Collection failed; inspect n8n execution. Request body and secrets omitted.'})});return json({ok:true})}
 if(!sourceMap[body.action]||!Array.isArray(body.items)||body.items.length>100)return json({error:'Invalid import'},400);
 let written=0;
 for(const row of body.items){
 const title=String(row.title||'').trim().slice(0,300),source_url=String(row.source_url||'');let url;try{url=new URL(source_url)}catch{continue}if(!title||url.protocol!=='https:')continue;
 if(body.action==='tools'){
 if(url.hostname!=='github.com'||!/^\/[\w.-]+\/[\w.-]+\/?$/.test(url.pathname))continue;
 const slug=('oss-'+url.pathname.slice(1).replaceAll('/','-')).toLowerCase().replace(/[^a-z0-9-]/g,'-');
 await db('rpc/ingest_tool_candidate',{method:'POST',body:JSON.stringify({record:{slug,title,summary:String(row.summary||'Open-source AI project. Read the repository documentation and license.').slice(0,700),source_url}})});
 }else{
 if(body.action==='news'&&(url.hostname!=='huggingface.co'||!url.pathname.startsWith('/blog/')))continue;
 if(body.action==='internships'&&!/intern|co.op|student/i.test(title))continue;
 if(body.action==='conferences'&&(url.hostname!=='www.python.org'||!url.pathname.startsWith('/events/python-events/')))continue;
 const category=body.action==='news'?'AI & tech':body.action==='events'?'Hackathon':body.action==='conferences'?'Event':'Internship';
 const id=await db('rpc/ingest_listing',{method:'POST',body:JSON.stringify({record:{title,source_url,category,organization:String(row.organization||sourceMap[body.action]).slice(0,200),location:String(row.location||'Unknown').slice(0,200),summary:String(row.summary||'Collected from the original source. Confirm eligibility and dates with the provider.').slice(0,1000),tags:[body.action==='news'?'Official feed':'Official source','Check availability']}})});
 // Publish validated source metadata. Preserve any explicit rejection/expiry.
 await db('listings?id=eq.'+id+'&status=in.(pending,published)',{method:'PATCH',body:JSON.stringify({status:'published',source_name:sourceMap[body.action],...(['events','conferences'].includes(body.action)?{starts_at:row.starts_at && Number.isFinite(Date.parse(row.starts_at))?row.starts_at:null,ends_at:row.ends_at && Number.isFinite(Date.parse(row.ends_at))?row.ends_at:null}:{})})});
 }
 written++;
 }
 const now=new Date().toISOString();await db('sources?name=eq.'+encodeURIComponent(sourceMap[body.action]),{method:'PATCH',body:JSON.stringify({last_success_at:now})});
 await db('collection_runs',{method:'POST',body:JSON.stringify({workflow:sourceMap[body.action],result:'success: '+written+' validated source records processed'})});
 return json({ok:true,processed:written});
 }catch{return json({error:'Import failed; inspect source format and database configuration'},500)}
});
