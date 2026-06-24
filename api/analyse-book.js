/* Serverless Function: Book Mood Analyser */

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse text input
  let text = '';
  if (req.method === 'POST') {
    // Vercel handles json parsing in req.body automatically if content-type is json
    text = (typeof req.body === 'string' ? JSON.parse(req.body).text : req.body?.text) || '';
  } else {
    text = req.query?.text || '';
  }

  if (!text) {
    return res.status(200).json({
      tension: 50,
      darkness: 50,
      plotTwists: 50,
      twoAmIndex: 50,
      verdict: "Enter book details to begin.",
      vinitRating: "SOLID READ"
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    // Local dev fallback if no API key is specified yet
    return res.json({
      tension: 88,
      darkness: 92,
      plotTwists: 85,
      twoAmIndex: 95,
      verdict: "An absolute page-turner. Read it now.",
      vinitRating: "WOULD DESTROY HIM"
    });
  }

  const prompt = `Analyze the following book description or summary. Rate it on these dimensions:
  - tension (0 to 100)
  - darkness (0 to 100)
  - plotTwists (0 to 100)
  - twoAmIndex (0 to 100)
  - verdict (a punchy one-sentence summary, max 8 words)
  - vinitRating (exactly one of: "WOULD DESTROY HIM", "SOLID READ", "TOO SOFT FOR VINIT", or "NOT A THRILLER")

  Base the vinitRating on this: Vinit loves extremely dark, tense, plot-twisted thriller books with high tension and darkness. If tension and darkness are both > 80, it "WOULD DESTROY HIM". If it's a mild thriller, it's a "SOLID READ". If it's slow or low-stakes, it's "TOO SOFT FOR VINIT". If it's non-fiction, romance, or comedy, it's "NOT A THRILLER".

  Return a JSON object matching this schema:
  {
    "tension": number,
    "darkness": number,
    "plotTwists": number,
    "twoAmIndex": number,
    "verdict": "string",
    "vinitRating": "string"
  }

  Book content to analyze:
  "${text.replace(/"/g, '\\"')}"`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini status code: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    try {
      const parsed = JSON.parse(responseText.trim());
      res.status(200).json(parsed);
    } catch {
      throw new Error('Malformed JSON output from model');
    }

  } catch (err) {
    console.error('Book Analyser API Error:', err);
    res.status(200).json({
      tension: 65,
      darkness: 70,
      plotTwists: 45,
      twoAmIndex: 68,
      verdict: "Tension detected. Proceed with caution.",
      vinitRating: "SOLID READ"
    });
  }
};
