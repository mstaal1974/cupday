let venues=[],venueId='flemington',view='races',raceNumber=7;
let saved;try{saved=new Set(JSON.parse(localStorage.getItem('cupday-shortlist')||'[]'))}catch{saved=new Set()}
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const {brisbaneTime, upcoming, countdown}=CupdayTime;
const venue=()=>venues.find(v=>v.id===venueId),key=(v,r)=>`${v.id}:${r.number}`;
function saveButton(v,r){const on=saved.has(key(v,r));return `<button class="save-button ${on?'is-saved':''}" data-save="${key(v,r)}" aria-label="${on?'Remove':'Save'} ${esc(v.name)} race ${r.number}" aria-pressed="${on}">${on?'♥':'♡'}</button>`}
function render(){
 $('#save-count').textContent=saved.size;
 $('#venues').innerHTML=venues.map(v=>`<button class="venue-tab ${v.id===venueId?'active':''}" data-venue="${v.id}" aria-pressed="${v.id===venueId}"><span class="venue-state">${v.state}</span><strong>${v.name}</strong><span class="venue-race-count">${v.races.length} races</span><span class="venue-arrow">↗</span></button>`).join('');
 const v=venue();$('#venue-info').innerHTML=`<span>⌖ ${v.id==='gold-coast'?'Aquis Park · Gold Coast Poly':v.name==='Randwick'?'Royal Randwick':v.name}</span><span>${v.condition}</span><span>${v.rail}</span><span class="timezone">All race times in Brisbane · AEST</span>`;
 document.querySelectorAll('.view-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 $('#track-notes').innerHTML=`<strong>From ${esc(v.source)}</strong><p>${esc(v.profile).replaceAll('\n','<br>')}</p><small>Confidence scores are the document author’s ratings, not winning probabilities.</small>`;
 if(view==='races') renderRaces(v); else if(view==='next') renderNext(); else if(view==='quaddie') renderQuaddie(v); else renderCards(v);
 const arrow='<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
 for(const el of [$('#content'),$('#venues')])el.innerHTML=el.innerHTML.replaceAll('↗',arrow);
 const active=$('.race-chip.active');if(active)active.parentElement.scrollLeft=active.offsetLeft-active.parentElement.offsetLeft-active.parentElement.clientWidth/2+active.clientWidth/2;
}
function renderRaces(v){
 const r=v.races.find(r=>r.number===raceNumber)||v.races[0];raceNumber=r.number;
 $('#content').innerHTML=`<div class="race-strip" aria-label="Choose a race">${v.races.map(x=>`<button class="race-chip ${x.number===r.number?'active':''}" data-race="${x.number}" aria-pressed="${x.number===r.number}"><b>R${x.number}${x.rank===1?'<span>✳</span>':''}</b><small>${brisbaneTime(v,x)}</small></button>`).join('')}</div>
 <div class="race-layout"><article class="race-detail"><div class="race-topline"><span class="eyebrow">${v.name.toUpperCase()} <span class="slash">/</span> RACE ${r.number}</span>${saveButton(v,r)}</div><h2>${esc(r.title)}</h2><div class="race-meta"><span>◷ ${brisbaneTime(v,r)} AEST</span><span>${esc(r.meta)}</span>${r.number===7&&v.id==='flemington'?'<span class="cup-badge">THE MAIN EVENT</span>':''}</div><a class="mobile-bet-jump" href="#betting-notes">Suggested bets ↓</a><div class="picks-heading"><h3>The selections</h3><span>In order of preference</span></div><div class="selection-list">${r.selections.map((p,i)=>`<div class="selection ${i===0?'top-selection':''}"><span class="position">0${i+1}</span><span class="silk silk-${i}">${p.number}</span><div><b>${esc(p.name)}</b>${i===0?'<small>TOP SELECTION</small>':''}</div>${i===0?'<span class="pick-star">↗</span>':''}</div>`).join('')}</div><details class="analysis-details"><summary>Why these runners <span>＋</span></summary><div class="analysis-copy">${r.analysis.map(p=>`<p>${esc(p)}</p>`).join('')}</div></details>${r.scratchings?`<details class="scratchings"><summary>Document scratchings <span>＋</span></summary><p>${esc(r.scratchings)}</p></details>`:''}<div class="race-pager"><button data-race="${r.number-1}" ${r.number===1?'disabled':''}>← Previous race</button><button data-race="${r.number+1}" ${r.number===v.races.length?'disabled':''}>Next race →</button></div></article><aside>${betPanel(v,r)}${bestSpotlight(v)}<div class="source-note">↳ <span>Selections transcribed from <b>${esc(v.source)}</b>. Times converted to Brisbane (AEST) from the supplied schedule. Scratchings are from the document, not live updates.</span></div></aside></div>`;
}
function exoticRows(q,t){return `${q?`<div class="bet-row"><span>Quinella</span><b>${esc(q)}</b></div>`:''}${t?`<div class="trifecta"><span>Trifecta</span>${t.split('/').map((x,i)=>`<div><small>${['1ST','2ND','3RD'][i]}</small><b>${esc(x.trim())}</b></div>`).join('')}</div>`:''}`}
function betPanel(v,r){
 let q=r.quinella,t=r.trifecta;
 if(!q&&r.exotics){q=(r.exotics.match(/Quinella: ([^|]+)/)||[])[1];t=(r.exotics.match(/Trifecta: (.+)/)||[])[1]}
 return `<section class="bet-panel" id="betting-notes"><div class="eyebrow"><span>↗</span> THE BETTING NOTES</div><h3>${r.rank?'A closer look.':'Play the combinations.'}</h3>${r.confidence?`<div class="confidence"><div><span>Document confidence</span><b>${r.confidence.toFixed(1)}<small> / 10</small></b></div><div class="confidence-track"><i style="width:${r.confidence*10}%"></i></div></div><div class="bet-type">${esc(r.betType)} <b>#${r.selections[0].number} ${esc(r.selections[0].name)}</b></div>`:''}${q||t?exoticRows(q,t):'<p class="no-bets">No exotic bets supplied for this race. See the ranked selections alongside.</p>'}${r.exotics&&r.quinella?`<details class="alternate"><summary>Race-summary combinations</summary><p>${esc(r.exotics)}</p><small>The source gives separate combinations in its race summary and best-bets table. Both are preserved here.</small></details>`:''}${r.exotics.includes('Box Quinella')?`<div class="bet-row"><span>Box quinella</span><b>${esc(r.exotics.split('Box Quinella:')[1].trim())}</b></div>`:''}${r.cupTrifecta?`<div class="cup-exotics"><h4>Cup trifecta</h4>${exoticRows('',r.cupTrifecta)}<h4>Cup first four</h4>${r.firstFour.split('/').map((x,i)=>`<div class="first-four"><small>${i+1}${['ST','ND','RD','TH'][i]}</small><b>${esc(x.trim())}</b></div>`).join('')}</div>`:''}<p class="bet-footnote">Numbers refer to runners, not barriers.<br>Combinations are supplied tips, not placed bets.</p></section>`;
}
function bestSpotlight(v){const r=v.races.find(r=>r.rank===1);return `<button class="spotlight" data-open="${key(v,r)}"><span class="eyebrow">✳ THE VENUE’S BEST BET</span><span class="spotlight-horse">${esc(r.selections[0].name)} <span>↗</span></span><span>R${r.number} · No. ${r.selections[0].number} <b>${r.confidence.toFixed(1)} / 10</b></span></button>`}
function renderCards(v){const list=view==='saved'?venues.flatMap(v=>v.races.filter(r=>saved.has(key(v,r))).map(r=>({v,r}))):v.races.filter(r=>r.rank).sort((a,b)=>a.rank-b.rank).map(r=>({v,r}));$('#content').innerHTML=`<div class="list-heading"><div><h2>${view==='saved'?'Your race-day shortlist':'The strongest on the card'}</h2><p>${view==='saved'?'Saved across all four venues. Kept on this device.':'Six highlighted bets from the supplied '+v.name+' analysis.'}</p></div><span>${list.length} ${view==='saved'?'saved':'picks'}</span></div>${list.length?`<div class="best-grid">${list.map(({v,r})=>`<article class="best-card"><div class="card-top"><span class="eyebrow">${v.name} · R${r.number}</span>${saveButton(v,r)}</div><span class="small-label">${r.rank===1?'✳ VENUE BEST BET':r.rank?'BEST BET #'+r.rank:'TOP SELECTION'}</span><h3><span class="mini-silk">${r.selections[0].number}</span>${esc(r.selections[0].name)}</h3><div class="card-meta">${brisbaneTime(v,r)} AEST · ${esc(r.betType||'Top selection')}</div>${r.confidence?`<div class="card-confidence"><span>Document confidence</span><b>${r.confidence.toFixed(1)} <small>/ 10</small></b></div>`:''}<button class="text-link" data-open="${key(v,r)}">View race & suggested bets <span>↗</span></button></article>`).join('')}</div>`:'<div class="empty-state"><span>♡</span><h3>A good day starts with a shortlist.</h3><p>Tap the heart on any race to keep its selections here.</p><button class="primary" data-view="races">Explore the races →</button></div>'}`}
function renderQuaddie(v){const combos=v.quaddie.reduce((n,l)=>n*l.numbers.length,1);$('#content').innerHTML=`<div class="list-heading"><div><h2>Four legs. One ticket.</h2><p>The supplied ${v.name} quaddie · Races ${v.quaddie[0].race}–${v.quaddie[3].race}</p></div><span>QUADDIE</span></div><div class="quaddie-layout"><div class="quaddie-legs">${v.quaddie.map((l,i)=>`<button class="quaddie-leg" data-open="${v.id}:${l.race}"><span class="leg-index">0${i+1}</span><div><small>LEG ${i+1} · RACE ${l.race}</small><h3>${esc(v.races[l.race-1].title)}</h3><div class="number-balls">${l.numbers.map(n=>`<span>${n}</span>`).join('')}</div></div><span>↗</span></button>`).join('')}</div><section class="bet-panel quaddie-calculator"><div class="eyebrow">YOUR FLEXI CALCULATOR</div><h3>Make the numbers clear.</h3><div class="combo-total"><b>${combos.toLocaleString()}</b><span>total combinations</span></div><label for="stake">Your total outlay (AUD)</label><div class="stake-input"><span>$</span><input id="stake" type="number" min="0" step="1" value="50" inputmode="decimal"></div><div class="stake-buttons">${[20,50,100].map(n=>`<button data-stake="${n}">$${n}</button>`).join('')}</div><div class="flexi-result"><span>Flexi percentage</span><strong id="flexi">${(50/combos*100).toFixed(2)}%</strong></div><p>Calculated at $1 per combination. This is your share of a full-unit winning dividend, not a predicted return.</p><small>Selections are taken from the document. No bet is submitted.</small></section></div>`}

function renderNext() {
 const now=Date.now(), list=upcoming(venues,now);
 $('#content').innerHTML=`<div class="list-heading"><div><h2>Coming up on the card.</h2><p>Upcoming races across all four venues · 3 November 2026<br>All start times in Brisbane (AEST).</p></div><span>${list.length} TO COME</span></div>
 <p class="schedule-note">Countdowns follow the supplied schedule and your device clock. Delays and actual starts are not tracked live.</p>
 ${list.length?`<div class="next-list">${list.map(({v,r,start},i)=>`<article class="next-card ${i===0?'next-first':''}" data-scheduled="${start}">
 <div class="next-time"><strong>${brisbaneTime(v,r)}</strong><span>AEST · Brisbane</span><span class="countdown ${start-now<=600000?'starting-soon':''}" data-countdown="${start}" role="timer" aria-live="off">${countdown(start,now)}</span></div>
 <div class="next-race"><div class="eyebrow">${esc(v.name)} · RACE ${r.number}${i===0?' · NEXT UP':''}</div><h3>${esc(r.title)}</h3><p>${esc(r.meta)}</p><div class="next-selection"><span class="mini-silk">${r.selections[0].number}</span><div><small>TOP SELECTION</small><b>${esc(r.selections[0].name)}</b></div></div></div>
 <div class="next-actions">${saveButton(v,r)}<button class="primary" data-open="${key(v,r)}">View race & bets →</button></div></article>`).join('')}</div>`:
 '<div class="empty-state"><span>◷</span><h3>No more scheduled races.</h3><p>The supplied card for 3 November 2026 has finished its scheduled starts.<br>You can still browse every race and its suggested bets.</p><button class="primary" data-view="races">Browse the race guide →</button></div>'}`;
}
function tickNext() {
 if(view!=='next'||!venues.length)return;
 const now=Date.now();
 // Remove past scheduled starts and promote the next race without refreshing the page.
 if([...document.querySelectorAll('[data-scheduled]')].some(el=>Number(el.dataset.scheduled)<=now)) {
  renderNext();
  return;
 }
 document.querySelectorAll('[data-countdown]').forEach(el=>{
  const start=Number(el.dataset.countdown);
  el.textContent=countdown(start,now);
  el.classList.toggle('starting-soon', start-now<=600000);
 });
}
setInterval(tickNext,1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&view==='next')renderNext()});

function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2200)}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.venue){venueId=b.dataset.venue;raceNumber=1;render()}
 else if(b.dataset.view){view=b.dataset.view;render();if(b.classList.contains('shortlist-header'))$('.toolbar').scrollIntoView({behavior:'smooth',block:'start'})}
 else if(b.dataset.race){raceNumber=Number(b.dataset.race);render();$(`.race-chip.active`)?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'})}
 else if(b.dataset.save){const k=b.dataset.save;const removing=saved.has(k);removing?saved.delete(k):saved.add(k);try{localStorage.setItem('cupday-shortlist',JSON.stringify([...saved]))}catch{toast('Storage unavailable. Saved for this session.')}render();toast(removing?'Removed from your shortlist':'Added to your shortlist')}
 else if(b.dataset.open){[venueId,raceNumber]=b.dataset.open.split(':');raceNumber=Number(raceNumber);view='races';render();$('.toolbar').scrollIntoView({behavior:'smooth',block:'start'})}
 else if(b.id==='info-toggle'){const hidden=!$('#track-notes').hidden;$('#track-notes').hidden=hidden;b.setAttribute('aria-expanded',String(!hidden))}
 else if(b.dataset.stake){$('#stake').value=b.dataset.stake;updateFlexi()}
});
function updateFlexi(){const amount=Number($('#stake').value),combos=venue().quaddie.reduce((n,l)=>n*l.numbers.length,1);$('#flexi').textContent=Number.isFinite(amount)&&amount>=0?(amount/combos*100).toFixed(2)+'%':'Enter a valid outlay'}
document.addEventListener('input',e=>{if(e.target.id==='stake')updateFlexi()});
fetch('data.json').then(r=>{if(!r.ok)throw Error('Data unavailable');return r.json()}).then(data=>{venues=data;const valid=new Set(venues.flatMap(v=>v.races.map(r=>key(v,r))));saved=new Set([...saved].filter(k=>valid.has(k)));render()}).catch(()=>{$('#content').innerHTML='<div class="empty-state"><h2>The race guide couldn’t load.</h2><p>Please refresh to try again.</p><button class="primary" onclick="location.reload()">Try again</button></div>'});
