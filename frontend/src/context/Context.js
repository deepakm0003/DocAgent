import { createContext, useState } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {

    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading,setLoading] = useState(false);
    const [resultData,setResultData] = useState("");
    const [chatLog, setChatLog] = useState([]); // {role, html, time}

    const delayPara = (index, nextWord) => {
        setTimeout(function() {
            setResultData(prev=>prev+nextWord);
        },75*index)
    }


    const onSent = async (prompt) => {
        const message = (prompt || input || "").trim();
        if (!message) return;
        setInput("")
        setResultData("")
        setLoading(true)
        setShowResult(true)
        setRecentPrompt(message)
        setChatLog(prev => [...prev, { role: 'user', html: escapeHtml(message), time: new Date().toISOString() }])
        const response = await runChat(message)
        let responseArray = response.split("**");
        let newResponse="";
        for(let i = 0; i < responseArray.length; i++) {
            if (i === 0 || i%2 !== 1) {
                newResponse += responseArray[i];
            }
            else{
                newResponse += "<b>"+responseArray[i]+"</b>";
            }
        }
        let newResponse2 = newResponse.split("*").join("</br>")
        let newResponseArray = newResponse2.split(" ");
        for(let i = 0; i < newResponseArray.length; i++) {
            const nextWord = newResponseArray[i];
            delayPara(i,nextWord+" ")
        }
        setChatLog(prev => [...prev, { role: 'assistant', html: newResponse2, time: new Date().toISOString() }])
        setLoading(false)
    }

    const escapeHtml = (s="") => String(s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const openPrintableReport = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        const title = `Mind-Bot Chat Report`;
        const date = new Date().toLocaleString();
        const transcriptHtml = chatLog.map(msg => {
          const who = msg.role === 'user' ? 'You' : 'Assistant';
          return `<div class="msg ${msg.role}"><div class="who">${who}</div><div class="bubble">${msg.html}</div><div class="time">${new Date(msg.time).toLocaleString()}</div></div>`;
        }).join('');
        const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title>
          <style>
            body{ font-family: Arial, sans-serif; color:#111; padding:24px; }
            h1{ margin:0 0 8px 0; }
            .meta{ color:#555; margin-bottom:16px; }
            .msg{ margin: 10px 0; }
            .msg .who{ font-weight:bold; margin-bottom:4px; }
            .bubble{ background:#f5f5f7; padding:10px 12px; border-radius:12px; }
            .msg.assistant .bubble{ background:#eef2ff; }
            .time{ color:#777; font-size:12px; margin-top:4px; }
          </style></head><body>
          <h1>${title}</h1>
          <div class="meta">Generated: ${date}</div>
          <div class="section"><strong>Transcript</strong>${transcriptHtml || '<div>No messages yet.</div>'}</div>
          <div class="section"><em>Note: This is for personal records and not a diagnosis.</em></div>
          <script>window.onload = function(){ setTimeout(()=>window.print(), 250); };</script>
        </body></html>`;
        win.document.open();
        win.document.write(html);
        win.document.close();
    }


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
        openPrintableReport,
        chatLog
    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default ContextProvider