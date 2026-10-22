import {performance} from 'node:perf_hooks';
import {compactText} from './compression.js';
export function benchmark(){
 const cases=[
  ['repeated-log','INFO heartbeat\n'.repeat(1000),s=>s.includes('1000 times total')],
  ['middle-error','INFO ok\n'.repeat(500)+'Error: transaction failed\n at charge (src/pay.js:72:9)\n'+'INFO ok\n'.repeat(500),s=>s.includes('Error: transaction failed\n at charge (src/pay.js:72:9)')],
  ['formatted-json',JSON.stringify({records:Array.from({length:100},(_,id)=>({id,status:'ok'}))},null,2),s=>JSON.parse(s).records.length===100],
  ['unique-code',Array.from({length:500},(_,i)=>`const item${i} = ${i};`).join('\n'),s=>s.includes('const item250 = 250;')],
 ];
 return {kind:'offline synthetic transformation benchmark',node:process.version,platform:process.platform,
  units:'UTF-16 code units, NOT model tokens',qualityScope:'Fixture assertions only; no model task-success evaluation',
  competitorsExecuted:false,results:cases.map(([name,input,validate])=>{
   const begin=performance.now();const result=compactText(input,{maxChars:800});
   return {name,inputChars:input.length,outputChars:result.outputChars,avoidedChars:result.omittedChars,strategy:result.strategy,latencyMs:performance.now()-begin,fixturePassed:validate(result.text),budgetExceeded:result.budgetExceeded};
  })};
}
