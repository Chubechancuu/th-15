import * as GenAI from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Cách khởi tạo an toàn nhất cho thư viện @google/genai
const genAI = new (GenAI as any).GoogleGenerativeAI(API_KEY || "");

async function callAI(payload: any) {
  try {
    if (!API_KEY) throw new Error("Chưa có API Key!");

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: payload.systemInstruction || "" 
    });

    if (payload.isChat) {
      const chat = model.startChat({ history: payload.history || [] });
      const result = await chat.sendMessage(payload.prompt);
      return result.response.text();
    } else {
      const result = await model.generateContent(payload.prompt);
      return result.response.text();
    }
  } catch (error: any) {
    console.error("Lỗi AI:", error);
    throw new Error(error.message || "Lỗi kết nối");
  }
}

// --- GIỮ NGUYÊN CÁC HÀM CŨ ---
export async function getSocraticResponse(message: string, history: any[], level: string = "Trung bình", language: string = "Tiếng Việt", aiTone: string = "Friendly") {
  const systemInstruction = `You are a master Socratic Tutor. NEVER give direct answers. ALWAYS ask guiding questions. Language: ${language}.`;
  const contents = history.map(h => ({
    role: h.role === "user" ? "user" : "model",
    parts: [{ text: h.content }]
  }));
  return callAI({ prompt: message, systemInstruction, history: contents, isChat: true });
}

export async function generatePathway(goal: string, time: string, level: string = "Beginner", language: string = "Tiếng Việt") {
  return callAI({ prompt: `Tạo lộ trình học ${goal} trong ${time}. Ngôn ngữ: ${language}.` });
}

export async function generateSyncQuestion(content: string, language: string = "Tiếng Việt") {
  return callAI({ prompt: `Tạo câu hỏi từ: ${content}. Định dạng: Q | A. Ngôn ngữ: ${language}.` });
}

export async function generateConversationSummary(history: any[], language: string) {
  return callAI({ prompt: `Tóm tắt nội dung: ${JSON.stringify(history)}. Ngôn ngữ: ${language}.` });
}

// Các hàm bổ trợ
export async function generateExample() { return ""; }
export async function generateQuizQuestion() { return ""; }
export async function generateExercise() { return ""; }
export async function generateChallenge() { return ""; }
export async function generateMentorAdvice() { return ""; }
export async function generateSocraticHint() { return ""; }
export async function generateActiveRecallQuestion() { return ""; }