const SUPABASE='https://dtkrcefozqhhyhvspxbx.supabase.co';
const KEY='sb_publishable_rzFmu9EZpwtjpFb0tYcbbA_SD5cf_-u';
const reply=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...extra}});
const headers=token=>({apikey:KEY,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})});
const cookie=(value,secure=true)=>`campus_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${value?2592000:0}${secure?'; Secure':''}`;
function readSession(request){try{return JSON.parse(atob(decodeURIComponent(request.headers.get('cookie')?.match(/(?:^|; )campus_session=([^;]+)/)?.[1]||'')))}catch{return null}}
const pack=s=>encodeURIComponent(btoa(JSON.stringify({access_token:s.access_token,refresh_token:s.refresh_token,expires_at:Math.floor(Date.now()/1000)+(s.expires_in||3600)})));
async function sb(path,options={},token){const r=await fetch(SUPABASE+path,{...options,headers:{...headers(token),...options.headers}});const text=await r.text();let data;try{data=JSON.parse(text)}catch{data={message:'Service response unavailable'}}if(!r.ok)throw Object.assign(new Error(data.msg||data.error_description||data.message||'Request failed'),{status:r.status});return data}
async function identity(request){let session=readSession(request),renewed=null;if(!session)return {user:null,token:null};try{if(session.expires_at<Date.now()/1000+60){session=await sb('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})});renewed=pack(session)}const user=await sb('/auth/v1/user',{},session.access_token);return {user,token:session.access_token,renewed}}catch{return {user:null,token:null,clear:true}}}
async function readBody(request){if(Number(request.headers.get('content-length')||0)>16000)throw Object.assign(Error('Request too large'),{status:413});const raw=await request.text();if(raw.length>16000)throw Object.assign(Error('Request too large'),{status:413});try{return JSON.parse(raw)}catch{throw Object.assign(Error('Invalid request'),{status:400})}}
const requireUser=ctx=>{if(!ctx.user)throw Object.assign(Error('Please sign in to continue'),{status:401});};
const requireAdmin=ctx=>{requireUser(ctx);if(ctx.user.app_metadata?.role!=='admin')throw Object.assign(Error('Administrator access required'),{status:403});};
export async function api(request){const url=new URL(request.url),path=url.pathname,secure=url.protocol==='https:';
 try{
 if(!['GET','HEAD'].includes(request.method)&&request.headers.get('origin')!==url.origin)return reply({error:'Origin check failed'},403);
 const ctx=await identity(request);const finish=data=>reply(data,200,ctx.renewed?{'Set-Cookie':cookie(ctx.renewed,secure)}:ctx.clear?{'Set-Cookie':cookie('',secure)}:{});
 if(path==='/api/auth/me')return finish({user:ctx.user?{id:ctx.user.id,email:ctx.user.email,display_name:ctx.user.user_metadata?.display_name||'',admin:ctx.user.app_metadata?.role==='admin'}:null});
 if(path.startsWith('/api/auth/')&&request.method==='POST'){
 const action=path.split('/').pop(),body=await readBody(request);
 if(action==='logout'){if(ctx.token)try{await sb('/auth/v1/logout?scope=global',{method:'POST'},ctx.token)}catch{}return reply({ok:true},200,{'Set-Cookie':cookie('',secure)})}
 if(action==='session'){if(typeof body.access_token!=='string'||typeof body.refresh_token!=='string')throw Object.assign(Error('Invalid session'),{status:400});await sb('/auth/v1/user',{},body.access_token);return reply({ok:true},200,{'Set-Cookie':cookie(pack(body),secure)})}
 if(action==='password'){requireUser(ctx);if(typeof body.password!=='string'||body.password.length<10)throw Object.assign(Error('Use at least 10 characters'),{status:400});await sb('/auth/v1/user',{method:'PUT',body:JSON.stringify({password:body.password})},ctx.token);return finish({ok:true})}
 if(!['login','register','reset'].includes(action))return reply({error:'Unknown auth action'},404);
 if(typeof body.email!=='string'||!/^\S+@\S+\.\S+$/.test(body.email)||body.email.length>254)throw Object.assign(Error('Enter a valid email address'),{status:400});
 if(action==='reset'){await sb('/auth/v1/recover?redirect_to='+encodeURIComponent(url.origin+'/auth/callback'),{method:'POST',body:JSON.stringify({email:body.email})});return finish({message:'If an account exists, a password reset email will arrive. Check your inbox.'})}
 if(typeof body.password!=='string'||body.password.length<(action==='register'?10:1)||body.password.length>256)throw Object.assign(Error('Use a password of 10–256 characters'),{status:400});
 const result=action==='login'?await sb('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:body.email,password:body.password})}):await sb('/auth/v1/signup?redirect_to='+encodeURIComponent(url.origin+'/auth/callback'),{method:'POST',body:JSON.stringify({email:body.email,password:body.password,data:{display_name:String(body.display_name||'').slice(0,99)}})});
 if(result.access_token)return reply({ok:true},200,{'Set-Cookie':cookie(pack(result),secure)});
 return finish({message:'Check your email to confirm your account, then sign in. Confirmation delivery requires the project’s email service to be configured.'});
 }
 if(path==='/api/catalog'&&request.method==='GET'){
 const tables=['tools','use_cases','learning_tracks','listings','sources'];const pairs=await Promise.all(tables.map(async table=>[table,await sb('/rest/v1/'+table+'?select=*&order='+(table==='sources'?'name.asc':'created_at.desc').replace('created_at',table==='listings'?'published_at':'created_at')+'&limit=1000',{},ctx.token)]));
 const popularity=await sb('/rest/v1/rpc/popularity_counts',{method:'POST',body:'{}'},ctx.token);return finish({...Object.fromEntries(pairs),popularity});
 }
 if(path==='/api/bookmarks'){
 requireUser(ctx);if(request.method==='GET')return finish(await sb('/rest/v1/bookmarks?select=*,tools(*),listings(*),use_cases(*)&order=created_at.desc',{},ctx.token));
 const b=await readBody(request),field={tool:'tool_id',listing:'listing_id',use_case:'use_case_id'}[b.type];if(!field||!/^[0-9a-f-]{36}$/i.test(b.id))throw Object.assign(Error('Invalid saved item'),{status:400});
 if(request.method==='DELETE'){await sb('/rest/v1/bookmarks?'+field+'=eq.'+b.id+'&user_id=eq.'+ctx.user.id,{method:'DELETE'},ctx.token);return finish({ok:true})}
 if(request.method==='POST'){await sb('/rest/v1/bookmarks',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({user_id:ctx.user.id,[field]:b.id})},ctx.token);return finish({ok:true})}
 }
 if(path==='/api/profile'){
 requireUser(ctx);if(request.method==='GET')return finish((await sb('/rest/v1/profiles?user_id=eq.'+ctx.user.id,{},ctx.token))[0]||{});
 if(request.method==='POST'){const b=await readBody(request);const year=b.graduation_year?Number(b.graduation_year):null;if(year&&(!Number.isInteger(year)||year<2000||year>2100))throw Object.assign(Error('Invalid graduation year'),{status:400});await sb('/rest/v1/profiles?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify({user_id:ctx.user.id,display_name:String(b.display_name||'').slice(0,99),university:String(b.university||'').slice(0,199),interests:Array.isArray(b.interests)?b.interests.slice(0,10).map(x=>String(x).slice(0,50)):[],graduation_year:year,updated_at:new Date().toISOString()})},ctx.token);return finish({ok:true})}
 }
 if(path==='/api/progress'){
 requireUser(ctx);if(request.method==='GET')return finish(await sb('/rest/v1/learning_progress?select=*',{},ctx.token));
 const b=await readBody(request);if(!/^[0-9a-f-]{36}$/i.test(b.track_id)||!Number.isInteger(b.module_index)||b.module_index<0||b.module_index>99)throw Object.assign(Error('Invalid lesson'),{status:400});
 if(request.method==='POST')await sb('/rest/v1/learning_progress',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({user_id:ctx.user.id,track_id:b.track_id,module_index:b.module_index})},ctx.token);
 else if(request.method==='DELETE')await sb('/rest/v1/learning_progress?track_id=eq.'+b.track_id+'&module_index=eq.'+b.module_index+'&user_id=eq.'+ctx.user.id,{method:'DELETE'},ctx.token);else return reply({error:'Method not allowed'},405);return finish({ok:true});
 }
 if(path==='/api/submissions'){
 requireUser(ctx);if(request.method==='GET')return finish(await sb('/rest/v1/submissions?order=created_at.desc',{},ctx.token));
 if(request.method==='POST'){const b=await readBody(request);if(!['Tool','Internship','Hackathon','Event','Research','Use case'].includes(b.category)||typeof b.title!=='string'||b.title.trim().length<3||b.title.length>200||!/^https:\/\//.test(b.source_url||''))throw Object.assign(Error('Enter a title, category and HTTPS source URL'),{status:400});await sb('/rest/v1/submissions',{method:'POST',body:JSON.stringify({user_id:ctx.user.id,title:b.title.trim(),source_url:b.source_url,category:b.category,notes:String(b.notes||'').slice(0,3000)})},ctx.token);return finish({ok:true})}
 }
 if(path==='/api/admin'){
 requireAdmin(ctx);if(request.method==='GET'){const [listings,tools,submissions]=await Promise.all(['listings','tools','submissions'].map(t=>sb('/rest/v1/'+t+'?status=eq.pending&limit=100',{},ctx.token)));return finish({listings,tools,submissions})}
 if(request.method==='POST'){const b=await readBody(request);if(!['tools','listings','submissions'].includes(b.table)||!/^[0-9a-f-]{36}$/i.test(b.id)||!['published','rejected','approved'].includes(b.status)||b.table==='submissions'&&b.status==='published'||b.table!=='submissions'&&b.status==='approved')throw Object.assign(Error('Invalid moderation change'),{status:400});await sb('/rest/v1/'+b.table+'?id=eq.'+b.id,{method:'PATCH',body:JSON.stringify({status:b.status})},ctx.token);return finish({ok:true})}
 }
 return reply({error:'Not found'},404);
 }catch(e){return reply({error:e.status&&e.status<500?e.message:'The service is unavailable. Please try again.'},e.status&&e.status<500?e.status:503)}
}
export const securityHeaders={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'self' https://chatgpt.com; base-uri 'self'; form-action 'self'"};
