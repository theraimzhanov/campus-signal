// One-time integration verification. This does NOT install or schedule n8n.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const workflow=JSON.parse(fs.readFileSync(path.join(root,'n8n/platform-collector.json'),'utf8'));
const execute=(name,json,all)=>new Function('$input',workflow.nodes.find(n=>n.name===name).parameters.jsCode)({first:()=>({json}),all:()=>all||[{json}]})[0].json;
const decode=s=>s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').trim();
export async function checkCollectors(key){
const endpoint='https://dtkrcefozqhhyhvspxbx.supabase.co/functions/v1/campus-ingest';
const noKey=await fetch(endpoint,{method:'POST',body:'{}'});if(noKey.status!==401)throw Error('Ingress allowed missing key');
const results=[];
const feed=await fetch('https://huggingface.co/blog/feed.xml');if(!feed.ok)throw Error('RSS source failed');const xml=await feed.text();
const entries=[...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,40).map(m=>({json:{title:decode(m[1].match(/<title>([\s\S]*?)<\/title>/)?.[1]||''),link:decode(m[1].match(/<link>([\s\S]*?)<\/link>/)?.[1]||'')}}));if(!entries.length)throw Error('RSS parser needs review');
const article=execute('Normalize AI articles',entries[0].json,entries);
const jobsR=await fetch('https://boards-api.greenhouse.io/v1/boards/anthropic/jobs');if(!jobsR.ok)throw Error('Employer source failed');const internships=execute('Normalize Internships',await jobsR.json());
const eventR=await fetch('https://www.mlh.com/seasons/2027/events');if(!eventR.ok)throw Error('Event source failed');const events=execute('Normalize Hackathons',{data:await eventR.text()});
const repoR=await fetch('https://api.github.com/search/repositories?q=topic:llm+stars:>500&sort=updated&per_page=30',{headers:{'User-Agent':'CampusSignalStudentDirectory','Accept':'application/vnd.github+json'}});if(!repoR.ok)throw Error('Repository discovery source failed');const tools=execute('Normalize AI tool candidates',await repoR.json());
const confR=await fetch('https://www.python.org/events/python-events/');if(!confR.ok)throw Error('Conference source failed');const conferences=execute('Normalize Community events',{data:await confR.text()});
for(const payload of [article,internships,events,tools,conferences]){if(payload.action==='error')throw Error('Source normalization failed');const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','x-campus-key':key},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok)throw Error(payload.action+': '+JSON.stringify(data));results.push({action:payload.action,...data})}
return {missing_key_rejected:true,results};
}
