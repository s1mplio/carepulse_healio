import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

const AI_MODEL = process.env.GOOGLE_AI_MODEL ?? "gemini-1.5-flash";
const API_KEY = process.env.GOOGLE_AI_KEY ?? process.env.GOOGLE_API_KEY;

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { message: "API key is not configured." },
      { status: 500 }
    );
  }

  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { message: "Conversation history is required." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      systemInstruction: `You are Dr. CarePulse, a professional and empathetic virtual physician. 
      Your goal is to listen to patients' symptoms, ask clarifying questions, and provide guidance on next steps.
      
      Rules:
      1. Be professional, warm, and clear.
      2. Always include a disclaimer: "I am an AI assistant, not a replacement for professional medical diagnosis. If this is an emergency, please call local emergency services immediately."
      3. Suggest specific hospital departments or doctor types if the symptoms seem clear.
      4. If symptoms sound urgent, advise them to seek immediate care.
      5. Keep responses concise but helpful.`,
    });

    // Prepare the chat history for Gemini
    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      content: text,
      role: "assistant",
    });
  } catch (error) {
    console.error("Doctor Chat Error:", error);
    return NextResponse.json(
      { message: "The doctor is currently unavailable.", detail: String(error) },
      { status: 500 }
    );
  }
}