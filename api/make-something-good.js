export async function POST(request) {
  try {
    const { ingredients, vibe, time, skill, mood } = await request.json();

    if (!ingredients || !String(ingredients).trim()) {
      return Response.json(
        { error: "Ingredients are required." },
        { status: 400 }
      );
    }

    const prompt = `
You are Kitchen Bitch, a witty, colorful, culturally sharp flavor guide.

Your job:
Turn a user's random ingredients into 3 actually good ideas.

Brand voice:
- playful
- smart
- approachable
- a little cheeky
- useful, not pretentious
- never generic
- never corporate
- never chef-y
- never bland

Important:
- The user should feel capable, not intimidated.
- The food should feel flavorful, alive, and interesting.
- Keep recipes realistic for a home cook.
- Assume the user has Kitchen Bitch seasoning available.
- One idea should be easy/lazy.
- One should feel a little impressive.
- One should be a "hear me out" unexpected flex.

User details:
- Ingredients: ${ingredients}
- Vibe: ${vibe || "surprise me"}
- Time available: ${time || "30"} minutes
- Skill level: ${skill || "beginner"}
- Mood: ${mood || "fun"}

Return ONLY valid JSON in this exact shape:
{
  "headline": "short, fun headline",
  "intro": "1-2 sentence intro",
  "ideas": [
    {
      "type": "easy",
      "title": "recipe title",
      "why_it_works": "one sentence",
      "steps": ["step 1", "step 2", "step 3"],
      "serve_with": "optional short serving idea",
      "kb_line": "a witty Kitchen Bitch line"
    },
    {
      "type": "impressive",
      "title": "recipe title",
      "why_it_works": "one sentence",
      "steps": ["step 1", "step 2", "step 3"],
      "serve_with": "optional short serving idea",
      "kb_line": "a witty Kitchen Bitch line"
    },
    {
      "type": "hear me out",
      "title": "recipe title",
      "why_it_works": "one sentence",
      "steps": ["step 1", "step 2", "step 3"],
      "serve_with": "optional short serving idea",
      "kb_line": "a witty Kitchen Bitch line"
    }
  ]
}

Rules:
- Do not use markdown fences.
- Do not include anything before or after the JSON.
- Keep each idea concise.
- Keep steps practical.
`;

    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        input: prompt
      })
    });

    const data = await openAIResponse.json();

    if (!openAIResponse.ok) {
      return Response.json(
        { error: data?.error?.message || "OpenAI request failed." },
        { status: 500 }
      );
    }

    const outputText =
      data.output_text ||
      (Array.isArray(data.output)
        ? data.output
            .flatMap(item => Array.isArray(item.content) ? item.content : [])
            .filter(part => part.type === "output_text")
            .map(part => part.text || "")
            .join("")
        : "");

    if (!outputText) {
      return Response.json(
        { error: "Model returned an empty response." },
        { status: 500 }
      );
    }

    const cleaned = outputText
      .replace(/^```json\\s*/i, "")
      .replace(/^```\\s*/i, "")
      .replace(/\\s*```$/, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      return Response.json(
        { error: "Model returned invalid JSON." },
        { status: 500 }
      );
    }

    return Response.json({
      headline: parsed.headline || "Here’s your move.",
      intro:
        parsed.intro ||
        "A few good ways to make what you already have feel much more intentional.",
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas.slice(0, 3) : []
    });
  } catch (error) {
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
