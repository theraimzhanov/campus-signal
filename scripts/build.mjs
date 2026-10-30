import fs from 'node:fs';
fs.mkdirSync('worker',{recursive:true});fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
const assets=Object.fromEntries(['index.html','app.js','style.css'].map(name=>['/'+name,{body:fs.readFileSync('src/'+name,'utf8'),type:({'index.html':'text/html; charset=utf-8','app.js':'text/javascript; charset=utf-8','style.css':'text/css; charset=utf-8'})[name]}]));
const server=fs.readFileSync('src/server.js','utf8');
const bundle=server+'\nconst assets='+JSON.stringify(assets)+';\nexport default {async fetch(request){const url=new URL(request.url);if(url.pathname.startsWith("/api/")){const res=await api(request);Object.entries(securityHeaders).forEach(([k,v])=>res.headers.set(k,v));return res}const asset=assets[url.pathname]||(url.pathname.includes(".")?null:assets["/index.html"]);if(!asset)return new Response("Not found",{status:404});return new Response(asset.body,{headers:{...securityHeaders,"Content-Type":asset.type,"Cache-Control":"no-cache"}})}};\n';
fs.writeFileSync('worker/index.js',bundle);fs.writeFileSync('dist/server/index.js',bundle);
fs.mkdirSync('.openai',{recursive:true});const manifest=fs.existsSync('.openai/hosting.json')?JSON.parse(fs.readFileSync('.openai/hosting.json','utf8')):{};delete manifest.static;fs.writeFileSync('.openai/hosting.json',JSON.stringify(manifest,null,2));fs.writeFileSync('dist/.openai/hosting.json',JSON.stringify(manifest,null,2));
console.log('Built multi-page Worker with server-side auth and embedded assets');
