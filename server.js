import express from "express";
import OpenAI from "openai";

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const port = process.env.PORT || 3000;

function client() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

app.post("/api/generate", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY ontbreekt."
      });
    }

    const {
      company,
      product,
      audience,
      platform,
      style
    } = req.body;

    const r = await client().responses.create({
      model: "gpt-5.6-luna",
      input: `Maak een Nederlandse marketingcampagne.

Bedrijf: ${company}
Product/dienst: ${product}
Doelgroep: ${audience || "algemeen"}
Platform: ${platform || "Instagram"}
Stijl: ${style || "modern"}

Geef uitsluitend JSON:
headline,
ad_text,
call_to_action,
social_caption,
hashtags (array van 5).`
    });

    let text = r.output_text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, "");

    res.json(JSON.parse(text));

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Tekstgeneratie mislukt."
    });
  }
});

app.post("/api/image", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY ontbreekt."
      });
    }

    const {
      company,
      product,
      audience,
      platform,
      style
    } = req.body;

    const prompt = `Maak een professionele commerciële reclame-afbeelding voor ${company}, die ${product} verkoopt aan ${audience || "algemeen publiek"}.

Stijl: ${style || "modern en professioneel"}.
Platform: ${platform || "Instagram"}.

Fotorealistisch, premium advertising look, sterke compositie, geschikt als social-media advertentie.

Gebruik geen merklogo's van derden en zet geen lange tekst in de afbeelding.`;

    const result = await client().images.generate({
      model: "gpt-image-2",
      prompt,
      size: "1024x1024"
    });

    res.json({
      image: `data:image/png;base64,${result.data[0].b64_json}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Afbeelding genereren mislukt. Controleer je API-toegang."
    });
  }
});

app.listen(port, () => {
  console.log(`AdMaker AI draait op poort ${port}`);
});
