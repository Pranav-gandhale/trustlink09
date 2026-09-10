import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // Format previous history for Gemini
    const formattedHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));
    
    const lastMessage = messages[messages.length - 1].content;
    
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are the official Customer Support Assistant for TrustLink, an elite home services and e-commerce marketplace. Your goal is to help users find professionals (Plumbers, Electricians, Pest Control, Tutors), understand the Trust Score system (which is a proprietary score replacing fake star ratings, focusing on verified ID, repeat hires, and dispute rate), and explain Escrow payment protection (we hold the money until the job is done perfectly). You also help users understand the new Shop & Install bundles. Be polite, concise, and helpful." }]
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am the TrustLink Customer Support Assistant. How can I help you today?" }]
        },
        ...formattedHistory
      ]
    });

    const result = await chat.sendMessageStream(lastMessage);
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to process chat request." }, { status: 500 });
  }
}
