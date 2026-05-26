import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const dynamic = "force-dynamic"

const AI_MODEL = process.env.GOOGLE_AI_MODEL ?? "gemini-3-flash-preview"
const API_KEY = process.env.GOOGLE_AI_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

function findJson(text: string) {
  // Remove markdown code blocks and trim
  const actual = text.replace(/```json|```/g, "").trim()
  try {
    return JSON.parse(actual)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        return null
      }
    }
    return null
  }
}

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { message: "Missing Google AI API key. Please check your Vercel environment variables." },
      { status: 500 }
    )
  }

  const body = await request.json().catch(() => null)
  const symptoms = body?.symptoms?.toString().trim()

  if (!symptoms) {
    return NextResponse.json(
      { message: "Please provide symptoms in the request body." },
      { status: 400 }
    )
  }

  const prompt = `You are a medical triage assistant. Analyze the patient's symptoms and return only valid JSON with these keys: department, urgency, doctorType, notes. Values must be concise.

Symptoms: ${symptoms}

Example output:
{
  "department": "Cardiology",
  "urgency": "High",
  "doctorType": "Cardiologist",
  "notes": "Recommend same-day evaluation for chest pain and shortness of breath."
}`

  // Try using the official @google/generative-ai client
  let responseText = ""

  try {
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: AI_MODEL })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    responseText = response.text()
  } catch (clientErr) {
    // SDK not available or failed — fallback to direct HTTP call.
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent`
      const fetchRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 400 },
        }),
      })

      if (!fetchRes.ok) {
        const errorText = await fetchRes.text()
        const status = fetchRes.status
        const message = status === 404
          ? `Model or endpoint not found (HTTP ${status}). Check model name or API version.`
          : `AI service error (HTTP ${status}).`
        return NextResponse.json({ message, detail: errorText }, { status })
      }

      const json = await fetchRes.json()
      responseText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    } catch (fallbackErr) {
      console.error("Both SDK and REST fallback failed:", clientErr, fallbackErr)
      return NextResponse.json({ message: "AI service error.", detail: String(clientErr ?? fallbackErr) }, { status: 500 })
    }
  }
  const parsed = findJson(responseText)

  const result = {
    department: parsed?.department ?? "General Medicine",
    urgency: parsed?.urgency ?? "Normal",
    doctorType: parsed?.doctorType ?? "Primary care physician",
    notes: parsed?.notes ?? responseText,
    rawText: responseText,
  }

  return NextResponse.json(result)
}
