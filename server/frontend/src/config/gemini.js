// node --version # Should be >= 18
// npm install @google/generative-ai

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = "#Add you API Gemini Key";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;

function isRateLimitError(error) {
  if (!error) return false;
  const status = error.status || error.code || error?.response?.status;
  if (status === 429) return true;
  const message = String(error.message || "").toUpperCase();
  return message.includes("RATE_LIMIT") || message.includes("QUOTA");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runChat(prompt) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.7,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "I am feeling sad" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "I'm sorry to hear that you're feeling sad. It's completely okay to feel this way sometimes, and I want you to know that you're not alone. Would you like to talk about what's making you feel sad? Sometimes, just expressing how you feel can help.",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "I have nobody to talk to" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "I understand that feeling isolated can be really tough, and it can make sadness feel even heavier.  I'm here to listen without judgment. Would you like to share what's on your mind?  Sometimes, talking to someone, even if it's a chatbot like me, can provide a sense of connection and relief.",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "Why nobody understands me?" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "It can feel very isolating when you feel misunderstood. Is there anything specific that you feel people don't understand about you or your situation? Sometimes talking about these things can help us gain clarity and perspective.",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "I don't know but I feel sad and don't want to meet people or socialise",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "It's perfectly alright to want some space and avoid socializing when you're feeling down. Taking care of your emotional well-being is important. Would you like to explore some ways to manage these feelings of sadness or perhaps discuss what might be causing them?",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "Yes sure" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "I'm here to listen and offer support in any way I can.  To better understand what might be helpful, could you tell me a bit more about what's contributing to your sadness?  Are there any specific situations, thoughts, or feelings that seem to trigger or worsen it?",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "I am not sure about that, it is mainly thoughts or feelings",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "It's common for sadness to be connected to our thoughts and feelings.  Sometimes, identifying and understanding these thoughts can be a helpful step.  Would you be open to exploring some of these thoughts or feelings with me? This can be a way to gain some insight into what might be contributing to your sadness.",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "okay" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "That's great.  Remember, there's no pressure to share anything you're not comfortable with.  We can start with something simple like, what are some of the recurring thoughts or feelings that come up when you feel sad?",
          },
        ],
      },
      {
        role: "user",
        parts: [
          { text: "Go somewhere and live alone without anyone or any people" },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "I understand the desire to withdraw and be alone when feeling sad.  It's a natural response to want to protect yourself from further hurt or disappointment.  Is there something specific about being around people that feels challenging or overwhelming right now?",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "Nope but most of the days I feel low and depressed" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "I acknowledge that you've been feeling low and depressed most days.  It's important to address these feelings and find ways to manage them.  Have you considered seeking support from a mental health professional? They can provide personalized guidance and strategies for coping with depression and improving your mood.",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "No I haven't yet" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "That's perfectly okay.  Taking the step to seek professional help can feel daunting at first, but it can be incredibly beneficial for managing depression and improving your well-being.  Would you be open to exploring some resources that might be helpful in finding a therapist or counselor?",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "yeah sure" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Absolutely, I'm here to help!  Here are a few options to consider:\n\n* **Online therapy platforms:**  Platforms like Talkspace and BetterHelp offer convenient access to licensed therapists through video calls, phone calls, and messaging.\n* **Mental health directories:**  Websites like Psychology Today and TherapyTribe allow you to search for therapists in your area based on your specific needs and preferences.\n* **Community mental health centers:**  These centers often provide affordable or sliding-scale therapy services, making mental health care more accessible. \n* **Employee Assistance Programs (EAPs):**  If you are employed, your company might offer an EAP that provides confidential counseling services. \n\nWould you like me to provide you with some links or additional information on any of these options?",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "yup" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Certainly! Here are some resources to get you started:\n\n* **Talkspace:** https://www.talkspace.com/\n* **BetterHelp:** https://www.betterhelp.com/\n* **Psychology Today:** https://www.psychologytoday.com/us\n* **TherapyTribe:** https://www.therapytribe.com/\n\n**Additional Tips:**\n\n* **Reach out to your primary care physician:** They can offer initial assessments and referrals to mental health specialists.\n* **Contact your insurance provider:**  Inquire about coverage for mental health services and in-network providers.\n* **Consider support groups:**  Connecting with others who share similar experiences can be validating and provide a sense of community.",
          },
        ],
      },
    ],
  });

  // Craft an instruction to get actionable guidance without disclaimers
  const systemInstruction = `You are a helpful health information assistant. Provide practical, general guidance only (not a diagnosis). Avoid phrases like "as an AI" or "I cannot". Always include:\n\n- Immediate self-care steps (bulleted)\n- When to seek urgent care (red flags)\n- Preventive tips\n- A short medical disclaimer at the end: "This is general information, not a diagnosis. Consult a clinician for personal advice."`;
  const composedPrompt = `${systemInstruction}\n\nUser question:\n${prompt}`;

  // Prefer backend proxy if available to centralize quota and hide API key
  try {
    const resp = await fetch("/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: composedPrompt, model: MODEL_NAME }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.text) return data.text;
    }
  } catch (e) {
    // fall through to direct client call with retries
  }

  // Fallback: Send with retry/backoff on rate limits directly to Google
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await chat.sendMessage(prompt);
      const response = result.response;
      console.log(response.text());
      return response.text();
    } catch (error) {
      if (isRateLimitError(error) && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `Gemini rate limited. Retry ${attempt + 1} in ${delay}ms...`,
          error
        );
        await sleep(delay);
        continue;
      }
      console.error("Gemini chat error", error);
      if (isRateLimitError(error)) {
        return (
          "I'm getting a lot of requests right now. Please try again in a minute."
        );
      }
      return (
        "Sorry, I ran into a problem generating a response. Please try again."
      );
    }
  }
}

export default runChat;

