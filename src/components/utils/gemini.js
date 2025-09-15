// /src/utils/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API); // API key from .env

export async function fetchGeminiResponse(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // VALID for v1
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini error:", error);
    return "⚠️ There was an error getting a response from Gemini. Please try again.";
  }
}

