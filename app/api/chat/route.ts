import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_AI_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google AI API Key is not configured." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { messages } = await req.json();
    const aiModel = process.env.GOOGLE_AI_MODEL ?? "gemini-3-flash-preview";

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
      model: aiModel,
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
    
    // Extract detailed error message for 403 debugging
    let errorMessage = "The doctor is currently unavailable.";
    if (error instanceof Error && error.message.includes("403")) {
      errorMessage = "Access denied by AI service. Please check regional availability or API key permissions.";
    }

    return NextResponse.json(
      { error: errorMessage, detail: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}