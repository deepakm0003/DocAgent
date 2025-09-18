import { createContext, useState, useRef, useEffect } from "react";
import runChat from "../config/gemini";

export const AIContext = createContext();

const AIContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const lastSentAtRef = useRef(0);
  const [chatLog, setChatLog] = useState([]); // {role: 'user'|'assistant', html, time}

  // Multi-agent outputs & helpers
  const [triageLevel, setTriageLevel] = useState("normal"); // normal | urgent | emergency
  const [clarifyingQuestions, setClarifyingQuestions] = useState([]);
  const [summary, setSummary] = useState("");
  const [nearbyDoctorUrl, setNearbyDoctorUrl] = useState("https://www.google.com/maps/search/doctors+near+me");
  const [history, setHistory] = useState([]); // {timestamp, prompt}
  const [trendsNote, setTrendsNote] = useState("");
  const [researchCitations, setResearchCitations] = useState([]); // {title, url, extract}
  const [lifestyleSuggestions, setLifestyleSuggestions] = useState([]);

  const delayPara = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  const onSent = async (prompt) => {
    if (loading) return; // prevent concurrent sends
    const finalPrompt = (prompt || input || "").trim();
    if (!finalPrompt) return; // ignore empty
    const now = Date.now();
    if (now - lastSentAtRef.current < 5000) return; // simple cooldown 5s
    lastSentAtRef.current = now;
    setInput("");
    setResultData("");
    setLoading(true);
    setShowResult(true);
    setRecentPrompt(finalPrompt);
    setPrevPrompts([...prevPrompts, finalPrompt]);
    // record user message
    setChatLog((prev)=>[...prev, { role: 'user', html: escapeHtml(finalPrompt), time: new Date().toISOString() }]);
    recordHistory(finalPrompt);
    updateNearbyDoctorUrl();
    runAgents(finalPrompt);
    runResearch(finalPrompt);
    const response = await runChat(finalPrompt);
    console.log("recentPrompt", recentPrompt || prompt);
    console.log("resultData", resultData);
    console.log("prevPrompts", prevPrompts);

    let responseArray = response.split("**");
    let newResponse = "";
    for (let i = 0; i < responseArray.length; i++) {
      if (i === 0 || i % 2 !== 1) {
        newResponse += responseArray[i];
      } else {
        newResponse += "<b>" + responseArray[i] + "</b>";
      }
    }
    let newResponse2 = newResponse.split("*").join("</br>");
    const assistantHtml = newResponse2.split(" ");
    let newResponseArray = newResponse2.split(" ");
    for (let i = 0; i < newResponseArray.length; i++) {
      const nextWord = newResponseArray[i];
      delayPara(i, nextWord + " ");
    }
    // record assistant message (full text)
    setChatLog((prev)=>[...prev, { role: 'assistant', html: newResponse2, time: new Date().toISOString() }]);
    setLoading(false);
  };

  // --- Multi-Agent Orchestration ---
  const runAgents = (prompt) => {
    const level = assessTriage(prompt);
    setTriageLevel(level);
    setClarifyingQuestions(generateClarifyingQuestions(prompt));
    setSummary(generatePatientSummary(prompt, level));
    updateTrendsNote();
    setLifestyleSuggestions(generateLifestyleAdvice(prompt, level));
  };

  const assessTriage = (text) => {
    const t = text.toLowerCase();
    const emergencyKeywords = ["chest pain", "severe chest", "shortness of breath", "difficulty breathing", "severe bleeding", "unconscious", "stroke", "slurred speech", "one side weak", "seizure", "suicidal", "overdose"];
    const urgentKeywords = ["high fever", "fever >", "persistent vomiting", "dehydration", "severe headache", "stiff neck", "blood in", "fracture", "severe pain"];
    if (emergencyKeywords.some(k => t.includes(k))) return "emergency";
    if (urgentKeywords.some(k => t.includes(k))) return "urgent";
    return "normal";
  };

  const generateLifestyleAdvice = (text, level) => {
    const adv = [];
    if (level === "normal") {
      adv.push("Stay hydrated and ensure adequate rest.");
      adv.push("Try light movement or stretching if comfortable.");
    }
    if (/stress|anxiety|low mood|sad|depressed/i.test(text)) {
      adv.push("Consider 5 minutes of deep breathing or a short mindfulness exercise.");
      adv.push("Reach out to a trusted friend or family member.");
    }
    if (/fever|cough|cold|flu/i.test(text)) {
      adv.push("Use acetaminophen/paracetamol as directed for fever (if not contraindicated).");
      adv.push("Monitor temperature and rest; avoid strenuous activity.");
    }
    if (adv.length === 0) adv.push("Monitor symptoms. If they worsen, seek medical advice.");
    return adv.slice(0, 4);
  };

  // --- Research-backed Explanations (Wikipedia) ---
  const runResearch = async (promptText) => {
    const terms = extractMedicalTerms(promptText).slice(0, 3);
    if (terms.length === 0) { setResearchCitations([]); return; }
    try {
      const results = await Promise.all(terms.map(fetchWikipediaSummary));
      setResearchCitations(results.filter(Boolean));
    } catch (_) {
      setResearchCitations([]);
    }
  };

  const extractMedicalTerms = (text) => {
    const t = (text || "").toLowerCase();
    const known = [
      "headache","migraine","fever","cough","sore throat","flu","cold","nausea","vomiting","diarrhea","abdominal pain","stomach pain","chest pain","shortness of breath","asthma","anxiety","depression","fatigue"
    ];
    const found = known.filter(k => t.includes(k));
    // Also pick top single words with length>4 as fallback
    if (found.length === 0) {
      const words = t.replace(/[^a-z\s]/g, "").split(/\s+/).filter(w=>w.length>4);
      return Array.from(new Set(words)).slice(0,2);
    }
    return Array.from(new Set(found));
  };

  const fetchWikipediaSummary = async (term) => {
    try {
      const title = encodeURIComponent(term.replace(/\s+/g, "_"));
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
      if (!res.ok) return null;
      const data = await res.json();
      const url = data?.content_urls?.desktop?.page || data?.content_urls?.mobile?.page || `https://en.wikipedia.org/wiki/${title}`;
      const extract = (data?.extract || "").slice(0, 400);
      const resolvedTitle = data?.title || term;
      return { title: resolvedTitle, url, extract };
    } catch (_) { return null; }
  };

  const generateClarifyingQuestions = (text) => {
    const q = [];
    if (/headache|migraine/i.test(text)) q.push("Do you also have fever, visual aura, or neck stiffness?");
    if (/cough|sore throat|cold/i.test(text)) q.push("Do you have fever, shortness of breath, or chest tightness?");
    if (/stomach|abdominal|nausea|vomit/i.test(text)) q.push("Any diarrhea, blood in stool, or severe abdominal tenderness?");
    if (/chest pain/i.test(text)) q.push("Does the pain spread to your arm/jaw or occur with sweating?");
    if (q.length === 0) q.push("Since when did this start and how severe is it (1-10)?");
    return q;
  };

  const generatePatientSummary = (text, level) => {
    const now = new Date().toLocaleString();
    return `Report time: ${now}\nUrgency: ${level.toUpperCase()}\nReported: ${text}`;
  };

  // --- Nearby Doctor Finder ---
  const updateNearbyDoctorUrl = () => {
    try {
      if (navigator?.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords || {};
          if (latitude && longitude) {
            setNearbyDoctorUrl(`https://www.google.com/maps/search/doctors/@${latitude},${longitude},14z`);
          }
        });
      }
    } catch (_) {}
  };

  // --- History & Trends ---
  useEffect(() => {
    const saved = localStorage.getItem("docagent_history");
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (_) {}
    }
  }, []);

  const recordHistory = (promptText) => {
    const entry = { timestamp: Date.now(), prompt: promptText };
    const next = [...history, entry];
    setHistory(next);
    localStorage.setItem("docagent_history", JSON.stringify(next));
  };

  const updateTrendsNote = () => {
    const last7d = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = history.filter(h => h.timestamp >= last7d).map(h => h.prompt.toLowerCase());
    const symptoms = ["headache", "cough", "fever", "nausea", "pain", "anxiety", "fatigue"];
    const counts = symptoms.map(s => ({ s, n: recent.filter(p => p.includes(s)).length }));
    const top = counts.sort((a,b)=>b.n-a.n)[0];
    if (top && top.n >= 3) {
      setTrendsNote(`Your ${top.s} appears ${top.n} times in the past week; it may be becoming more frequent.`);
    } else {
      setTrendsNote("");
    }
  };

  // --- Doctor-ready Report ---
  const generateDoctorReport = () => {
    const content = [
      "DocAgent - Doctor-Ready Report",
      "--------------------------------",
      `Date: ${new Date().toLocaleString()}`,
      `Urgency: ${triageLevel.toUpperCase()}`,
      "",
      "Reported Symptoms:",
      recentPrompt || input,
      "",
      "Assistant Summary:",
      summary || resultData.replace(/<[^>]+>/g, "").slice(0, 2000),
    ].join("\n");
    return content;
  };

  const downloadDoctorReport = () => {
    const blob = new Blob([generateDoctorReport()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DocAgent_Report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // --- Chat Transcript PDF (printable) ---
  const escapeHtml = (s="") => String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const openPrintableReport = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const title = `DocAgent Chat Report`;
    const date = new Date().toLocaleString();
    const urgency = triageLevel?.toUpperCase?.() || 'NORMAL';
    const transcriptHtml = chatLog.map(msg => {
      const who = msg.role === 'user' ? 'You' : 'Assistant';
      return `<div class="msg ${msg.role}"><div class="who">${who}</div><div class="bubble">${msg.html}</div><div class="time">${new Date(msg.time).toLocaleString()}</div></div>`;
    }).join('');
    const lifestyleHtml = (lifestyleSuggestions||[]).map(s=>`<li>${escapeHtml(s)}</li>`).join('');
    const citationsHtml = (researchCitations||[]).map(c=>`<li><a href="${c.url}">${escapeHtml(c.title)}</a>: ${escapeHtml(c.extract)}</li>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title>
      <style>
        body{ font-family: Arial, sans-serif; color:#111; padding:24px; }
        h1{ margin:0 0 8px 0; }
        .meta{ color:#555; margin-bottom:16px; }
        .section{ margin: 18px 0; }
        .msg{ margin: 10px 0; }
        .msg .who{ font-weight:bold; margin-bottom:4px; }
        .bubble{ background:#f5f5f7; padding:10px 12px; border-radius:12px; }
        .msg.assistant .bubble{ background:#eef2ff; }
        .time{ color:#777; font-size:12px; margin-top:4px; }
        ul{ margin:6px 0 0 16px; }
        a{ color:#2b6cb0; text-decoration:none; }
      </style></head><body>
      <h1>${title}</h1>
      <div class="meta">Generated: ${date} &nbsp;|&nbsp; Urgency: ${urgency}</div>
      ${summary ? `<div class="section"><strong>Summary:</strong><div>${escapeHtml(summary)}</div></div>`: ''}
      ${trendsNote ? `<div class="section"><strong>Trend:</strong> ${escapeHtml(trendsNote)}</div>`: ''}
      ${lifestyleSuggestions?.length ? `<div class="section"><strong>Self-care suggestions:</strong><ul>${lifestyleHtml}</ul></div>`: ''}
      ${researchCitations?.length ? `<div class="section"><strong>Research-backed info:</strong><ul>${citationsHtml}</ul></div>`: ''}
      <div class="section"><strong>Transcript</strong>${transcriptHtml || '<div>No messages yet.</div>'}</div>
      <div class="section"><em>Note: This is general information, not a diagnosis. Share with your clinician for personal advice.</em></div>
      <script>window.onload = function(){ setTimeout(()=>window.print(), 250); };</script>
    </body></html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    // New features
    triageLevel,
    clarifyingQuestions,
    summary,
    nearbyDoctorUrl,
    history,
    trendsNote,
    researchCitations,
    lifestyleSuggestions,
    downloadDoctorReport,
    openPrintableReport,
    chatLog,
  };

  return (
    <AIContext.Provider value={contextValue}>
      {props.children}
    </AIContext.Provider>
  );
};

export default AIContextProvider;
