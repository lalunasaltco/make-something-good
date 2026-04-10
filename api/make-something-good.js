export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ingredients, vibe, time, skill, mood } = request.body || {};

    if (!ingredients || !String(ingredients).trim()) {
      return response.status(400).json({ error: 'Ingredients are required.' });
    }

    return response.status(200).json({
      headline: "This is a test",
      intro: "Your API route is working.",
      ideas: [
        {
          type: "easy",
          title: "Toast with eggs",
          why_it_works: "Simple and fast.",
          steps: ["Toast the bread", "Cook the eggs", "Season with Kitchen Bitch"],
          serve_with: "Coffee",
          kb_line: "See? We’re alive."
        }
      ]
    });
  } catch (error) {
    return response.status(500).json({ error: 'Internal server error.' });
  }
}
