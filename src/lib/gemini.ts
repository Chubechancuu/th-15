import { GoogleGenerativeAI } from "@google/genai";

// 1. Kết nối với chìa khóa API bạn đã dán trên Vercel
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

// 2. Hàm trung tâm xử lý mọi yêu cầu (Ngắn gọn vì gọi thẳng Google)
async function callAI(payload: any) {
  try {
    if (!API_KEY) throw new Error("Thiếu API Key trên Vercel!");

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
    throw new Error(error.message || "AI bận rồi, thử lại sau nhé!");
  }
}

// --- GIỮ NGUYÊN TẤT CẢ CÁC HÀM CŨ ĐỂ GIAO DIỆN KHÔNG LỖI ---

export async function getSocraticResponse(message: string, history: any[], level: string = "Trung bình", language: string = "Tiếng Việt", aiTone: string = "Friendly") {
  const systemInstruction = `You are a master Socratic Tutor. Tone: ${aiTone}. Level: ${level}. NEVER give direct answers. ALWAYS ask guiding questions. Language: ${language}.`;
  const contents = history.map(h => ({
    role: h.role === "user" ? "user" : "model",
    parts: [{ text: h.content }]
  }));
  return callAI({ prompt: message, systemInstruction, history: contents, isChat: true });
}

export async function generatePathway(goal: string, time: string, level: string = "Beginner", language: string = "Tiếng Việt") {
  const prompt = `Thiết kế lộ trình học ${goal} trong ${time}. Trình độ: ${level}. Ngôn ngữ: ${language}. Trình bày bảng Markdown.`;
  return callAI({ prompt });
}

export async function generateExample(topic: string, level: string = "Intermediate", language: string = "Tiếng Việt") {
  const prompt = `Cho 5 ví dụ thực tế về ${topic}. Trình độ: ${level}. Ngôn ngữ: ${language}.`;
  return callAI({ prompt });
}

export async function generateQuizQuestion(topic: string, level: string = "Intermediate", language: string = "Tiếng Việt") {
  const prompt = `Tạo 1 câu hỏi trắc nghiệm về ${topic}. Trình độ: ${level}. Ngôn ngữ: ${language}. Định dạng: QUESTION, OPTIONS, ANSWER, EXPLAIN.`;
  return callAI({ prompt });
}

export async function generateExercise(topic: string, type: string, language: string = "Tiếng Việt") {
  const prompt = `Tạo 3 bài tập về ${topic} loại ${type}. Ngôn ngữ: ${language}.`;
  return callAI({ prompt });
}

export async function generateSyncQuestion(content: string, language: string = "Tiếng Việt") {
  const prompt = `Tạo câu hỏi ôn tập từ: ${content}. Định dạng: QUESTION | ANSWER. Ngôn ngữ: ${language}.`;
  return callAI({ prompt });
}

export async function generateConversationSummary(history: any[], language: string) {
  const prompt = `Tóm tắt các điểm chính từ cuộc hội thoại: ${JSON.stringify(history)}. Ngôn ngữ: ${language}.`;
  return callAI({ prompt });
}

export async function generateMentorAdvice(data: any) {
  const prompt = `Dựa trên XP: ${data.xp}, hãy đưa ra lời khuyên động lực ngắn gọn bằng ${data.language}.`;
  return callAI({ prompt });
}

export async function generateSocraticHint(question: string, answer: string, language: string) {
  const prompt = `Đưa ra gợi ý Socratic cho câu hỏi "${question}" (Đáp án: ${answer}). Không cho đáp án trực tiếp. Ngôn ngữ: ${language}.`;
  return callAI({ prompt });
}

export async function generateActiveRecallQuestion(history: any[], language: string) {
  const prompt = `Dựa trên lịch sử học tập, tạo 1 câu hỏi Active Recall về chuyên ngành Luật hoặc Kế toán bằng ${language}.`;
  return callAI({ prompt });
}