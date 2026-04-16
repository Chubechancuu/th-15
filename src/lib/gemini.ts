import { GoogleGenerativeAI } from "@google/genai";

// 1. Lấy API Key an toàn
const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return (key && typeof key === 'string') ? key.trim() : "";
};

const genAI = new GoogleGenerativeAI(getApiKey() || "NO_KEY");

// 2. Hàm xử lý chung (Trái tim của hệ thống)
async function callAI(payload: any) {
  try {
    const key = getApiKey();
    if (!key) return "⚠️ Vui lòng cấu hình VITE_GEMINI_API_KEY trên Vercel.";

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: payload.systemInstruction || ""
    });

    if (payload.isChat) {
      const chat = model.startChat({ history: payload.history || [] });
      const result = await chat.sendMessage(payload.prompt);
      return result.response.text();
    } else {
      const result = await model.generateContent(payload.content);
      return result.response.text();
    }
  } catch (error: any) {
    console.error("Lỗi AI:", error);
    return `❌ Lỗi: ${error.message || "Không thể kết nối AI"}`;
  }
}

// 3. Xuất các hàm cho Giao diện sử dụng
export const solveProblem = async (image: string, mode: string = "General") => {
  const content = [
    `Bạn là chuyên gia. Hãy giải bài tập này thật chi tiết. Chế độ: ${mode}`,
    { inlineData: { data: image.split(',')[1] || image, mimeType: "image/jpeg" } }
  ];
  return callAI({ content });
};

export const getSocraticResponse = async (msg: string, history: any[]) => {
  const contents = history.map(h => ({
    role: h.role === "user" ? "user" : "model",
    parts: [{ text: h.content }]
  }));
  return callAI({ 
    prompt: msg, 
    history: contents, 
    isChat: true, 
    systemInstruction: "Bạn là giáo viên Socratic, hãy đặt câu hỏi gợi mở thay vì trả lời thẳng." 
  });
};

export const generatePathway = async (goal: string) => 
  callAI({ content: `Tạo lộ trình học tập cho: ${goal}` });

// Các hàm bổ trợ khác (đảm bảo không trắng màn hình)
export const generateSyncQuestion = async () => "";
export const generateConversationSummary = async () => "";
export const generateExample = async () => "";
export const generateQuizQuestion = async () => "";
export const generateExercise = async () => "";
export const generateChallenge = async () => "";
export const generateMentorAdvice = async () => "";
export const generateSocraticHint = async () => "";
export const generateActiveRecallQuestion = async () => "";