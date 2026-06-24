/* Serverless Function: Junk Lab Build-o-Matic */

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse materials input
  let materials = '';
  if (req.method === 'POST') {
    materials = (typeof req.body === 'string' ? JSON.parse(req.body).materials : req.body?.materials) || '';
  } else {
    materials = req.query?.materials || '';
  }

  if (!materials) {
    return res.status(200).json({
      name: "THE EMPTY DRAWER",
      difficulty: "EASY",
      coolness: "MINIMAL",
      time: "0 mins",
      partsNeeded: ["None"],
      steps: ["Find some junk first."],
      vinitComment: "hard to build out of thin air."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    // Local dev fallback if no API key is specified yet
    return res.json({
      name: "THE COFFEE-POWERED ROTATING TURBINE",
      difficulty: "MEDIUM",
      coolness: "MAXIMUM",
      time: "~1.5 hours",
      partsNeeded: [
        "old fan motor",
        "cardboard pieces",
        "3 glowing LEDs",
        "duct tape (lots of it)",
        "empty coffee cup"
      ],
      steps: [
        "Tape the fan motor securely to the bottom of the empty coffee cup.",
        "Cut the cardboard into four symmetrical blades and mount them to the motor shaft.",
        "Wire the 3 LEDs in series and solder them directly to the motor leads to draw induction power.",
        "Spin the blades manually, pour coffee, and pray it doesn't catch fire."
      ],
      vinitComment: "this is either absolute genius or an active fire hazard."
    });
  }

  const prompt = `You are an arcade-style junk-maker scientist. The user has given you a list of scrap/junk materials.
  Generate a creative DIY project build card that the user can construct with these materials.
  Be highly creative, slightly humorous, and energetic.

  List of materials:
  "${materials.replace(/"/g, '\\"')}"

  Return a JSON object matching this schema:
  {
    "name": "CREATIVE PROJECT NAME",
    "difficulty": "EASY | MEDIUM | HARD | LEGENDARY",
    "coolness": "MINIMAL | HIGH | MAXIMUM",
    "time": "time estimate e.g. ~30 mins, ~2 hours",
    "partsNeeded": ["list of parts including user materials and funny additions like duct tape"],
    "steps": ["Step 1 description", "Step 2 description", "Step 3 description"],
    "vinitComment": "a funny, characteristic commentary on this build (e.g. 'this is either genius or fire')"
  }

  Do not output any markdown formatting, code block markers, or descriptions. Return pure raw JSON matching the schema.`;

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
    console.error('BuildOMatic API Error:', err);
    res.status(200).json({
      name: "THE JUNK-SHELF PROTOTYPE",
      difficulty: "HARD",
      coolness: "HIGH",
      time: "~3 hours",
      partsNeeded: ["your materials", "lots of duct tape", "cardboard support structure"],
      steps: [
        "Arrange your materials in a 3D pyramid style on your workbench.",
        "Use duct tape generously at all joints to ensure structural integrity.",
        "Add a label that says 'PROTOTYPE - DO NOT TOUCH' to make it look official."
      ],
      vinitComment: "if it falls apart, just add more duct tape."
    });
  }
};
