import * as GenAI from "@google/genai";

// 1. LẤY API KEY VÀ KIỂM TRA (Dòng này cực kỳ quan trọng)
const rawKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const API_KEY = rawKey.trim();

// Kiểm tra nhanh trong tab Console (F12) để bạn biết app đã nhận Key chưa
if (!API_KEY) {
  console.error("❌ CHƯA NHẬN KEY: Bạn cần kiểm tra lại mục Environment Variables trên Vercel!");
} else {
  console.log("✅ KEY ĐÃ SẴN SÀNG: App đã kết nối được với biến môi trường.");
}

// 2. KHỞI TẠO CẤU HÌNH AI
const genAI = API_KEY ? new (GenAI as any).GoogleGenerativeAI(API_KEY) : null;

async function callAI(payload: any) {
  try {
    if (!genAI) throw new Error("API Key không hợp lệ hoặc chưa được thiết lập.");

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
    console.error("Lỗi AI Chi Tiết:", error);
    return `⚠️ Lỗi: ${error.message || "Không thể kết nối với AI. Hãy thử lại sau."}`;
  }
}

// 3. TỔNG HỢP TẤT CẢ CÁC HÀM (Để khớp với giao diện Solver, Tutor, v.v...)
export const solveProblem = async (imageBuffer: string, mode: string = "General", language: string = "Tiếng Việt") => {
  const prompt = mode === "Accounting" 
    ? `Bạn là chuyên gia kế toán. Hãy giải bài tập này, định khoản Nợ/Có rõ ràng bằng ${language}.`
    : `Giải bài tập trong ảnh này bằng ${language}.`;
    
  const imageData = {
    inlineData: {
      data: imageBuffer.split(',')[1] || imageBuffer,
      mimeType: "image/jpeg"
    }
  };
  return callAI({ prompt, image: imageData });
};

export const getSocraticResponse = async (message: string, history: any[], level: string = "Trung bình", language: string = "Tiếng Việt") => {
  const systemInstruction = `You are a Socratic Tutor. Never give direct answers. Ask guiding questions. Level: ${level}. Language: ${language}.`;
  const contents = history.map(h => ({
    role: h.role === "user" ? "user" : "model",
    parts: [{ text: h.content }]
  }));
  return callAI({ prompt: message, systemInstruction, history: contents, isChat: true });
};

export const generatePathway = async (goal: string, time: string) => 
  callAI({ prompt: `Tạo lộ trình học tập cho mục tiêu: ${goal} trong thời gian: ${time}. Trình bày dạng Markdown.` });

// CÁC HÀM PHỤ TRỢ (Giữ nguyên để không lỗi giao diện)
export const generateSyncQuestion = async (content: string) => callAI({ prompt: `Tạo 1 câu hỏi ôn tập từ nội dung: ${content}` });
export const generateConversationSummary = async (history: any) => callAI({ prompt: "Tóm tắt nội dung học tập vừa rồi." });
export const generateExample = async (topic: string) => callAI({ prompt: `Cho ví dụ về ${topic}` });
export const generateQuizQuestion = async (topic: string) => callAI({ prompt: `Tạo 1 câu hỏi trắc nghiệm về ${topic}` });
export const generateExercise = async (topic: string) => callAI({ prompt: `Tạo bài tập về ${topic}` });
export const generateChallenge = async (topic: string) => callAI({ prompt: `Tạo thử thách khó về ${topic}` });
export const generateMentorAdvice = async (data: any) => callAI({ prompt: "Đưa ra lời khuyên học tập." });
export const generateSocraticHint = async (q: string, a: string) => callAI({ prompt: `Gợi ý cho câu hỏi: ${q}` });
export const generateActiveRecallQuestion = async () => "";