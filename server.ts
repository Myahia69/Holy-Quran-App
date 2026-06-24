import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // Lazy initialize GoogleGenAI client
  let aiClient: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets/Settings.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // API Route for fetching prayer times via Gemini Search Grounding
  app.post("/api/prayer-times", async (req, res) => {
    try {
      const { location, date, timezone } = req.body;

      if (!location) {
        return res.status(400).json({ error: "Location is required" });
      }

      const client = getAiClient();
      const prompt = `Search the web to find the accurate today's Muslim prayer times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) for the location: "${location}" on date: "${date || "today"}" (Timezone: ${timezone || "UTC"}). Provide the confirmed location name, date, and calculation method if available. Ensure the prayer times are returned as clean strings (e.g., "04:32 AM").`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              location: {
                type: Type.STRING,
                description: "The resolved city, region, and country name for the prayer times"
              },
              date: {
                type: Type.STRING,
                description: "The date of the prayer times, e.g., 2026-06-24"
              },
              calculationMethod: {
                type: Type.STRING,
                description: "The calculation authority/method used (e.g., Muslim World League, ISNA, Egyptian General Authority of Survey, etc.)"
              },
              latitude: {
                type: Type.NUMBER,
                description: "Latitude coordinate of the resolved location, e.g. 30.0444"
              },
              longitude: {
                type: Type.NUMBER,
                description: "Longitude coordinate of the resolved location, e.g. 31.2357"
              },
              prayerTimes: {
                type: Type.OBJECT,
                properties: {
                  fajr: { type: Type.STRING, description: "Fajr (dawn) prayer time, e.g., '04:15 AM' or '03:45'" },
                  sunrise: { type: Type.STRING, description: "Sunrise time, e.g., '05:48 AM'" },
                  dhuhr: { type: Type.STRING, description: "Dhuhr (midday) prayer time, e.g., '12:22 PM'" },
                  asr: { type: Type.STRING, description: "Asr (afternoon) prayer time, e.g., '03:45 PM'" },
                  maghrib: { type: Type.STRING, description: "Maghrib (sunset) prayer time, e.g., '07:12 PM'" },
                  isha: { type: Type.STRING, description: "Isha (night) prayer time, e.g., '08:45 PM'" }
                },
                required: ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]
              }
            },
            required: ["location", "date", "prayerTimes"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini model.");
      }

      const data = JSON.parse(responseText);

      // Extract latitude/longitude if missing but specified in the input query as coordinates
      if ((!data.latitude || !data.longitude) && location.includes(",")) {
        const [latStr, lngStr] = location.split(",");
        const parsedLat = parseFloat(latStr);
        const parsedLng = parseFloat(lngStr);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          data.latitude = parsedLat;
          data.longitude = parsedLng;
        }
      }

      // Default fallback coordinates for some popular cities if still missing
      if (!data.latitude || !data.longitude) {
        const lowerLoc = location.toLowerCase();
        if (lowerLoc.includes("cairo") || lowerLoc.includes("القاهرة")) {
          data.latitude = 30.0444;
          data.longitude = 31.2357;
        } else if (lowerLoc.includes("riyadh") || lowerLoc.includes("الرياض")) {
          data.latitude = 24.7136;
          data.longitude = 46.6753;
        } else if (lowerLoc.includes("makkah") || lowerLoc.includes("مكة")) {
          data.latitude = 21.4225;
          data.longitude = 39.8262;
        } else if (lowerLoc.includes("madinah") || lowerLoc.includes("المدينة")) {
          data.latitude = 24.4672;
          data.longitude = 39.6111;
        } else if (lowerLoc.includes("dubai") || lowerLoc.includes("دبي")) {
          data.latitude = 25.2048;
          data.longitude = 55.2708;
        } else if (lowerLoc.includes("london") || lowerLoc.includes("لندن")) {
          data.latitude = 51.5074;
          data.longitude = -0.1278;
        }
      }

      // Extract Grounding metadata for sourcing
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = chunks
        ? chunks
            .map((chunk: any) => ({
              title: chunk.web?.title || "Search Result",
              url: chunk.web?.uri || "",
            }))
            .filter((source: any) => source.url)
        : [];

      return res.json({
        ...data,
        sources: sources.slice(0, 3), // Return top 3 sources
      });

    } catch (error: any) {
      console.error("Error in /api/prayer-times:", error);
      return res.status(500).json({
        error: error.message || "Failed to fetch prayer times.",
        details: "Please verify your GEMINI_API_KEY is configured in Secrets or search for your location manually."
      });
    }
  });

  // Serve Vite app or built static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
