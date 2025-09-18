import React, { useContext, useMemo, useState } from "react";
import styled from "styled-components";
import { InnerLayout } from "../../styles/Layouts";
import send_icon from "../../img/send_icon.png";
import user_icon from "../../img/user_icon.png";
import gemini_icon from "../../img/gemini_icon.png";
import runChat from "../../config/gemini";
import { AIContext } from "../../context/AIContext";

function HealthCoachSuite(){
  // --- Shared profile ---
  const [profile, setProfile] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('coach_profile')||'{}'); }catch(_){ return {}; } });
  const [fitnessLevel, setFitnessLevel] = useState('light');
  const [focus, setFocus] = useState({ sleep: true, diet: true, stress: true, activity: true });
  const { triageLevel, lifestyleSuggestions, trendsNote, summary } = useContext(AIContext);

  const metrics = useMemo(()=>{
    const h = Number(profile.height_cm||0)/100; const w = Number(profile.weight_kg||0);
    const bmi = h>0 && w>0 ? +(w/(h*h)).toFixed(1) : null; let risk = 0;
    if (bmi && (bmi<18.5 || bmi>=25)) risk+=2; if ((profile.sleep_hours||0)<6) risk+=1; if ((profile.steps_day||0)<5000) risk+=1;
    if (String(profile.smoke||'no')==='yes') risk+=2; const level = risk>=4?'high':risk>=2?'moderate':'low';
    return { bmi, level };
  }, [profile]);

  // --- Planner logic (from HealthCoach) ---
  const plan = useMemo(()=>{
    const items = [];
    const section = (title, list)=>({ title, list });
    if (focus.activity){
      if (fitnessLevel==='light') items.push(section('Activity (light)', ['Daily: 15–20 min brisk walk or slow cycle','2×/week: 8–10 min mobility (hips/shoulders/neck)','Stand/stretch 1–2 min every hour']));
      if (fitnessLevel==='medium') items.push(section('Activity (medium)', ['3×/week: 25–35 min cardio (moderate)','2×/week: bodyweight strength (push/pull/squat/core)','Daily: 5–10 min mobility or short walk']));
      if (fitnessLevel==='heavy') items.push(section('Activity (heavy)', ['4×/week: strength split or HIIT','1× zone‑2 session (45–60 min)','Active recovery day: easy walk + mobility']));
    }
    if (focus.diet){ items.push(section('Diet & hydration', ['Hydration: 30–35 ml/kg/day','Half plate veggies + protein at meals','Limit ultra‑processed snacks; choose nuts/fruit','Lighter dinner; avoid heavy sugar 2–3 h pre‑bed'])); }
    if (focus.sleep){ items.push(section('Sleep hygiene', ['Consistent schedule (±30 min)','Screens off or night mode 60 min before bed','Cool, dark room; caffeine cutoff 8 h before sleep'])); }
    if (focus.stress){ items.push(section('Stress care', ['Daily 2–5 min breathing (4‑7‑8/box)','Micro‑journal: 3 bullets; reframe one to action','Connect with one trusted person/day'])); }
    const hints=[]; if (triageLevel==='emergency') hints.push('Your symptoms suggested urgency—follow clinician advice first.');
    if (trendsNote) hints.push(trendsNote); if ((lifestyleSuggestions||[]).length>0) hints.push(`Self‑care: ${lifestyleSuggestions.join(' • ')}`); if (summary) hints.push(`Summary: ${summary}`);
    return { items, hints };
  }, [fitnessLevel, focus, triageLevel, lifestyleSuggestions, trendsNote, summary]);

  // --- Chat (from CoachBot) ---
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [recentPrompt, setRecentPrompt] = useState("");
  const [resultData, setResultData] = useState("");
  const [chatLog, setChatLog] = useState([]); // {role, html, time}

  async function sendToCoach(message){
    const text = (message || input || '').trim(); if (!text) return;
    setInput(""); setLoading(true); setShowResult(true); setRecentPrompt(text); setResultData("");
    setChatLog(prev=>[...prev, { role:'user', html: escapeHtml(text), time: new Date().toISOString() }]);
    const system = `You are HealthCoach, a supportive health & lifestyle assistant. Answer ONLY health/fitness/nutrition/sleep/stress topics. Provide precise, actionable plans with sections Today / This Week / Next 30 Days. Personalize with the user profile. Avoid medical diagnosis.`;
    const context = `Profile\nAge:${profile.age||''} Sex:${profile.sex||''} Height:${profile.height_cm||''}cm Weight:${profile.weight_kg||''}kg BMI:${metrics.bmi??''}\nGoal:${profile.goal||''} Schedule:${profile.schedule||''} Sleep:${profile.sleep_hours||''}h Steps:${profile.steps_day||''}\nDiet:${profile.diet_style||''} Restrictions:${profile.restrictions||''} Smoke:${profile.smoke||'no'} Alcohol:${profile.alcohol||'no'} Risk:${metrics.level}`;
    const composed = `${system}\n\n${context}\n\nUser: ${text}`;
    const resp = await runChat(composed);
    const html = resp.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>');
    setResultData(html); setLoading(false);
    setChatLog(prev=>[...prev, { role:'assistant', html, time: new Date().toISOString() }]);
  }

  const oneClick = [
    'Make a one‑day balanced meal plan with timings and portions.',
    'Create a 7‑day workout split suited to my level and schedule.',
    'Design a bedtime routine to improve deep sleep.',
    'Give a daily 10‑minute stress routine (breathing + micro‑journal).',
  ];

  const syncAndAsk = (prompt)=>{
    localStorage.setItem('coach_profile', JSON.stringify(profile));
    sendToCoach(prompt);
  };

  const escapeHtml = (s="") => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const openPrintableReport = () => {
    const win = window.open('', '_blank'); if (!win) return;
    const date = new Date().toLocaleString();
    const transcriptHtml = chatLog.map(m=>`<div class="msg ${m.role}"><div class="who">${m.role==='user'?'You':'Coach'}</div><div class="bubble">${m.html}</div><div class="time">${new Date(m.time).toLocaleString()}</div></div>`).join('');
    const profileHtml = `Age: ${escapeHtml(profile.age||'')} • Sex: ${escapeHtml(profile.sex||'')} • Height: ${escapeHtml(profile.height_cm||'')} cm • Weight: ${escapeHtml(profile.weight_kg||'')} kg • BMI: ${metrics.bmi??''} • Risk: ${metrics.level}`;
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Coach Chat Report</title><style>body{font-family:Arial,sans-serif;color:#111;padding:24px;}h1{margin:0 0 8px 0}.meta{color:#555;margin-bottom:16px}.msg{margin:10px 0}.who{font-weight:bold;margin-bottom:4px}.bubble{background:#f5f5f7;padding:10px 12px;border-radius:12px}.assistant .bubble{background:#eef2ff}.time{color:#777;font-size:12px;margin-top:4px}</style></head><body><h1>Coach Chat Report</h1><div class="meta">Generated: ${date}</div><div class="meta">Profile: ${profileHtml}</div><div>${transcriptHtml||'<div>No messages yet.</div>'}</div><script>window.onload=function(){setTimeout(()=>window.print(),250)}</script></body></html>`;
    win.document.open(); win.document.write(html); win.document.close();
  };

  return (
    <Wrap>
      <InnerLayout className="main">
        <div className="nav"><h3>Health Coach (Planner + Bot)</h3></div>
        <div className="layout">
          <div className="left surface elevate">
            <h4>Your profile</h4>
            <div className="grid">
              <input type="number" inputMode="numeric" placeholder="Age" value={String(profile.age||'')} onChange={(e)=>setProfile({...profile, age:e.target.value})} autoComplete="off" autoCorrect="off" spellCheck={false} />
              <select value={String(profile.sex||'')} onChange={(e)=>setProfile({...profile, sex:e.target.value})}><option value="">Sex</option><option>female</option><option>male</option><option>other</option></select>
              <input type="number" inputMode="numeric" placeholder="Height (cm)" value={String(profile.height_cm||'')} onChange={(e)=>setProfile({...profile, height_cm:e.target.value})} autoComplete="off" />
              <input type="number" inputMode="numeric" placeholder="Weight (kg)" value={String(profile.weight_kg||'')} onChange={(e)=>setProfile({...profile, weight_kg:e.target.value})} autoComplete="off" />
              <input type="text" placeholder="Goal (e.g., fat loss, muscle)" value={String(profile.goal||'')} onChange={(e)=>setProfile({...profile, goal:e.target.value})} />
              <input type="text" placeholder="Schedule (e.g., mornings, 30 min)" value={String(profile.schedule||'')} onChange={(e)=>setProfile({...profile, schedule:e.target.value})} />
              <input type="number" inputMode="numeric" placeholder="Sleep hours/night" value={String(profile.sleep_hours||'')} onChange={(e)=>setProfile({...profile, sleep_hours:e.target.value})} />
              <input type="number" inputMode="numeric" placeholder="Steps/day" value={String(profile.steps_day||'')} onChange={(e)=>setProfile({...profile, steps_day:e.target.value})} />
              <input type="text" placeholder="Diet style" value={String(profile.diet_style||'')} onChange={(e)=>setProfile({...profile, diet_style:e.target.value})} />
              <input type="text" placeholder="Restrictions (allergies)" value={String(profile.restrictions||'')} onChange={(e)=>setProfile({...profile, restrictions:e.target.value})} />
              <select value={profile.smoke||'no'} onChange={(e)=>setProfile({...profile, smoke:e.target.value})}><option value="no">Smoke: no</option><option value="yes">Smoke: yes</option></select>
              <select value={profile.alcohol||'no'} onChange={(e)=>setProfile({...profile, alcohol:e.target.value})}><option value="no">Alcohol: no</option><option value="yes">Alcohol: yes</option></select>
            </div>
            <div className="meta">BMI: {metrics.bmi ?? '-'} • Risk: {metrics.level}</div>

            <h4 className="mt">Preventive plan</h4>
            <div className="controls">
              <div className="stack">
                <button className="btn" onClick={()=>setFitnessLevel('light')}>Light</button>
                <button className="btn" onClick={()=>setFitnessLevel('medium')}>Medium</button>
                <button className="btn" onClick={()=>setFitnessLevel('heavy')}>Heavy</button>
              </div>
              <div className="opts">
                <label><input type="checkbox" checked={focus.activity} onChange={(e)=>setFocus({...focus, activity:e.target.checked})}/> Activity</label>
                <label><input type="checkbox" checked={focus.diet} onChange={(e)=>setFocus({...focus, diet:e.target.checked})}/> Diet</label>
                <label><input type="checkbox" checked={focus.sleep} onChange={(e)=>setFocus({...focus, sleep:e.target.checked})}/> Sleep</label>
                <label><input type="checkbox" checked={focus.stress} onChange={(e)=>setFocus({...focus, stress:e.target.checked})}/> Stress</label>
              </div>
            </div>

            <div className="grid-cards">
              {plan.items.map((s,i)=> (
                <div key={i} className="card surface elevate"><h5>{s.title}</h5><ul>{s.list.map((l,j)=>(<li key={j}>{l}</li>))}</ul></div>
              ))}
            </div>
            {plan.hints?.length>0 && (<div className="notes surface elevate"><h5>Personalization</h5><ul>{plan.hints.map((h,i)=>(<li key={i}>{h}</li>))}</ul></div>)}

            <div className="chips">
              {oneClick.map((q,i)=>(<button key={i} className="chip" onClick={()=>syncAndAsk(q)}>{q}</button>))}
            </div>
          </div>

          <div className="right surface elevate">
            {!showResult ? (
              <div className="greet"><p><span>Hi! I’m your Health Coach.</span></p><p>Fill your profile and click a chip or ask me anything health‑related.</p></div>
            ) : (
              <div className="result">
                <div className="result-title"><img src={user_icon} alt="" /><p>{recentPrompt}</p></div>
                <div className="result-data"><img src={gemini_icon} alt="" />{loading? <div className="loader"><hr/><hr/><hr/></div> : <p dangerouslySetInnerHTML={{__html: resultData}}></p>}</div>
              </div>
            )}
            <div className="search-box surface elevate">
              <input value={input} onChange={(e)=>setInput(e.target.value)} type="text" placeholder="E.g., Make a meal plan for a day" onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); syncAndAsk(); } }} />
              <div><img src={send_icon} alt="" onClick={()=>syncAndAsk()} /></div>
            </div>
            <div className="tools">
              <button className="btn btn-outline" onClick={openPrintableReport}>Generate Chat PDF</button>
            </div>
          </div>
        </div>
      </InnerLayout>
    </Wrap>
  );
}

const Wrap = styled.div`
  .main{ display:flex; flex-direction:column; gap: var(--space-6); }
  .nav h3{ color: var(--color-primary-300); font-size: var(--font-size-2xl); font-weight: 700; }
  .layout{ display:grid; grid-template-columns: 1.1fr 1fr; gap: var(--space-6); }
  .left, .right{ padding: var(--space-6); border-radius: var(--radius-lg); }
  .grid{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: var(--space-3); margin-top: var(--space-3); }
  .grid input, .grid select{ padding: 10px 12px; border-radius: 10px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); }
  .meta{ margin-top: 8px; color: var(--color-text-dim); }
  .controls{ margin-top: var(--space-4); }
  .stack{ display:flex; gap: var(--space-3); }
  .opts{ display:flex; gap: var(--space-4); margin-top: 8px; flex-wrap: wrap; }
  .grid-cards{ margin-top: var(--space-4); display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: var(--space-4); }
  .card{ padding: var(--space-4); border-radius: var(--radius-lg); }
  .card ul{ margin-top: 6px; padding-left: 18px; display:grid; gap:6px; }
  .notes{ margin-top: var(--space-4); padding: var(--space-4); border-radius: var(--radius-lg); }
  .chips{ display:flex; flex-wrap:wrap; gap: 8px; margin-top: var(--space-3); }
  .chip{ padding: 8px 10px; border-radius: 999px; border: 1px solid var(--color-border); background: var(--glass); color: var(--color-text); cursor: pointer; }
  .greet{ color: var(--color-text-dim); }
  .result{ padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); }
  .result-title{ margin: var(--space-4) 0; display:flex; align-items:center; gap: var(--space-3); }
  .result img{ width: 32px; border-radius:50%; opacity:.9; }
  .result-data{ display:flex; gap: var(--space-3); align-items:flex-start; }
  .loader{ width:100%; display:flex; flex-direction:column; gap:10px; }
  .loader hr{ border-radius:4px; border:none; background: linear-gradient(to right, #d5a8ff, #f6f7f8, #d5a8ff); height:20px; animation: loader 3s infinite linear; }
  .search-box{ display:flex; align-items:center; justify-content:space-between; gap: var(--space-3); padding: 10px 16px; border-radius:999px; margin-top: var(--space-4); }
  .search-box input{ flex:1; background: transparent; border:none; outline:none; color: var(--color-text); font-size: 16px; }
  .tools{ margin-top: var(--space-3); }
  @media (max-width: 900px){ .layout{ grid-template-columns: 1fr; } .grid{ grid-template-columns: 1fr; } .grid-cards{ grid-template-columns: 1fr; } }
`;

export default HealthCoachSuite;


