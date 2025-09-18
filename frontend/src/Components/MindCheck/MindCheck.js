import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { InnerLayout } from "../../styles/Layouts";
import hero from "../../img/hero.png";

function MindCheck(){
  const [answers, setAnswers] = useState({ mood: 5, sleep: 5, energy: 5, appetite: 5, anxious: 5, support: 5, notes: "" });
  const [modelsReady, setModelsReady] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [faceResult, setFaceResult] = useState({ label: "", confidence: 0, dist: {} });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(()=>{
    let cancelled = false;
    async function loadModels(){
      try{
        if (!window.faceapi) {
          await new Promise((resolve, reject)=>{
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
            s.async = true;
            s.onload = resolve; s.onerror = reject; document.body.appendChild(s);
          });
        }
        const URL = 'https://justadudewhohacks.github.io/face-api.js/models/';
        await window.faceapi.nets.tinyFaceDetector.loadFromUri(URL);
        await window.faceapi.nets.faceExpressionNet.loadFromUri(URL);
        if (!cancelled) setModelsReady(true);
      } catch (e){ console.warn('face-api load failed', e); }
    }
    loadModels();
    return () => { cancelled = true; };
  }, []);

  async function startCam(){
    try{
      if (!modelsReady) return;
      stopCam();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      const v = videoRef.current; if (!v) return;
      v.srcObject = stream; setCamOn(true);
      // start detect loop
      const detect = async () => {
        if (!window.faceapi || !v || v.readyState < 2) return;
        const det = await window.faceapi.detectSingleFace(v, new window.faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        if (det && det.expressions){
          const entries = Object.entries(det.expressions);
          entries.sort((a,b)=>b[1]-a[1]);
          const [label, confidence] = entries[0];
          setFaceResult({ label, confidence, dist: det.expressions });
        }
        const c = canvasRef.current; if (c){ c.width = v.videoWidth; c.height = v.videoHeight; const ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); }
      };
      timerRef.current = setInterval(detect, 500);
    }catch(e){ console.warn('camera error', e); }
  }

  function stopCam(){
    try{
      const v = videoRef.current; const s = v?.srcObject; if (s){ s.getTracks().forEach(t=>t.stop()); v.srcObject = null; }
    }catch(_){ }
    if (timerRef.current){ clearInterval(timerRef.current); timerRef.current = null; }
    setCamOn(false); setFaceResult({ label: "", confidence: 0, dist: {} });
  }
  const score = useMemo(()=>{
    // Lower is worse here: invert positive items
    const mood = 10 - answers.mood;
    const sleep = 10 - answers.sleep;
    const energy = 10 - answers.energy;
    const appetite = 10 - answers.appetite;
    const anxious = answers.anxious; // higher anxious is worse
    const support = 10 - answers.support; // lower support worse
    const raw = mood + sleep + energy + appetite + anxious + support; // 0..60
    const pct = Math.min(100, Math.max(0, Math.round((raw/60)*100)));
    return pct;
  }, [answers]);

  const level = score >= 0 && score < 34 ? 'green' : score < 67 ? 'amber' : 'red';

  // Choose boosters (memes/activities) from facial result (fallback to sliders)
  const moodLabel = useMemo(()=>{
    if (faceResult?.label) return faceResult.label; // happy, sad, neutral, angry, fearful, surprised, disgusted
    if (answers.mood <= 4) return 'sad';
    if (answers.anxious >= 7) return 'fearful';
    if (answers.mood >= 7) return 'happy';
    return 'neutral';
  }, [faceResult, answers]);

  const boosterCatalog = {
    neutral: [
      { title: '30‑sec smile reset', img: 'https://images.unsplash.com/photo-1521310192545-4ac7951413f0?q=80&w=800&auto=format&fit=crop',},
      { title: 'Cute animal loop', img: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=800&auto=format&fit=crop',},
      { title: '2‑min stretch', img: 'https://images.unsplash.com/photo-1540206276207-3af25c08abc4?q=80&w=800&auto=format&fit=crop',},
    ],
    happy: [
      { title: 'Share the vibe', img: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?q=80&w=800&auto=format&fit=crop', },
      { title: 'Dance break', img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop', },
      { title: 'Gratitude jot', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop', },
    ],
    sad: [
      { title: 'Wholesome memes', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',},
      { title: 'Guided kindness', img: 'https://images.unsplash.com/photo-1505751176756-856d3ffd6084?q=80&w=800&auto=format&fit=crop',},
      { title: 'Call a friend', img: 'https://images.unsplash.com/photo-1511773386567-4fe19ad5d0f4?q=80&w=800&auto=format&fit=crop', },
    ],
    angry: [
      { title: 'Box breathing', img: 'https://images.unsplash.com/photo-1518887575-2e85d4d7f41a?q=80&w=800&auto=format&fit=crop', },
      { title: 'Punchy workout', img: 'https://images.unsplash.com/photo-1552074280-9d23483cfac2?q=80&w=800&auto=format&fit=crop', },
      { title: 'Write + rip', img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop', },
    ],
    fearful: [
      { title: 'Grounding 5‑4‑3‑2‑1', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop', },
      { title: 'Warm tea moment', img: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop', },
      { title: 'Talk to someone', img: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=800&auto=format&fit=crop',  },
    ],
    surprised: [
      { title: 'Quick journal', img: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop', },
      { title: 'Walk + observe', img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop', },
      { title: 'Laugh burst', img: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=800&auto=format&fit=crop',  },
    ],
    disgusted: [
      { title: 'Reset with music', img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop', },
      { title: 'Clean a small spot', img: 'https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?q=80&w=800&auto=format&fit=crop', },
      { title: 'Cute animals', img: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=800&auto=format&fit=crop',  },
    ],
  };
  const boosters = boosterCatalog[moodLabel] || boosterCatalog.neutral;

  return (
    <Wrap>
      <InnerLayout className="main">
        <div className="nav"><h3>Mind Check</h3></div>
        <div className="surface elevate card">
          <div className={`status ${level}`}>
            <div className="score">Mood/Stress Score: {score}%</div>
            <small>{level==='green'?'Looks balanced':'We have a few things to improve'}</small>
          </div>

          <div className="grid">
            <Field label="How’s your mood today?" value={answers.mood} onChange={(v)=>setAnswers({...answers, mood:v})} />
            <Field label="Have you been sleeping well?" value={answers.sleep} onChange={(v)=>setAnswers({...answers, sleep:v})} />
            <Field label="Energy level" value={answers.energy} onChange={(v)=>setAnswers({...answers, energy:v})} />
            <Field label="Appetite" value={answers.appetite} onChange={(v)=>setAnswers({...answers, appetite:v})} />
            <Field label="Feeling anxious" value={answers.anxious} onChange={(v)=>setAnswers({...answers, anxious:v})} />
            <Field label="Feel supported by others" value={answers.support} onChange={(v)=>setAnswers({...answers, support:v})} />
          </div>

          <div className="camera surface elevate">
            <div className="camera-head">
              <div className="title">
                <span className="pill">Optional</span>
                <h4>Facial Expression Check</h4>
                <p>With camera permission, we can estimate your current expression to complement the self‑report. Nothing is uploaded.</p>
              </div>
              <img className="art" src={hero} alt="" />
            </div>
            <div className="cam-tools">
              <button className="btn" disabled={!modelsReady && camOn} onClick={()=>startCam()}>{camOn? 'Restart' : 'Start camera'}</button>
              <button className="btn btn-outline" disabled={!camOn} onClick={()=>stopCam()}>Stop</button>
              {!modelsReady && (<small className="hint">Loading AI models…</small>)}
            </div>
            <div className="cam-wrap">
              <video ref={videoRef} autoPlay muted playsInline className="cam" />
              <canvas ref={canvasRef} className="overlay" />
              <div className="result">
                {faceResult?.label && (
                  <>
                    <div className="label">{faceResult.label} ({Math.round(faceResult.confidence*100)}%)</div>
                    <div className="bars">
                      {Object.entries(faceResult.dist).map(([k,v])=> (
                        <div key={k} className="bar"><span>{k}</span><i style={{width: `${Math.round(v*100)}%`}}></i></div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>


          <div className="boosters">
            <h4>Mood boosters ({moodLabel})</h4>
            <div className="boost-grid">
              {boosters.map((b, i)=> (
                <a key={i} href={b.link} target="_blank" rel="noreferrer" className="boost surface elevate">
                  <img src={b.img} alt="" />
                  <span>{b.title}</span>
                </a>
              ))}
            </div>
            
          </div>
        </div>
      </InnerLayout>
    </Wrap>
  );
}

function Field({label, value, onChange}){
  return (
    <div className="field">
      <label>{label}</label>
      <input type="range" min="1" max="10" value={value} onChange={(e)=>onChange(Number(e.target.value))} />
      <div className="scale"><span>Low</span><span>High</span></div>
    </div>
  );
}

const Wrap = styled.div`
  .main{ display:flex; flex-direction:column; gap: var(--space-6); }
  .nav h3{ color: var(--color-primary-300); font-size: var(--font-size-2xl); font-weight: 700; }
  .card{ padding: var(--space-6); border-radius: var(--radius-lg); }
  .status{ display:flex; align-items:center; justify-content: space-between; padding: 12px 16px; border-radius: 12px; margin-bottom: var(--space-4); }
  .status .score{ font-weight: 800; }
  .status.green{ background: rgba(39,209,127,0.12); border:1px solid rgba(39,209,127,0.35); }
  .status.amber{ background: rgba(255,176,32,0.15); border:1px solid rgba(255,176,32,0.45); }
  .status.red{ background: rgba(255,93,93,0.15); border:1px solid rgba(255,93,93,0.45); }
  .grid{ display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); }
  .field{ background: var(--glass); border: 1px solid var(--color-border); border-radius: 12px; padding: 12px; }
  .field label{ display:block; font-weight: 700; margin-bottom: 6px; }
  .field input[type=range]{ width: 100%; }
  .field .scale{ display:flex; justify-content: space-between; font-size: 12px; color: var(--color-text-dim); }
  .camera{ margin-top: var(--space-6); padding: var(--space-5); border-radius: var(--radius-lg); }
  .camera-head{ display:grid; grid-template-columns: 1.4fr .6fr; gap: var(--space-4); align-items:center; }
  .camera-head .pill{ display:inline-block; padding: 4px 8px; border-radius: 999px; border: 1px solid rgba(124,92,255,0.45); background: rgba(124,92,255,0.12); color: var(--color-primary-300); font-weight: 700; font-size: 12px; margin-bottom: 6px; }
  .camera-head .art{ width: 100%; max-width: 200px; margin-left:auto; opacity:.9; }
  .cam-tools{ display:flex; gap: var(--space-3); align-items:center; margin: var(--space-3) 0; }
  .hint{ color: var(--color-text-dim); }
  .cam-wrap{ position: relative; border: 1px dashed var(--color-border); border-radius: 16px; overflow:hidden; background: rgba(0,0,0,0.25); display:grid; grid-template-columns: 1fr; }
  .cam{ width:100%; max-height: 360px; object-fit: cover; }
  .overlay{ position:absolute; inset:0; pointer-events:none; }
  .result{ position:absolute; left:12px; bottom:12px; background: rgba(0,0,0,0.45); color:#fff; padding:8px 10px; border-radius: 10px; font-size: 14px; }
  .result .bars{ display:grid; gap:4px; margin-top:6px; }
  .result .bar{ display:grid; grid-template-columns: 80px 1fr; align-items:center; gap:8px; }
  .result .bar i{ display:block; height:8px; background: #7c5cff; border-radius:999px; }
  .suggest{ margin-top: var(--space-4); }
  .suggest ul{ margin-top: 8px; padding-left: 18px; display:grid; gap: 6px; }
  .tools{ display:flex; gap: var(--space-3); margin-top: var(--space-3); }
  .boosters{ margin-top: var(--space-6); }
  .boost-grid{ display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-4); }
  .boost{ display:flex; flex-direction: column; gap: 8px; border-radius: 12px; overflow:hidden; text-decoration:none; color: var(--color-text); }
  .boost img{ width: 100%; height: 140px; object-fit: cover; }
  .boost span{ padding: 10px 12px; }
  @media (max-width: 900px){ .grid{ grid-template-columns: 1fr; } }
`;

export default MindCheck;


