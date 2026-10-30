import {checkCollectors} from './check-collectors.mjs';
process.stderr.write('Ready for scoped test credential on stdin (input hidden).\n');
if(process.stdin.isTTY)process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');let value='';
process.stdin.on('data',async chunk=>{value+=chunk;if(!value.includes('\n')&&!value.includes('\r'))return;process.stdin.removeAllListeners('data');if(process.stdin.isTTY)process.stdin.setRawMode(false);process.stdin.pause();try{console.log(JSON.stringify(await checkCollectors(value.trim())));value='';process.exit(0)}catch(e){value='';console.error(e.message);process.exit(1)}});
