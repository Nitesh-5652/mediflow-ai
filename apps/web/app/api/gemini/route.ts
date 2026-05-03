import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Gemini Error: API Key missing.");
      return NextResponse.json({
        reply: "Risk: Unknown\nSuggestion: API key configuration missing.",
      });
    }

    // ================= STEP 1: EXTRACT DATA =================
    const { name, age, disease } = await req.json();

    // ================= STEP 2: STRUCTURE PROMPT =================
    const customPrompt = `
      You are a professional medical assistant AI.

      Patient Details:
      - Name: ${name}
      - Age: ${age}
      - Condition: ${disease}

      Based on the above details, provide a concise medical risk assessment.
      
      Return response strictly in this exact format:
      Risk: [Low / Medium / High]
      Suggestion: [Short professional advice]

      Disclaimer: AI-generated advice. Consult a professional doctor.
    `;

    // ================= STEP 3: CALL GEMINI API =================
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using the latest Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(customPrompt);
    const response = await result.response;

    // ✅ FINAL CRITICAL FIX: Added 'await' because .text() is an async function
    const text = await response.text(); 

    if (!text || text.trim() === "") {
      throw new Error("Empty response from Gemini");
    }

    return NextResponse.json({
      reply: text,
    });

  } catch (error: any) {
    console.error("Gemini Route Error:", error.message || error);

    // Fallback response ensures the frontend regex doesn't break
    return NextResponse.json({
      reply: "Risk: Unknown\nSuggestion: The AI is currently busy or the request timed out. Please try again.",
    });
  }
}