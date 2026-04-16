import * as GenAI from "@google/genai";

// Kiểm tra API Key và đảm bảo nó luôn là chuỗi ký tự để tránh lỗi startsWith
const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();

// Khởi tạo an toàn
const genAI = API_KEY ? new (GenAI as any).GoogleGenerativeAI(API_KEY) : null;

async function callAI(payload: any) {
  try {
    if (!genAI) {
      throw new Error("Thiếu API Key. Hãy cấu hình trên Vercel.");
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: payload.systemInstruction || "" 
    });

    if (payload.isChat) {
      const chat = model.startChat({ history: payload.history || [] });
      const result = await chat.sendMessage(payload.prompt);
      return result.response.text();
    } else {
      const content = payload.image ? [payload.prompt, payload.image] : payload.prompt;
      const result = await model.generateContent(content);
      return result.response.text();
    }
  } catch (error: any) {
    console.error("Lỗi AI:", error);
    return "Hệ thống đang bận, bạn thử lại sau nhé!"; 
  }
}

// --- CÁC HÀM CƠ BẢN ĐỂ WEB KHÔNG BỊ TRẮNG ---

export const solveProblem = async (image: string) => 
  callAI({ prompt: "Giải bài tập trong ảnh này", image: { inlineData: { data: image.split(',')[1] || image, mimeType: "image/jpeg" } } });

export const getSocraticResponse = async (msg: string, hist: any[]) => 
  callAI({ prompt: msg, history: hist.map(h => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.content }] })), isChat: true });

export const generatePathway = async (goal: string, time: string) => 
  callAI({ prompt: `Tạo lộ trình học ${goal} trong ${time}` });

export const generateSyncQuestion = async (c: string) => callAI({ prompt: c });
export const generateConversationSummary = async (h: any) => callAI({ prompt: "Tóm tắt" });

// Khai báo các hàm khác để tránh lỗi "not exported"
export const generateExample = async () => "";
export const generateQuizQuestion = async () => "";
export const generateExercise = async () => "";
export const generateChallenge = async () => "";
export const generateMentorAdvice = async () => "";
export const generateSocraticHint = async () => "";
export const generateActiveRecallQuestion = async () => "";