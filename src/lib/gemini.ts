import { GoogleGenerativeAI } from "@google/generative-ai";

// Lấy chìa khóa từ Vercel (Biến VITE_GEMINI_API_KEY bạn đã dán ở Bước 1)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

// Hàm gọi AI chính - kết nối trực tiếp không qua trung gian
async function callAI(payload: any) {
  try {
    if (!API_KEY) {
      throw new Error("Ứng dụng chưa nhận được API Key. Hãy kiểm tra lại phần Environment Variables trên Vercel!");
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: payload.systemInstruction || "" 
    });

    if (payload.isChat) {
      // Dùng cho chức năng nhắn tin (Tutor)
      const chat = model.startChat({
        history: payload.history || [],
      });
      const result = await chat.sendMessage(payload.prompt);
      return result.response.text();
    } else {
      // Dùng cho chức năng tạo lộ trình, bài tập
      const result = await model.generateContent(payload.prompt);
      return result.response.text();
    }
  } catch (error: any) {
    console.error("Lỗi kết nối Gemini:", error);
    throw new Error(error.message || "AI đang bận, bạn thử lại sau nhé!");
  }
}

// --- CÁC HÀM CŨ ĐỂ WEB KHÔNG BỊ LỖI GIAO DIỆN ---

export async function getSocraticResponse(message: string, history: any[], level: string, language: string, aiTone: string) {
  const systemInstruction = `Bạn là một gia sư Socratic bậc thầy. 
  Trình độ học viên: ${level}. Ngôn ngữ: ${language}. Tông giọng: ${aiTone}.
  QUY TẮC: KHÔNG BAO GIỜ đưa ra câu trả lời trực tiếp. LUÔN LUÔN đặt câu hỏi gợi mở để học sinh tự tìm ra đáp án.`;
  
  const contents = history.map(h => ({
    role: h.role === "user" ? "user" : "model",
    parts: [{ text: h.content }]
  }));

  return callAI({ 
    prompt: message, 
    systemInstruction, 
    history: contents, 
    isChat: true 
  });
}

export async function generatePathway(goal: string, time: string, level: string, language: string) {
  const prompt = `Tạo lộ trình học tập chi tiết cho mục tiêu: "${goal}" trong thời gian: "${time}". Trình độ: ${level}. Ngôn ngữ: ${language}. Trình bày dưới dạng bảng Markdown.`;
  return callAI({ prompt });
}

export async function generateSyncQuestion(content: string, language: string = "Tiếng Việt") {
  const prompt = `Dựa trên nội dung này: "${content}", hãy tạo 1 câu hỏi ôn tập ngắn. Định dạng trả về: CÂU HỎI | ĐÁP ÁN. Ngôn ngữ: ${language}.`;
  return callAI({ prompt });
}

export async function generateConversationSummary(history: any[], language: string) {
  const prompt = `Tóm tắt các kiến thức cốt lõi từ cuộc hội thoại này: ${JSON.stringify(history)}. Ngôn ngữ: ${language}. Sử dụng gạch đầu dòng.`;
  return callAI({ prompt });
}

// Các hàm bổ trợ khác để tránh lỗi compile
export async function generateExample(topic: string) { return callAI({ prompt: `Cho ví dụ về ${topic}` }); }
export async function generateQuizQuestion(topic: string) { return callAI({ prompt: `Tạo câu hỏi trắc nghiệm về ${topic}` }); }
export async function generateExercise(topic: string) { return callAI({ prompt: `Tạo bài tập về ${topic}` }); }
export async function generateChallenge(topic: string) { return callAI({ prompt: `Tạo thử thách về ${topic}` }); }