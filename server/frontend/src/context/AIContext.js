import { createContext, useState, useRef } from "react";
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
    let newResponseArray = newResponse2.split(" ");
    for (let i = 0; i < newResponseArray.length; i++) {
      const nextWord = newResponseArray[i];
      delayPara(i, nextWord + " ");
    }
    setLoading(false);
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
  };

  return (
    <AIContext.Provider value={contextValue}>
      {props.children}
    </AIContext.Provider>
  );
};

export default AIContextProvider;
