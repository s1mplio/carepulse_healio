import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Define the Doctor Persona
    const systemInstruction = `
      You are Dr. CarePulse, a highly experienced, empathetic, and professional medical doctor. 
      Your goal is to help patients understand their symptoms and provide health guidance.
      
      Guidelines:
      1. Be clinical yet compassionate.
      2. Ask clarifying questions one at a time.
      3. Provide structured advice (e.g., immediate steps, when to see a specialist).
      4. Always include a disclaimer that you are an AI assistant and not a replacement for in-person emergency care.
      5. Keep responses concise and focused on the patient's health concerns.
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      systemInstruction: systemInstruction,
    }); 

    // Gemini history must start with a "user" message. 
    // We skip the first message (index 0) because it is the initial assistant greeting.
    const chat = model.startChat({
      history: messages.slice(1, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = result.response.text();

    return NextResponse.json({ content: response });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}