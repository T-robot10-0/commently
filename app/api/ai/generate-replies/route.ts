import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { comment_text, tone, custom_instructions } = await req.json();

    const tonePrompts: Record<string, string> = {
  amical: "chaleureux, sympathique et personnel",
  professionnel: "poli, clair et professionnel",
  fun: "amusant, dynamique avec des emojis",
  educatif: "pédagogique, informatif et clair",
  motivant: "encourageant, énergique et positif",
  humoristique: "drôle, léger avec de l'humour",
};

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Génère 3 réponses COURTES (2-3 phrases max) à ce commentaire YouTube.

Commentaire : "${comment_text}"
Ton : ${tonePrompts[tone] || "naturel"}
${custom_instructions ? `Instructions : ${custom_instructions}` : ""}

Format EXACT (numérotées) :
1. [réponse 1]
2. [réponse 2]
3. [réponse 3]`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content || "";
    
    const replies = text
      .split("\n")
      .filter((line) => /^\d\./.test(line))
      .map((line) => line.replace(/^\d\.\s*/, "").trim())
      .slice(0, 3);

    if (replies.length < 3) {
      return NextResponse.json({ error: "Impossible de générer 3 réponses" }, { status: 500 });
    }

    return NextResponse.json({ replies });
  } catch (error: any) {
    console.error("Erreur génération:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}