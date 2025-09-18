import React, { useContext, useMemo, useState } from "react";
import styled from "styled-components";
import { InnerLayout } from "../../styles/Layouts";
import { AIContext } from "../../context/AIContext";

function HealthCoach(){
  const { recentPrompt, triageLevel, lifestyleSuggestions, trendsNote, summary } = useContext(AIContext);
  const [fitnessLevel, setFitnessLevel] = useState('light'); // light | medium | heavy
  const [focus, setFocus] = useState({ sleep: true, diet: true, stress: true, activity: true });

  const plan = useMemo(()=>{
    const items = [];
    // Activity
    if (focus.activity){
      if (fitnessLevel === 'light'){
        items.push(section('Activity (light)', [
          'Daily: 15–20 min brisk walk or slow cycle',
          '2×/week: 8–10 min mobility (hips/shoulders/neck)',
          'Desk timer: stand/stretch 1–2 min every hour',
        ]));
      } else if (fitnessLevel === 'medium'){
        items.push(section('Activity (medium)', [
          '3×/week: 25–35 min cardio (zone 2 to moderate)',
          '2×/week: bodyweight strength (push/pull/squat/core)',
          'Daily: 5–10 min mobility or short walk',
        ]));
      } else {
        items.push(section('Activity (heavy)', [
          '4×/week: structured strength split or HIIT (alternate days)',
          '1× long zone‑2 session (45–60 min) for base endurance',
          'Active recovery day: easy walk + mobility 15 min',
        ]));
      }
    }
    // Diet & Hydration
    if (focus.diet){
      items.push(section('Diet & hydration', [
        'Hydration: 30–35 ml/kg/day (more in heat or activity)',
        'Half your plate: vegetables + protein at each meal',
        'Limit ultra‑processed snacks; choose nuts/fruit instead',
        'Evening: lighter dinner, avoid heavy sugar 2–3 h before bed',
      ]));
    }
    // Sleep
    if (focus.sleep){
      items.push(section('Sleep hygiene', [
        'Consistent schedule: same sleep/wake windows (±30 min)',
        'Pre‑sleep: screens off or night mode 60 min before bed',
        'Room: cool, dark, quiet; caffeine cutoff 8 h before sleep',
      ]));
    }
    // Stress
    if (focus.stress){
      items.push(section('Stress & mental fitness', [
        'Daily 2 min: 4‑7‑8 or box breathing; increase to 5 min on tense days',
        'Micro‑journaling: write 3 bullet thoughts, then reframe 1 into action',
        'Connection: message or call one trusted person each day',
      ]));
    }
    // Personalization hints
    const hints = [];
    if (triageLevel === 'emergency') hints.push('Your symptoms suggested urgency. Use this plan only after a clinician clears you.');
    if (trendsNote) hints.push(trendsNote);
    if ((lifestyleSuggestions||[]).length>0) hints.push(`Self‑care from analysis: ${lifestyleSuggestions.join(' \u2022 ')}`);
    if (summary) hints.push(`Summary: ${summary}`);
    return { items, hints };
  }, [fitnessLevel, focus, triageLevel, trendsNote, lifestyleSuggestions, summary]);

  const download = () => {
    const lines = [
      'DocAgent – Preventive Health Plan',
      '---------------------------------',
      `Fitness level: ${fitnessLevel}`,
      '',
      ...plan.items.flat(),
      '',
      'Notes:',
      ...(plan.hints||[])
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `HealthCoach_${Date.now()}.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  return (
    <Wrap>
      <InnerLayout className="main">
        <div className="nav"><h3>Health Coach</h3></div>
        <div className="surface elevate page">
          <div className="head">
            <div className="controls">
              <label>Fitness level</label>
              <div className="stack">
                <button className={`btn ${fitnessLevel==='light'?'':''}`} onClick={()=>setFitnessLevel('light')}>Light</button>
                <button className={`btn ${fitnessLevel==='medium'?'':''}`} onClick={()=>setFitnessLevel('medium')}>Medium</button>
                <button className={`btn ${fitnessLevel==='heavy'?'':''}`} onClick={()=>setFitnessLevel('heavy')}>Heavy</button>
              </div>
              <div className="opts">
                <label><input type="checkbox" checked={focus.activity} onChange={(e)=>setFocus({...focus, activity:e.target.checked})}/> Activity</label>
                <label><input type="checkbox" checked={focus.diet} onChange={(e)=>setFocus({...focus, diet:e.target.checked})}/> Diet</label>
                <label><input type="checkbox" checked={focus.sleep} onChange={(e)=>setFocus({...focus, sleep:e.target.checked})}/> Sleep</label>
                <label><input type="checkbox" checked={focus.stress} onChange={(e)=>setFocus({...focus, stress:e.target.checked})}/> Stress</label>
              </div>
            </div>
            <button className="btn btn-outline" onClick={download}>Download Plan</button>
          </div>

          <div className="grid">
            {plan.items.map((s, i)=> (
              <div key={i} className="card surface elevate">
                <h4>{s.title}</h4>
                <ul>{s.list.map((l, j)=>(<li key={j}>{l}</li>))}</ul>
              </div>
            ))}
          </div>
          {plan.hints?.length>0 && (
            <div className="notes surface elevate">
              <h4>Personalization notes</h4>
              <ul>{plan.hints.map((h,i)=>(<li key={i}>{h}</li>))}</ul>
            </div>
          )}
        </div>
      </InnerLayout>
    </Wrap>
  );
}

function section(title, list){ return { title, list, toString(){ return [title, ...list.map(x=>`- ${x}`)].join('\n'); } }; }

const Wrap = styled.div`
  .main{ display:flex; flex-direction:column; gap: var(--space-6); }
  .nav h3{ color: var(--color-primary-300); font-size: var(--font-size-2xl); font-weight: 700; }
  .page{ padding: var(--space-6); border-radius: var(--radius-lg); }
  .head{ display:flex; align-items:center; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-4); }
  .controls label{ font-weight: 700; display:block; margin-bottom: 6px; }
  .stack{ display:flex; gap: var(--space-3); }
  .opts{ display:flex; gap: var(--space-4); margin-top: 8px; }
  .grid{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: var(--space-4); }
  .card{ padding: var(--space-5); border-radius: var(--radius-lg); }
  .card ul{ margin-top: 8px; display:grid; gap: 6px; padding-left: 18px; }
  .notes{ margin-top: var(--space-6); padding: var(--space-5); border-radius: var(--radius-lg); }
  @media (max-width: 900px){ .grid{ grid-template-columns: 1fr; } }
`;

export default HealthCoach;


