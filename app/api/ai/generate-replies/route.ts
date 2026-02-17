import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { comment_text, tone, custom_instructions } = await req.json();

    const detectLanguage = (text: string): "en" | "fr" => {
      const lower = text.toLowerCase();
      const hasFrenchAccents = /[àâäçéèêëîïôöùûüÿœæ]/.test(lower);
      if (hasFrenchAccents) return "fr";

      const words = lower.split(/[^a-zA-Z]+/).filter(Boolean);
      const enWords = [
        "the","and","you","your","thanks","thank","great","awesome","cool","love","like","please",
        "this","that","with","for","video","episode","what","when","why","how","is","are","was","were",
        "good","nice","amazing","more","next","can't","cant","don't","dont","i","we","they","it"
      ];
      const frWords = [
        "le","la","les","des","tu","vous","merci","super","genial","cool","j'adore","aime","svp",
        "ce","cette","avec","pour","video","episode","quoi","quand","pourquoi","comment","est","sont",
        "bon","bien","incroyable","plus","prochain","je","nous","ils","elle","il"
      ];

      let enScore = 0;
      let frScore = 0;
      for (const w of words) {
        if (enWords.includes(w)) enScore += 1;
        if (frWords.includes(w)) frScore += 1;
      }

      return enScore > frScore ? "en" : "fr";
    };

    const tonePrompts: Record<string, { fr: string; en: string }> = {
      amical: { fr: "chaleureux, sympathique et personnel", en: "warm, friendly and personal" },
      professionnel: { fr: "poli, clair et professionnel", en: "polite, clear and professional" },
      fun: { fr: "amusant, dynamique avec des emojis", en: "playful, energetic with emojis" },
      educatif: { fr: "pédagogique, informatif et clair", en: "educational, informative and clear" },
      motivant: { fr: "encourageant, énergique et positif", en: "encouraging, energetic and positive" },
      humoristique: { fr: "drôle, léger avec de l'humour", en: "light and humorous" },
    };

    const toneFr = tonePrompts[tone]?.fr || "naturel";
    const toneEn = tonePrompts[tone]?.en || "natural";
    const responseLang = detectLanguage(comment_text);
    const responseTone = responseLang === "en" ? toneEn : toneFr;
    const responseLanguageLabel = responseLang === "en" ? "ENGLISH" : "FRENCH";

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Reply strictly in ${responseLanguageLabel}. Do NOT reply in any other language.
Use this tone: ${responseTone}

Generate 3 SHORT replies (2-3 sentences max) to this YouTube comment.

Comment: "${comment_text}"
${custom_instructions ? `Instructions: ${custom_instructions}` : ""}

EXACT format (numbered):
1. [reply 1]
2. [reply 2]
3. [reply 3]`,
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
