const assert = require('node:assert/strict');
const data = require('../data.json');
const timing = require('../timing.js');
const flemington=data.find(v=>v.id==='flemington');
const randwick=data.find(v=>v.id==='randwick');
const doomben=data.find(v=>v.id==='doomben');
assert.equal(timing.brisbaneTime(flemington,flemington.races[6]),'2:00 pm');
assert.equal(timing.brisbaneTime(randwick,randwick.races[0]),'10:45 am');
assert.equal(timing.brisbaneTime(doomben,doomben.races[0]),'10:53 am');
assert.equal(new Date(timing.startTime(flemington,flemington.races[6])).toISOString(),'2026-11-03T04:00:00.000Z');
assert.equal(timing.upcoming(data,Date.parse('2026-11-02T23:00:00Z')).length,37);
assert.equal(timing.upcoming(data,Date.parse('2026-11-03T10:00:00Z')).length,0);
assert.equal(timing.countdown(60000,0),'Starts in 1m 00s');
assert.equal(timing.countdown(60000,1000),'Starts in 0m 59s');
assert.equal(timing.countdown(0,0),'Scheduled start reached');
assert.equal(data.length, 4);
assert.equal(data.reduce((n,v)=>n+v.races.length,0),37);
assert.equal(data.flatMap(v=>v.races).filter(r=>r.rank).length,24);
for(const v of data){
 assert.deepEqual(v.races.map(r=>r.number),Array.from({length:v.races.length},(_,i)=>i+1));
 assert.equal(new Set(v.races.filter(r=>r.rank).map(r=>r.rank)).size,6);
 assert.equal(v.quaddie.length,4);
 for(const r of v.races){assert.ok(r.selections.length>=4);assert.ok(r.analysis.length);assert.ok(r.time);if(r.rank){assert.ok(r.confidence>0&&r.confidence<=10);assert.ok(r.quinella);assert.ok(r.trifecta.split('/').length===3)}}
}
console.log('Dataset: 4 venues, 37 races, 24 best bets, 16 quaddie legs passed.');
(async()=>{
 const {chromium}=require('playwright');
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 await page.clock.install({time:new Date('2026-11-02T23:00:00Z')});
 await page.clock.pauseAt(new Date('2026-11-02T23:00:00Z'));
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:3000');await page.waitForSelector('.race-detail');
 assert.match(await page.locator('.race-detail h2').textContent(),/Melbourne Cup/);
 assert.match(await page.locator('.race-meta').textContent(),/2:00 pm AEST/);
 await page.screenshot({path:'/tmp/cupday-mobile.png',fullPage:true});
 for(const v of data){
  await page.locator(`[data-venue="${v.id}"]`).click();
  await page.locator('.view-tabs [data-view="races"]').click();
  for(const r of v.races){
   await page.locator(`.race-chip[data-race="${r.number}"]`).click();
   assert.equal(await page.locator('.race-detail h2').textContent(),r.title);
   assert.equal(await page.locator('.selection').count(),r.selections.length);
   assert.ok(await page.locator('.top-selection').textContent().then(t=>t.includes(r.selections[0].name)));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${v.name} R${r.number}: horizontal overflow`);
  }
  await page.locator('.view-tabs [data-view="best"]').click();assert.equal(await page.locator('.best-card').count(),6);
  await page.locator('.view-tabs [data-view="quaddie"]').click();assert.equal(await page.locator('.quaddie-leg').count(),4);
  await page.locator('[data-stake="100"]').click();
  const combos=v.quaddie.reduce((n,l)=>n*l.numbers.length,1);
  assert.equal(await page.locator('#flexi').textContent(),(100/combos*100).toFixed(2)+'%');
 }
 await page.locator('.view-tabs [data-view="races"]').click();
 await page.locator('.race-detail .save-button').click();
 await page.locator('.view-tabs [data-view="saved"]').click();assert.equal(await page.locator('.best-card').count(),1);
 await page.reload();await page.waitForSelector('.race-detail');
 await page.locator('.view-tabs [data-view="saved"]').click();assert.equal(await page.locator('.best-card').count(),1);
 await page.locator('.best-card .save-button').click();assert.equal(await page.locator('.empty-state').count(),1);
 await page.locator('[data-venue="flemington"]').click();await page.locator('.view-tabs [data-view="races"]').click();await page.locator('[data-race="7"].race-chip').click();
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'/tmp/cupday-desktop.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.setViewportSize({width:320,height:720});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('.view-tabs [data-view="next"]').click();
 assert.equal(await page.locator('.next-card').count(),37);
 assert.match(await page.locator('.next-card').first().textContent(),/Flemington · RACE 1/);
 assert.equal(await page.locator('[data-countdown]').first().textContent(),'Starts in 45m 00s');
 assert.equal(await page.locator('.next-time > strong').first().textContent(),'9:45 am');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.clock.fastForward(1000);
 assert.equal(await page.locator('[data-countdown]').first().textContent(),'Starts in 44m 59s');
 await page.clock.fastForward(45*60*1000);
 assert.equal(await page.locator('.next-card').count(),36);
 assert.match(await page.locator('.next-card').first().textContent(),/Flemington · RACE 2/);
 await page.screenshot({path:'/tmp/cupday-next-up-mobile.png',fullPage:true});
 await page.locator('.next-card .primary').first().click();
 assert.match(await page.locator('.race-detail h2').textContent(),/Pin & Win/);
 assert.match(await page.locator('.race-meta').textContent(),/10:20 am AEST/);
 await page.locator('.view-tabs [data-view="next"]').click();
 await page.clock.fastForward(12*60*60*1000);
 assert.equal(await page.locator('.next-card').count(),0);
 assert.match(await page.locator('.empty-state').textContent(),/No more scheduled races/);
 assert.deepEqual(errors,[]);await browser.close();
 console.log('Browser: all 37 races, 4 best-bet lists, 4 quaddies, flexi calculation, shortlist persistence/removal, mobile and desktop widths, Brisbane time conversion, live countdowns, chronological order, automatic race removal and finished-card state passed.');
})().catch(e=>{console.error(e);process.exit(1)});
