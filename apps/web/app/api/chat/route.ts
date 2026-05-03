import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: "API key missing",
      });
    }

    const { message } = await req.json();

    const prompt = `
You are a concise medical assistant.

User question:
${message}

Give a short, clear answer.
Add disclaimer: Consult a doctor for medical advice.
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    return NextResponse.json({
      reply: text || "No response",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json({
      reply: "AI unavailable right now.",
    });
  }
}