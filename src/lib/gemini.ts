import * as GenAI from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new (GenAI as any).GoogleGenerativeAI(API_KEY || "");

async function callAI(payload: any) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: payload.systemInstruction || "" 
    });

    if (payload.isChat) {
      const chat = model.startChat({
        history: payload.history || [],
      });
      const result = await chat.sendMessage(payload.prompt);
      return result.response.text();
    } else {
      const content = payload.image 
        ? [payload.prompt, payload.image] 
        : payload.prompt;
      const result = await model.generateContent(content);
      return result.response.text();
    }
  } catch (error: any) {
    console.error("AI Error:", error);
    throw new Error(error.error || "AI request failed");
  }
}

// --- GIỮ NGUYÊN TOÀN BỘ CẤU TRÚC HÀM CỦA BẠN ---

export async function generatePathway(goal: string, time: string, level: string = "Beginner", language: string = "Tiếng Việt") {
  const prompt = `Act as an educational expert and a supportive study companion. Design a personalized learning roadmap and a weekly timetable for the goal: "${goal}" within the timeframe: "${time}".
    Current learner level: ${level}.
    Requirements:
    1. Present as a clear Markdown table with columns: Day/Phase, Topic, Detailed Content, Estimated Time.
    2. Include a "Weekly Timetable" section.
    3. Output language: ${language}.
    4. Use exact headers: "### Learning Roadmap", "### Weekly Timetable", and "### AI Companion's Encouragement".`;
    
  return callAI({ prompt });
}

export async function getSocraticResponse(message: string, history: any[], level: string = "Trung bình", language: string = "Tiếng Việt", aiTone: string = "Friendly") {
  const systemInstruction = `You are a master Socratic Tutor. 
      CORE RULES:
      - NEVER give direct answers.
      - ALWAYS ask guiding questions.
      - Teaching Level: ${level}.
      - Response Tone: ${aiTone}.
      - Language: ${language}.`;

  const contents = history.map(h => ({
    role: h.role === "user" ? "user" : "model",
    parts: [{ text: h.content }]
  }));

  return callAI({ prompt: message, systemInstruction, history: contents, isChat: true });
}

export async function generateExample(topic: string, level: string = "Intermediate", language: string = "Tiếng Việt") {
  const prompt = `Provide 5 in-depth real-world examples about: ${topic}. Level: ${level}. Language: ${language}. Use Markdown.`;
  return callAI({ prompt });
}

export async function generateQuizQuestion(topic: string, level: string = "Intermediate", language: string = "Tiếng Việt") {
  const prompt = `Create 1 multiple-choice question about: ${topic}. Level: ${level}. Language: ${language}. Format: QUESTION, OPTIONS, ANSWER, EXPLAIN.`;
  return callAI({ prompt });
}

export async function generateExercise(topic: string, type: string, language: string = "Tiếng Việt") {
  const prompt = `Create 3 exercises of type ${type} about: ${topic}. University level. Language: ${language}.`;
  return callAI({ prompt });
}

export async function generateChallenge(topic: string, level: string, language: string = "Tiếng Việt") {
  const prompt = `Create 1 challenge exercise about '${topic}' at level '${level}' in ${language}. Format: QUESTION, ANSWER, EXPLAIN.`;
  return callAI({ prompt });
}

export async function solveProblem(imageBuffer: string, mode: string = "General", language: string = "Tiếng Việt") {
  let prompt = `Solve the problem in this image. Divide into: 1. Summary, 2. Solution steps, 3. Core knowledge. Language: ${language}.`;
  
  if (mode === "Accounting") {
    prompt = `You are a university-level accounting expert. Analyze transactions, record journal entries (Debit/Credit), and explain principles. Language: ${language}.`;
  }

  const imageData = {
    inlineData: {
      data: imageBuffer.split(',')[1] || imageBuffer,
      mimeType: "image/jpeg"
    }
  };

  return callAI({ prompt, image: imageData });
}

export async function generateSyncQuestion(content: string, language: string = "Tiếng Việt") {
  return callAI({ prompt: `Based on: "${content}", create 1 short review question. Format: QUESTION | ANSWER. Language: ${language}.` });
}

export async function generateMentorAdvice(data: any) {
  const prompt = `Act as a wise AI Mentor. XP: ${data.xp}, Notes: ${data.notesCount}. Provide motivational advice in ${data.language}.`;
  return callAI({ prompt });
}

export async function generateConversationSummary(history: any[], language: string) {
  const prompt = `Summarize key learning points from: ${JSON.stringify(history)}. Language: ${language}.`;
  return callAI({ prompt });
}

export async function generateSocraticHint(question: string, answer: string, language: string) {
  const prompt = `Student is stuck on: "${question}". Answer is "${answer}". Provide a subtle Socratic hint in ${language}.`;
  return callAI({ prompt });
}

export async function generateActiveRecallQuestion(history: any[], language: string) {
  const prompt = `Generate ONE Active Recall question based on study history. Language: ${language}.`;
  return callAI({ prompt });
}