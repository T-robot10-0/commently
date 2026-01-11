import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { comment_text } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Classifie ce commentaire YouTube en UN SEUL mot : "spam", "normal", ou "priority".
      
Commentaire : "${comment_text}"

Réponds UNIQUEMENT par : spam, normal, ou priority`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 10,
    });

    const classification = completion.choices[0]?.message?.content?.trim().toLowerCase() || "normal";
    
    return NextResponse.json({ priority: classification });
  } catch (error: any) {
    console.error("Erreur classification:", error);
    return NextResponse.json({ priority: "normal" }, { status: 200 });
  }
}