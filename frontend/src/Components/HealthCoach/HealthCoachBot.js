import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { InnerLayout } from "../../styles/Layouts";
import send_icon from "../../img/send_icon.png";
import user_icon from "../../img/user_icon.png";
import gemini_icon from "../../img/gemini_icon.png";
import runChat from "../../config/gemini";

function HealthCoachBot(){
  const [profile, setProfile] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('coach_profile')||'{}'); }catch(_){ return {}; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [recentPrompt, setRecentPrompt] = useState("");
  const [resultData, setResultData] = useState("");

  const metrics = useMemo(()=>{
    const h = Number(profile.height_cm||0)/100;
    const w = Number(profile.weight_kg||0);
    const bmi = h>0 && w>0 ? +(w/(h*h)).toFixed(1) : null;
    const age = Number(profile.age||0);
    // Very small lightweight model (heuristic scoring)
    let risk = 0;
    if (bmi && (bmi<18.5 || bmi>=25)) risk+=2;
    if (age>=45) risk+=1;
    if ((profile.sleep_hours||0) < 6) risk+=1;
    if ((profile.steps_day||0) < 5000) risk+=1;
    if (String(profile.smoke)||'' === 'yes') risk+=2;
    const level = risk>=4 ? 'high' : risk>=2 ? 'moderate' : 'low';
    return { bmi, risk, level };
  }, [profile]);

  useEffect(()=>{ localStorage.setItem('coach_profile', JSON.stringify(profile)); }, [profile]);

  async function onSent(msg){
    const text = (msg || input || '').trim();
    if (!text) return;
    setInput(""); setLoading(true); setShowResult(true); setRecentPrompt(text); setResultData("");
    const system = `You are HealthCoach, a supportive health & lifestyle assistant. Answer ONLY health, fitness, nutrition, sleep, stress, habit and preventive-care topics. Avoid diagnosis or medical judgments. Use short sections and bullets. Tailor guidance using the user's profile below. Provide precise, actionable plans broken into: Today, This Week, Next 30 Days. Avoid filler and disclaimers. If asked outside health/lifestyle, politely steer back.`;
    const context = `Profile\n------\nAge: ${profile.age||''}\nSex: ${profile.sex||''}\nHeight: ${profile.height_cm||''} cm\nWeight: ${profile.weight_kg||''} kg\nBMI: ${metrics.bmi??''}\nGoal: ${profile.goal||''}\nSchedule focus: ${profile.schedule||''}\nSleep: ${profile.sleep_hours||''} h\nDaily steps: ${profile.steps_day||''}\nDiet style: ${profile.diet_style||''}\nRestrictions: ${profile.restrictions||''}\nSmoke: ${profile.smoke||'no'}, Alcohol: ${profile.alcohol||'no'}\nRisk level: ${metrics.level}`;
    const composed = `${system}\n\n${context}\n\nUser: ${text}`;
    const resp = await runChat(composed);
    const html = resp.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>');
    setResultData(html); setLoading(false);
  }

  const quick = [
    'Create a 7‑day workout matching my level and schedule.',
    'Give a 1‑week balanced meal plan with vegetarian options.',
    'Design a sleep routine for better deep sleep.',
    'Suggest a stress-reduction plan I can do in 10 minutes daily.',
  ];

  return (
    <Wrap>
      <InnerLayout className="main">
        <div className="nav"><h3>Health Coach Bot</h3></div>
        <div className="layout">
          <div className="surface elevate left">
            <h4>Your profile</h4>
            <div className="grid">
              <input placeholder="Age" value={profile.age||''} onChange={(e)=>setProfile({...profile, age:e.target.value})} />
              <select value={profile.sex||''} onChange={(e)=>setProfile({...profile, sex:e.target.value})}>
                <option value="">Sex</option>
                <option>female</option><option>male</option><option>other</option>
              </select>
              <input placeholder="Height (cm)" value={profile.height_cm||''} onChange={(e)=>setProfile({...profile, height_cm:e.target.value})} />
              <input placeholder="Weight (kg)" value={profile.weight_kg||''} onChange={(e)=>setProfile({...profile, weight_kg:e.target.value})} />
              <input placeholder="Goal (e.g., fat loss, muscle, energy)" value={profile.goal||''} onChange={(e)=>setProfile({...profile, goal:e.target.value})} />
              <input placeholder="Schedule focus (e.g., mornings, 30 min)" value={profile.schedule||''} onChange={(e)=>setProfile({...profile, schedule:e.target.value})} />
              <input placeholder="Sleep hours/night" value={profile.sleep_hours||''} onChange={(e)=>setProfile({...profile, sleep_hours:e.target.value})} />
              <input placeholder="Steps/day" value={profile.steps_day||''} onChange={(e)=>setProfile({...profile, steps_day:e.target.value})} />
              <input placeholder="Diet style (veg, high-protein...)" value={profile.diet_style||''} onChange={(e)=>setProfile({...profile, diet_style:e.target.value})} />
              <input placeholder="Restrictions (allergies, intolerances)" value={profile.restrictions||''} onChange={(e)=>setProfile({...profile, restrictions:e.target.value})} />
              <select value={profile.smoke||'no'} onChange={(e)=>setProfile({...profile, smoke:e.target.value})}><option value="no">Smoke: no</option><option value="yes">Smoke: yes</option></select>
              <select value={profile.alcohol||'no'} onChange={(e)=>setProfile({...profile, alcohol:e.target.value})}><option value="no">Alcohol: no</option><option value="yes">Alcohol: yes</option></select>
            </div>
            <div className="meta">BMI: {metrics.bmi ?? '-'} &nbsp;•&nbsp; Risk: {metrics.level}</div>
            <div className="chips">
              {quick.map((q,i)=>(<button key={i} className="chip" onClick={()=>onSent(q)}>{q}</button>))}
            </div>
          </div>
          <div className="surface elevate right">
            {!showResult ? (
              <div className="greet">
                <p><span>Hi! I’m your Health Coach.</span></p>
                <p>Tell me your goal and schedule. I’ll build a plan just for you.</p>
              </div>
            ) : (
              <div className="result">
                <div className="result-title"><img src={user_icon} alt="" /><p>{recentPrompt}</p></div>
                <div className="result-data"><img src={gemini_icon} alt="" />{loading? <div className="loader"><hr/><hr/><hr/></div> : <p dangerouslySetInnerHTML={{__html: resultData}}></p>}</div>
              </div>
            )}
            <div className="search-box surface elevate">
              <input value={input} onChange={(e)=>setInput(e.target.value)} type="text" placeholder="Ask me for a workout, diet, sleep or stress plan" onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); onSent(); } }} />
              <div><img src={send_icon} alt="" onClick={()=>onSent()} /></div>
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
  .layout{ display:grid; grid-template-columns: 1fr 1.4fr; gap: var(--space-6); }
  .left, .right{ padding: var(--space-6); border-radius: var(--radius-lg); }
  .grid{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: var(--space-3); margin-top: var(--space-3); }
  .grid input, .grid select{ padding: 10px 12px; border-radius: 10px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); }
  .meta{ margin-top: 8px; color: var(--color-text-dim); }
  .chips{ display:flex; flex-wrap:wrap; gap: 8px; margin-top: 10px; }
  .chip{ padding: 8px 10px; border-radius: 999px; border: 1px solid var(--color-border); background: var(--glass); color: var(--color-text); cursor: pointer; }
  .greet{ color: var(--color-text-dim); }
  .result{ padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); }
  .result-title{ margin: var(--space-4) 0; display:flex; align-items:center; gap: var(--space-3); }
  .result img{ width: 32px; border-radius:50%; opacity:.9; }
  .result-data{ display:flex; gap: var(--space-3); align-items:flex-start; }
  .loader{ width:100%; display:flex; flex-direction:column; gap:10px; }
  .loader hr{ border-radius:4px; border:none; background: linear-gradient(to right, #d5a8ff, #f6f7f8, #d5a8ff); height:20px; animation: loader 3s infinite linear; }
  @keyframes loader { 0%{ background-position: -800px 0;} 100%{ background-position: 800px 0;} }
  .search-box{ display:flex; align-items:center; justify-content:space-between; gap: var(--space-3); padding: 10px 16px; border-radius:999px; margin-top: var(--space-4); }
  .search-box input{ flex:1; background: transparent; border:none; outline:none; color: var(--color-text); font-size: 16px; }
  @media (max-width: 900px){ .layout{ grid-template-columns: 1fr; } .grid{ grid-template-columns: 1fr; } }
`;

export default HealthCoachBot;


