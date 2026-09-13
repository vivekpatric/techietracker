import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { supabaseClient } from './lib/supabase';
import { configureUI, navigate as busNavigate, requestRender } from './lib/uiBus';
import { handleSession, login, signup, forgotPassword, logout } from './auth';
import { currentUser, setCurrentUser, loadState } from './state';
import { renderLogin, renderBoot, renderSelect, renderDay, renderGoals, renderDsaVault, renderSkills, renderReview, renderJobs, toggleTask, updateNote, markDay, toggleChecklist, toggleDsa, addJob, updateJob, removeJob } from './pages/renderers';
import './styles/styles.css';

function Shell({screen, children, onNavigate, onLogout}) {
  const titles={select:'DAY SELECT',day:'DAY LOG',goals:'QUEST BRIEFING',dsa:'DSA VAULT',skills:'SKILLS TREE',jobs:'JOB TRACKER',review:'FINAL REVIEW'};
  const publicScreen=screen==='login'||screen==='boot';
  return <>
    <div id="login-bg" style={{display:screen==='login'?'block':'none'}} />
    <div id="boot-bg" style={{display:screen==='boot'?'block':'none'}} />
    <div className="crt"/><div className="vignette"/>
    <div id="cozy-pet" aria-hidden="true" style={{display:publicScreen?'none':'block'}}><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g className="twinkle-a" transform="translate(3,3)"><rect x="2" y="0" width="2" height="2" fill="var(--cyan)"/><rect x="0" y="2" width="6" height="2" fill="var(--cyan)"/><rect x="2" y="4" width="2" height="2" fill="var(--cyan)"/></g><g className="twinkle-b" transform="translate(25,14)"><rect x="1" y="0" width="2" height="2" fill="var(--magenta)"/><rect x="0" y="2" width="4" height="2" fill="var(--magenta)"/><rect x="1" y="4" width="2" height="2" fill="var(--magenta)"/></g><g className="steam steam1" transform="translate(11,8)"><rect width="2" height="4" fill="#cdf7d4"/></g><g className="steam steam2" transform="translate(15,7)"><rect width="2" height="5" fill="#cdf7d4"/></g><g className="steam steam3" transform="translate(19,8)"><rect width="2" height="4" fill="#cdf7d4"/></g><g className="mug" transformOrigin="16px 26px"><rect x="10" y="16" width="14" height="2" fill="#ff8fc4"/><rect x="10" y="18" width="14" height="8" fill="#ffb3d6"/><rect x="10" y="24" width="14" height="2" fill="#e57bb0"/><rect x="24" y="18" width="2" height="2" fill="#ffb3d6"/><rect x="26" y="18" width="2" height="6" fill="#ffb3d6"/><rect x="24" y="24" width="2" height="2" fill="#ffb3d6"/></g><rect x="6" y="27" width="20" height="2" fill="var(--line-bright)" opacity="0.6"/></svg></div>
    {!publicScreen && <div id="hud" style={{display:'flex'}}><div className="hud-left"><span className="hud-title">{titles[screen]||'75-DAY QUEST'}</span></div><button id="menu-btn" onClick={()=>document.getElementById('overlay')?.classList.add('open')}>MENU</button></div>}
    {children}
    {!publicScreen && <div id="overlay"><div className="ov-title pixel">PAUSE MENU</div><div className="ov-list">{[['boot','TITLE SCREEN'],['select','DAY SELECT'],['goals','QUEST BRIEFING'],['dsa','DSA VAULT'],['skills','SKILLS TREE'],['jobs','JOB TRACKER'],['review','FINAL REVIEW']].map(([s,t])=><div className="ov-item" key={s} onClick={()=>{document.getElementById('overlay')?.classList.remove('open');onNavigate(s)}}>{t}<span>›</span></div>)}<div className="ov-item" onClick={onLogout} style={{borderColor:'var(--magenta)',color:'var(--magenta)'}}>LOG OUT <span>›</span></div></div><button className="btn block ov-close" onClick={()=>document.getElementById('overlay')?.classList.remove('open')}>CLOSE ✕</button></div>}
  </>;
}

function ConfirmModal({state, onYes, onCancel}) {
  return <div id="confirm-modal" className={state?'open':''}>
    <div className="cm-box">
      <div className="cm-msg">{state?state.msg:''}</div>
      <div className="cm-actions">
        <button className="btn magenta" onClick={onYes}>YES</button>
        <button className="btn" onClick={onCancel}>CANCEL</button>
      </div>
    </div>
  </div>;
}

function setAuthMsg(msg, ok=false){const el=document.getElementById('auth-error');if(el){el.textContent=msg;el.style.color=ok?'var(--green)':'var(--danger)';}}

export default function App(){
  const [screen,setScreen]=useState('boot');
  const [day,setDay]=useState(1);
  const [tick,force]=useState(0);
  const [sessionReady,setSessionReady]=useState(false);
  const [confirmState,setConfirmState]=useState(null);

  const nav=(next,param)=>{setScreen(next);if(next==='day'&&param)setDay(Number(param));window.scrollTo(0,0);requestRender();};
  useEffect(()=>{configureUI({render:()=>force(x=>x+1),navigate:nav,confirm:(msg,onYes)=>setConfirmState({msg,onYes})});return()=>configureUI({});},[]);

  useEffect(()=>{
    let mounted=true;
    supabaseClient.auth.getSession().then(async({data})=>{if(!mounted)return;if(data.session?.user){setCurrentUser(data.session.user);await loadState();setScreen('boot');}else setScreen('login');setSessionReady(true);});
    const {data:{subscription}}=supabaseClient.auth.onAuthStateChange(async(_event,session)=>{if(!mounted)return;if(session?.user){setCurrentUser(session.user);await loadState();setScreen('boot');}else{setCurrentUser(null);setScreen('login');}});
    return()=>{mounted=false;subscription.unsubscribe();};
  },[]);

  const html=useMemo(()=>{
    if(screen==='login')return renderLogin();
    if(screen==='boot')return renderBoot();
    if(screen==='select')return renderSelect();
    if(screen==='day')return renderDay(day);
    if(screen==='goals')return renderGoals();
    if(screen==='dsa')return renderDsaVault();
    if(screen==='skills')return renderSkills();
    if(screen==='jobs')return renderJobs();
    return renderReview();
  },[screen,day,tick]);

  const onLogout=async()=>{await logout();};

  const handleClick=async(e)=>{
    const navEl=e.target.closest('[data-nav]');if(navEl){const [s,p]=navEl.dataset.nav.split(':');nav(s,p);return;}
    const action=e.target.closest('[data-action]')?.dataset.action;if(action){const email=document.getElementById('auth-email')?.value.trim();const password=document.getElementById('auth-password')?.value||'';try{if(!email||(!password&&action!=='forgot')){setAuthMsg('Enter both email and password.');return;}if(action==='login'){setAuthMsg('Logging in...',true);const {error}=await login(email,password);if(error)throw error;}if(action==='signup'){setAuthMsg('Creating account...',true);const {data,error}=await signup(email,password);if(error)throw error;setAuthMsg(data.session?'Account created successfully.':'Account created. Check your email to confirm your account.',true);}if(action==='forgot'){if(!email){setAuthMsg('Type your email above first, then tap this again.');return;}const {error}=await forgotPassword(email);if(error)throw error;setAuthMsg('Password reset email sent — check your inbox.',true);}}catch(err){setAuthMsg(err?.message||'Something went wrong.');}return;}
    const task=e.target.closest('[data-task]');if(task){const [d,s,i]=task.dataset.task.split('|');toggleTask(Number(d),s,Number(i));return;}
    const check=e.target.closest('[data-check]');if(check){const [type,i]=check.dataset.check.split('|');toggleChecklist(type,Number(i));return;}
    const dsa=e.target.closest('[data-dsa]');if(dsa){const [cat,i]=dsa.dataset.dsa.split('|');toggleDsa(cat,Number(i));return;}
    const clear=e.target.closest('[data-day-clear]');if(clear){markDay(Number(clear.dataset.dayClear),true);return;}
    const reset=e.target.closest('[data-day-reset]');if(reset){markDay(Number(reset.dataset.dayReset),false);return;}
    const add=e.target.closest('[data-job-add]');if(add){addJob();return;}
    const del=e.target.closest('[data-job-del]');if(del){removeJob(Number(del.dataset.jobDel));return;}
  };
  const handleInput=(e)=>{
    const n=e.target.closest('[data-note]');if(n){const [d,f]=n.dataset.note.split('|');updateNote(Number(d),f,n.value);return;}
    const j=e.target.closest('[data-job]');if(j){const [i,field]=j.dataset.job.split('|');updateJob(Number(i),field,j.value);return;}
  };

  if(!sessionReady)return <div className="loading-screen">CONNECTING...</div>;
  return <>
    <Shell screen={screen} onNavigate={nav} onLogout={onLogout}><main id="app" onClick={handleClick} onInput={handleInput} onChange={handleInput} dangerouslySetInnerHTML={{__html:html}} /></Shell>
    <ConfirmModal state={confirmState} onYes={()=>{const fn=confirmState?.onYes;setConfirmState(null);if(fn)fn();}} onCancel={()=>setConfirmState(null)} />
  </>;
}
