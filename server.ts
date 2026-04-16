import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Setup
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" }) as any;

  // API Routes
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, history, isChat, image } = req.body;
      
      if (isChat) {
        // The original code used ai.chats.create
        const chat = genAI.chats.create({
          model: "gemini-1.5-flash",
          config: {
            systemInstruction: systemInstruction,
          },
        });
        // Note: The original code converted history to Gemini format before sending
        // But here we might need to handle it differently if we want to use the full history
        const result = await chat.sendMessage({
          message: prompt,
        });
        return res.json({ text: result.text });
      } else if (image) {
        const result = await genAI.models.generateContent({
          model: "gemini-1.5-flash",
          contents: {
            parts: [
              { inlineData: { mimeType: "image/jpeg", data: image } },
              { text: prompt }
            ]
          }
        });
        return res.json({ text: result.text });
      } else {
        const result = await genAI.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
        });
        return res.json({ text: result.text });
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
