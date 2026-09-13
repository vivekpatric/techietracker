import { DAYS, MASTER_GOALS, BACKEND_SKILLS, FINAL_REVIEW, DSA_VAULT, INTERVIEW_ITEMS, REVIEW_ITEMS, EOD_ITEMS } from './data/data';
import { supabaseClient } from './lib/supabase';
import { requestRender } from './lib/uiBus';

export let STATE = { days:{}, checklists:{goals:[],skills:[],review:[],dsaVault:{}}, jobs:[] };
export let currentUser = null;
export const EMPTY_STATE = {days:{}, checklists:{goals:[],skills:[],review:[],dsaVault:{}}, jobs:[]};

export function setCurrentUser(user){ currentUser = user; }
export function setState(next){ STATE = next; ensureStateShape(); requestRender(); }
export function esc(s){ if(s===undefined||s===null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
export function defaultDayState(day){ return {be:new Array(day.be.length).fill(false),dsa:new Array(day.dsa.length).fill(false),interview:new Array(INTERVIEW_ITEMS.length).fill(false),review:new Array(REVIEW_ITEMS.length).fill(false),eod:new Array(EOD_ITEMS.length).fill(false),notes:{learned:'',struggled:'',revise:''}}; }
export function getDayState(d){ const day=DAYS[d-1]; if(!STATE.days[d]) STATE.days[d]=defaultDayState(day); const s=STATE.days[d]; if(s.be.length!==day.be.length)s.be=new Array(day.be.length).fill(false).map((v,i)=>s.be[i]||false); if(s.dsa.length!==day.dsa.length)s.dsa=new Array(day.dsa.length).fill(false).map((v,i)=>s.dsa[i]||false); return s; }
export function dayTotals(d){ const day=DAYS[d-1],s=getDayState(d); const total=day.be.length+day.dsa.length+INTERVIEW_ITEMS.length+REVIEW_ITEMS.length+EOD_ITEMS.length; const done=[s.be,s.dsa,s.interview,s.review,s.eod].reduce((a,arr)=>a+arr.filter(Boolean).length,0); return {done,total,pct:total?Math.round(done/total*100):0}; }
export function overallProgress(){let done=0,total=0;for(let i=1;i<=75;i++){const t=dayTotals(i);done+=t.done;total+=t.total;}return{done,total,pct:total?Math.round(done/total*100):0};}
export function firstUnfinishedDay(){for(let i=1;i<=75;i++){if(dayTotals(i).pct<100)return i;}return 75;}
export function ensureStateShape(){if(!STATE.days)STATE.days={};if(!STATE.checklists)STATE.checklists={goals:[],skills:[],review:[],dsaVault:{}};if(!STATE.jobs)STATE.jobs=[];if(!STATE.checklists.goals||STATE.checklists.goals.length!==MASTER_GOALS.length)STATE.checklists.goals=new Array(MASTER_GOALS.length).fill(false);if(!STATE.checklists.skills||STATE.checklists.skills.length!==BACKEND_SKILLS.length)STATE.checklists.skills=new Array(BACKEND_SKILLS.length).fill(false);if(!STATE.checklists.review||STATE.checklists.review.length!==FINAL_REVIEW.length)STATE.checklists.review=new Array(FINAL_REVIEW.length).fill(false);if(!STATE.checklists.dsaVault)STATE.checklists.dsaVault={};DSA_VAULT.forEach(cat=>{if(!STATE.checklists.dsaVault[cat.key]||STATE.checklists.dsaVault[cat.key].length!==cat.items.length)STATE.checklists.dsaVault[cat.key]=new Array(cat.items.length).fill(false);});}
let saveTimer=null;
export async function loadState(){if(!currentUser)return;try{const {data,error}=await supabaseClient.from('user_data').select('days,checklists,jobs').eq('user_id',currentUser.id).maybeSingle();if(error)throw error;STATE=data?{days:data.days||{},checklists:data.checklists||{goals:[],skills:[],review:[],dsaVault:{}},jobs:data.jobs||[]}:structuredClone(EMPTY_STATE);}catch(e){console.error('loadState failed',e);STATE=structuredClone(EMPTY_STATE);}ensureStateShape();requestRender();}
export function saveState(){clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{if(!currentUser)return;try{const {error}=await supabaseClient.from('user_data').upsert({user_id:currentUser.id,days:STATE.days,checklists:STATE.checklists,jobs:STATE.jobs,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error;}catch(e){console.error('saveState failed',e);}},400);}
export const saveDays=saveState, saveChecklists=saveState, saveJobs=saveState;
