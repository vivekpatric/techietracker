import { esc, getDayState, dayTotals, overallProgress, firstUnfinishedDay, STATE, saveDays, saveChecklists, saveJobs, defaultDayState } from '../state';
import { DAYS, MASTER_GOALS, INTERVIEW_ITEMS, REVIEW_ITEMS, EOD_ITEMS, BACKEND_SKILLS, FINAL_REVIEW, DSA_VAULT, WEEK_TITLES } from '../data/data';
import { requestRender, requestConfirm } from '../lib/uiBus';

export function renderLogin(){
  const cdImagesrc = './images/maringif.gif'
  return `
  
  <div id="login-bg"></div>
  <div class="login-wrap">
    <div class="retro-cd-container">
      <div class="cd-disc">
        <img src="${cdImagesrc}" alt="CD Animation" class="cd-gif">
        <div class="cd-center-hole"></div>
      </div>
    </div>

    <div class="boot-title pixel" style="text-align:center; font-size:13px; margin-bottom:20px;">75-DAY<br>QUEST LOG</div>
    <div class="login-panel">
      <div class="login-field">
        <label>EMAIL</label>
        <input type="email" id="auth-email" placeholder="you@example.com" autocomplete="email">
      </div>
      <div class="login-field">
        <label>PASSWORD</label>
        <input type="password" id="auth-password" placeholder="••••••••" autocomplete="current-password">
      </div>
      <div class="login-error" id="auth-error"></div>
      <button class="btn block" data-action="login">▶ LOG IN</button>
      <button class="btn block amber" style="margin-top:10px;" data-action="signup">+ CREATE ACCOUNT</button>
      <div class="login-links">
        <span data-action="forgot">Forgot password?</span>
        <span></span>
      </div>
    </div>
    <p class="sync-note">Your progress is tied to this account and follows you to any device you log into.</p>
  </div>`;
  
  
}

export function renderBoot(){
  const op = overallProgress();
  const cont = firstUnfinishedDay();
  return `
  <div class="boot-wrap">
    <div class="boot-title pixel">75-DAY<br>BACKEND//DSA<br>QUEST LOG</div>
    <div class="boot-sub">JAVA · TYPESCRIPT · GO · DSA</div>
    <div class="progress-outer"><div class="progress-inner" style="width:${op.pct}%"></div><div class="progress-label">${op.pct}% CLEARED (${op.done}/${op.total})</div></div>
  </div>
  <hr class="boot-rule">
  <div class="boot-menu">
    <button class="btn block" data-nav="day:${cont}">▶ CONTINUE — DAY ${String(cont).padStart(2,'0')}</button>
    <button class="btn block" data-nav="select">☰ DAY SELECT</button>
    <button class="btn block amber" data-nav="goals">◆ QUEST BRIEFING</button>
    <button class="btn block" data-nav="dsa">◆ DSA VAULT</button>
    <button class="btn block" data-nav="skills">◆ SKILLS TREE</button>
    <button class="btn block" data-nav="jobs">◆ JOB TRACKER</button>
    <button class="btn block magenta" data-nav="review">★ FINAL REVIEW</button>
  </div>
  <p class="dim small" style="text-align:center; margin-top:26px;">Progress syncs automatically to your account.</p>
  `;
}

export function renderSelect(){
  let html = `<div class="section-title">DAY SELECT — 75 DAYS</div>`;
  let week = 0;
  for(let i=0;i<DAYS.length;i++){
    const day = DAYS[i];
    if(day.w !== week){
      week = day.w;
      html += `<div class="week-banner"><span class="wn">WEEK ${week===12?'—':week}</span>${esc(WEEK_TITLES[week])}</div><div class="day-grid">`;
    }
    const t = dayTotals(day.d);
    let cls = 'day-tile';
    if(day.boss) cls += ' boss';
    else if(t.pct===100) cls += ' status-done';
    else if(t.pct>0) cls += ' status-progress';
    if(day.we && !day.boss) cls += ' weekend';
    html += `<div class="${cls}" data-nav="day:${day.d}"><div class="dn">D${String(day.d).padStart(2,'0')}</div><div class="dm">${t.pct===100?'★':(t.pct>0?t.pct+'%':'·')}</div></div>`;
    if(i===DAYS.length-1 || DAYS[i+1].w!==week) html += `</div>`;
  }
  return html;
}

function taskRow(sectionArr, idx, text, action){
  const on = !!sectionArr[idx];
  return `<div class="task-row" data-task="${action}" role="button" tabindex="0">
    <div class="chk ${on?'on':''}">${on?'✓':''}</div>
    <div class="task-text ${on?'on':''}">${text}</div>
  </div>`;
}

export function renderDay(d){
  const day = DAYS[d-1];
  const s = getDayState(d);
  const t = dayTotals(d);
  let statusCls='none', statusText='NOT STARTED';
  if(t.pct===100){statusCls='done'; statusText='CLEARED';}
  else if(t.pct>0){statusCls='progress'; statusText='IN PROGRESS';}

  let html = `
  <div class="top-actions">
    <button class="btn2" style="flex:0;" data-nav="select">◄ BACK</button>
  </div>
  <div class="day-head">
    <div>
      <span class="day-num">DAY ${String(d).padStart(2,'0')}/75</span>
      ${day.we ? '<span class="badge weekend">WEEKEND</span>' : ''}
      ${day.boss ? '<span class="badge boss">FINAL BOSS</span>' : ''}
      ${day.time ? '<span class="badge">'+esc(day.time)+'</span>' : ''}
      <div class="day-title">${esc(day.t)}</div>
      <div class="dim small">${esc(WEEK_TITLES[day.w])}</div>
    </div>
    <div class="status-pill ${statusCls}">${statusText}</div>
  </div>
  <div class="progress-outer" style="margin-top:14px;"><div class="progress-inner" style="width:${t.pct}%"></div><div class="progress-label">${t.done}/${t.total}</div></div>
  `;

  if(day.note){
    html += `<div class="panel" style="border-color:var(--magenta); margin-top:14px;"><div class="note-line" style="color:var(--amber);">${esc(day.note)}</div></div>`;
  }

  if(day.be.length){
    html += `<div class="section-title">// BACKEND</div><div class="panel">`;
    day.be.forEach((txt,i)=>{
      html += taskRow(s.be, i, esc(txt), `${d}|be|${i}`);
    });
    html += `</div>`;
  }

  if(day.dsa.length || day.dsaNote){
    html += `<div class="section-title">// DSA</div><div class="panel">`;
    day.dsa.forEach((txt,i)=>{
      html += taskRow(s.dsa, i, esc(txt), `${d}|dsa|${i}`);
    });
    if(day.dsaNote) html += `<div class="note-line">${esc(day.dsaNote)}</div>`;
    html += `</div>`;
  }

  html += `<div class="section-title">// INTERVIEW CHECK</div><div class="panel">`;
  INTERVIEW_ITEMS.forEach((txt,i)=>{ html += taskRow(s.interview, i, esc(txt), `${d}|interview|${i}`); });
  html += `</div>`;

  html += `<div class="section-title">// REVIEW</div><div class="panel">`;
  REVIEW_ITEMS.forEach((txt,i)=>{ html += taskRow(s.review, i, esc(txt), `${d}|review|${i}`); });
  html += `</div>`;

  html += `<div class="section-title">// END OF DAY</div><div class="panel">`;
  EOD_ITEMS.forEach((txt,i)=>{ html += taskRow(s.eod, i, esc(txt), `${d}|eod|${i}`); });
  html += `</div>`;

  html += `<div class="section-title">// FIELD NOTES</div><div class="panel">
    <label class="field-label">WHAT I LEARNED</label>
    <textarea class="field" data-note="${d}|learned">${esc(s.notes.learned)}</textarea>
    <label class="field-label">WHAT I STRUGGLED WITH</label>
    <textarea class="field" data-note="${d}|struggled">${esc(s.notes.struggled)}</textarea>
    <label class="field-label">WHAT I NEED TO REVISE</label>
    <textarea class="field" data-note="${d}|revise">${esc(s.notes.revise)}</textarea>
  </div>`;

  html += `<div class="day-actions">
    <button class="btn2" data-day-clear="${d}">✓ MARK DAY CLEARED</button>
    <button class="btn2 magenta" data-day-reset="${d}">RESET DAY</button>
  </div>`;

  html += `<div class="day-nav">
    <button class="btn2" ${d<=1?'disabled':''} data-nav="day:${d-1}">◄ DAY ${String(d-1).padStart(2,'0')}</button>
    <button class="btn2" ${d>=75?'disabled':''} data-nav="day:${d+1}">DAY ${String(d+1).padStart(2,'0')} ►</button>
  </div>`;

  return html;
}

export function toggleTask(d, section, idx){
  const s = getDayState(d);
  s[section][idx] = !s[section][idx];
  saveDays();
  requestRender();
}
export function updateNote(d, field, val){
  const s = getDayState(d);
  s.notes[field] = val;
  saveDays();
}
export function markDay(d, complete){
  const day = DAYS[d-1];
  if(complete){
    const s = defaultDayState(day);
    s.be = s.be.map(()=>true);
    s.dsa = s.dsa.map(()=>true);
    s.interview = s.interview.map(()=>true);
    s.review = s.review.map(()=>true);
    s.eod = s.eod.map(()=>true);
    s.notes = getDayState(d).notes;
    STATE.days[d] = s;
    saveDays();
    requestRender();
  } else {
    requestConfirm('Reset all progress and notes for Day '+d+'? This cannot be undone.', ()=>{
      STATE.days[d] = defaultDayState(day);
      saveDays();
      requestRender();
    });
  }
}

function taskRowChecklist(arr, idx, text, action){
  const on = !!arr[idx];
  return `<div class="task-row" data-check="${action}" role="button" tabindex="0">
    <div class="chk ${on?'on':''}">${on?'✓':''}</div>
    <div class="task-text ${on?'on':''}">${text}</div>
  </div>`;
}

function taskRowDsa(arr, idx, text, action){
  const on = !!arr[idx];
  return `<div class="task-row" data-dsa="${action}" role="button" tabindex="0">
    <div class="chk ${on?'on':''}">${on?'✓':''}</div>
    <div class="task-text ${on?'on':''}">${text}</div>
  </div>`;
}

export function renderGoals(){
  const g = ensureChecklist('goals', MASTER_GOALS.length);
  let html = `<div class="section-title">MASTER GOALS</div><div class="panel">`;
  MASTER_GOALS.forEach((txt,i)=>{
    html += taskRowChecklist(g, i, esc(txt), `goals|${i}`);
  });
  html += `</div>`;

  html += `<div class="section-title">WEEKLY TIME BUDGET</div>
  <div class="stat-cards">
    <div class="stat-card"><div class="v">8–9</div><div class="k">BACKEND HRS/WK</div></div>
    <div class="stat-card"><div class="v">4–5</div><div class="k">DSA HRS/WK</div></div>
    <div class="stat-card"><div class="v">13–14</div><div class="k">TOTAL HRS/WK</div></div>
  </div>`;

  html += `<div class="section-title">DAILY EXECUTION LOOP</div><div class="panel">
    <div class="loop-flow">LEARN <span class="arrow">→</span> CODE <span class="arrow">→</span> SOLVE <span class="arrow">→</span> EXPLAIN <span class="arrow">→</span> REVIEW <span class="arrow">→</span> TRACK</div>
  </div>`;

  html += `<div class="section-title">ONE RULE FOR ALL 75 DAYS</div><div class="panel">
    <p style="color:var(--amber); margin:0 0 8px;">30% learning → 70% coding/problem solving.</p>
    <p class="small dim" style="margin:0;">Don't turn the roadmap into a tutorial-watching challenge. If you learn a concept, use it. If you learn Redis, put it into the project. If you learn DP, solve the problem without looking at the answer.</p>
  </div>`;
  return html;
}

function ensureChecklist(name, len){
  if(!STATE.checklists[name] || STATE.checklists[name].length!==len){
    STATE.checklists[name] = new Array(len).fill(false);
  }
  return STATE.checklists[name];
}
function ensureDsaVault(key, len){
  if(!STATE.checklists.dsaVault) STATE.checklists.dsaVault = {};
  if(!STATE.checklists.dsaVault[key] || STATE.checklists.dsaVault[key].length!==len){
    STATE.checklists.dsaVault[key] = new Array(len).fill(false);
  }
  return STATE.checklists.dsaVault[key];
}
export function toggleChecklist(name, idx){
  const lens = {goals:MASTER_GOALS.length, skills:BACKEND_SKILLS.length, review:FINAL_REVIEW.length};
  const arr = ensureChecklist(name, lens[name]);
  arr[idx] = !arr[idx];
  saveChecklists();
  requestRender();
}

export function renderDsaVault(){
  let html = `<div class="section-title">DSA VAULT — PROBLEM SET</div>`;
  DSA_VAULT.forEach(cat=>{
    const arr = ensureDsaVault(cat.key, cat.items.length);
    const done = arr.filter(Boolean).length;
    html += `<div class="week-banner">${esc(cat.name)} <span class="dim">(${done}/${cat.items.length})</span></div><div class="panel">`;
    cat.items.forEach((txt,i)=>{
      html += taskRowDsa(arr, i, esc(txt), `${cat.key}|${i}`);
    });
    html += `</div>`;
  });
  return html;
}
export function toggleDsa(key, idx){
  const cat = DSA_VAULT.find(c=>c.key===key);
  const arr = ensureDsaVault(key, cat.items.length);
  arr[idx] = !arr[idx];
  saveChecklists();
  requestRender();
}

export function renderSkills(){
  const arr = ensureChecklist('skills', BACKEND_SKILLS.length);
  let html = `<div class="section-title">BACKEND SKILLS TREE</div><div class="panel">`;
  BACKEND_SKILLS.forEach((txt,i)=>{
    html += taskRowChecklist(arr, i, esc(txt), `skills|${i}`);
  });
  html += `</div>`;
  return html;
}

export function renderReview(){
  const arr = ensureChecklist('review', FINAL_REVIEW.length);
  let html = `<div class="section-title">FINAL 75-DAY REVIEW</div><div class="panel">`;
  FINAL_REVIEW.forEach((txt,i)=>{
    html += taskRowChecklist(arr, i, esc(txt), `review|${i}`);
  });
  html += `</div>`;
  return html;
}

export function renderJobs(){
  let rows = '';
  STATE.jobs.forEach((j,i)=>{
    rows += `<tr>
      <td><input value="${esc(j.application)}" data-job="${i}|application"></td>
      <td><input value="${esc(j.role)}" data-job="${i}|role"></td>
      <td><input type="date" value="${esc(j.date)}" data-job="${i}|date"></td>
      <td><select data-job="${i}|status">
        ${['Applied','Interview','Offer','Rejected','Ghosted'].map(o=>`<option ${j.status===o?'selected':''}>${o}</option>`).join('')}
      </select></td>
      <td><input value="${esc(j.followup)}" data-job="${i}|followup"></td>
      <td class="job-del" data-job-del="${i}">✕</td>
    </tr>`;
  });
  return `
  <div class="section-title">JOB APPLICATION TRACKER</div>
  <p class="small dim">Start applying around Day 25 and continue through Days 26–75.</p>
  <div class="panel" style="overflow-x:auto;">
    <table class="jobtable">
      <tr><th>Company</th><th>Role</th><th>Date</th><th>Status</th><th>Follow-up</th><th></th></tr>
      ${rows || '<tr><td colspan="6" class="dim" style="text-align:center; padding:16px;">No applications logged yet.</td></tr>'}
    </table>
  </div>
  <button class="btn block" data-job-add>+ ADD APPLICATION</button>
  `;
}
export function addJob(){
  STATE.jobs.push({application:'',role:'',date:'',status:'Applied',followup:''});
  saveJobs();
  requestRender();
}
export function updateJob(i, field, val){
  STATE.jobs[i][field] = val;
  saveJobs();
}
export function removeJob(i){
  STATE.jobs.splice(i,1);
  saveJobs();
  requestRender();
}
