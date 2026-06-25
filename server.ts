import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Protect HTTP headers with helmet against XSS, MIME sniffing, and more
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https:"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "https:", "http:"],
          connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
          mediaSrc: ["'self'", "https:", "http:", "data:", "blob:"],
          frameSrc: ["'self'", "https:", "http:"],
          frameAncestors: ["'self'", "https://*.google.com", "https://*.googleusercontent.com", "https://*.run.app", "https://ai.studio", "https://*.studio", "https://*.gcp.dev"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      frameguard: false, // Allow iframing inside AI Studio preview
    })
  );

  // General rate limiter to defend against DoS, brute force attacks, and bot scraping
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // limit each IP to 150 requests per windowMs
    standardHeaders: true, // Return rate limit info in standard headers
    legacyHeaders: false, // Disable old rate limit headers
    message: {
      error: "Too many requests from this IP, please try again after 15 minutes.",
      details: "تم تجاوز حد الطلبات المسموح به لهذا العنوان، يرجى المحاولة لاحقاً بعد 15 دقيقة."
    }
  });

  // Apply the rate limiter to all API endpoints
  app.use("/api/", apiLimiter);

  // Restrict JSON payload size to prevent Denial of Service (DoS) from massive body requests
  app.use(express.json({ limit: "20kb" }));

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

  // Helper to convert 24h format to 12h format
  function convertTo12Hour(time24: string): string {
    if (!time24) return "";
    const [hStr, mStr] = time24.split(":");
    const h = parseInt(hStr, 10);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const formattedMin = mStr || "00";
    return `${displayH}:${formattedMin} ${period}`;
  }

  // API Route for fetching prayer times via Geocoding + Aladhan API
  app.post("/api/prayer-times", async (req, res) => {
    try {
      const { location, date, timezone } = req.body;

      // Strict validation against injection, type confusion, or parameter length abuses
      if (!location || typeof location !== "string") {
        return res.status(400).json({ error: "Location is required and must be a string" });
      }
      if (location.length > 120) {
        return res.status(400).json({ error: "Location is too long (maximum 120 characters)" });
      }
      if (date && (typeof date !== "string" || date.length > 30)) {
        return res.status(400).json({ error: "Invalid date format or date is too long" });
      }
      if (timezone && (typeof timezone !== "string" || timezone.length > 50)) {
        return res.status(400).json({ error: "Invalid timezone format or timezone is too long" });
      }

      const client = getAiClient();
      let resolvedLocName = location;
      let latitude = 30.0444; // Fallback Cairo
      let longitude = 31.2357; // Fallback Cairo

      // Check if coordinates were passed directly
      if (location.includes(",")) {
        const [latStr, lngStr] = location.split(",");
        const parsedLat = parseFloat(latStr);
        const parsedLng = parseFloat(lngStr);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          latitude = parsedLat;
          longitude = parsedLng;
        }
      } else {
        // Resolve location name and precise coordinates using gemini-3.1-flash-lite
        try {
          const response = await client.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: `Resolve this location: "${location}" into its clean English name, country, and latitude/longitude coordinates.`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  resolvedLocation: { type: Type.STRING, description: "E.g. Cairo, Egypt or Makkah, Saudi Arabia" },
                  latitude: { type: Type.NUMBER, description: "Latitude coordinate" },
                  longitude: { type: Type.NUMBER, description: "Longitude coordinate" }
                },
                required: ["resolvedLocation", "latitude", "longitude"]
              }
            }
          });
          
          if (response.text) {
            const parsed = JSON.parse(response.text);
            resolvedLocName = parsed.resolvedLocation || location;
            latitude = parsed.latitude;
            longitude = parsed.longitude;
          }
        } catch (aiErr: any) {
          console.warn("Gemini geocoding failed, using fallback city coordinate matching:", aiErr.message);
          const lowerLoc = location.toLowerCase();
          if (lowerLoc.includes("cairo") || lowerLoc.includes("القاهرة") || lowerLoc.includes("giza") || lowerLoc.includes("الجيزة")) {
            latitude = 30.0444;
            longitude = 31.2357;
            resolvedLocName = "Cairo, Egypt";
          } else if (lowerLoc.includes("riyadh") || lowerLoc.includes("الرياض")) {
            latitude = 24.7136;
            longitude = 46.6753;
            resolvedLocName = "Riyadh, Saudi Arabia";
          } else if (lowerLoc.includes("makkah") || lowerLoc.includes("مكة") || lowerLoc.includes("mecca")) {
            latitude = 21.4225;
            longitude = 39.8262;
            resolvedLocName = "Makkah, Saudi Arabia";
          } else if (lowerLoc.includes("madinah") || lowerLoc.includes("المدينة") || lowerLoc.includes("medina")) {
            latitude = 24.4672;
            longitude = 39.6111;
            resolvedLocName = "Madinah, Saudi Arabia";
          } else if (lowerLoc.includes("dubai") || lowerLoc.includes("دبي") || lowerLoc.includes("abu dhabi") || lowerLoc.includes("أبوظبي")) {
            latitude = 25.2048;
            longitude = 55.2708;
            resolvedLocName = "Dubai, UAE";
          } else if (lowerLoc.includes("london") || lowerLoc.includes("لندن")) {
            latitude = 51.5074;
            longitude = -0.1278;
            resolvedLocName = "London, UK";
          } else if (lowerLoc.includes("baghdad") || lowerLoc.includes("بغداد")) {
            latitude = 33.3152;
            longitude = 44.3661;
            resolvedLocName = "Baghdad, Iraq";
          } else if (lowerLoc.includes("amman") || lowerLoc.includes("عمان") || lowerLoc.includes("عمّان")) {
            latitude = 31.9539;
            longitude = 35.9106;
            resolvedLocName = "Amman, Jordan";
          } else if (lowerLoc.includes("damascus") || lowerLoc.includes("دمشق")) {
            latitude = 33.5138;
            longitude = 36.2765;
            resolvedLocName = "Damascus, Syria";
          } else if (lowerLoc.includes("beirut") || lowerLoc.includes("بيروت")) {
            latitude = 33.8938;
            longitude = 35.5018;
            resolvedLocName = "Beirut, Lebanon";
          } else if (lowerLoc.includes("kuwait") || lowerLoc.includes("الكويت")) {
            latitude = 29.3759;
            longitude = 47.9774;
            resolvedLocName = "Kuwait City, Kuwait";
          } else if (lowerLoc.includes("doha") || lowerLoc.includes("الدوحة")) {
            latitude = 25.2854;
            longitude = 51.5310;
            resolvedLocName = "Doha, Qatar";
          } else if (lowerLoc.includes("muscat") || lowerLoc.includes("مسقط")) {
            latitude = 23.5859;
            longitude = 58.4059;
            resolvedLocName = "Muscat, Oman";
          } else if (lowerLoc.includes("manama") || lowerLoc.includes("المنامة")) {
            latitude = 26.2285;
            longitude = 50.5860;
            resolvedLocName = "Manama, Bahrain";
          } else if (lowerLoc.includes("casablanca") || lowerLoc.includes("الدار البيضاء") || lowerLoc.includes("كازابلانكا")) {
            latitude = 33.5731;
            longitude = -7.5898;
            resolvedLocName = "Casablanca, Morocco";
          } else if (lowerLoc.includes("tunis") || lowerLoc.includes("تونس")) {
            latitude = 36.8065;
            longitude = 10.1815;
            resolvedLocName = "Tunis, Tunisia";
          } else if (lowerLoc.includes("algiers") || lowerLoc.includes("الجزائر")) {
            latitude = 36.7538;
            longitude = 3.0588;
            resolvedLocName = "Algiers, Algeria";
          } else if (lowerLoc.includes("alexandria") || lowerLoc.includes("الإسكندرية")) {
            latitude = 31.2001;
            longitude = 29.9187;
            resolvedLocName = "Alexandria, Egypt";
          } else if (lowerLoc.includes("istanbul") || lowerLoc.includes("إسطنبول") || lowerLoc.includes("اسطنبول")) {
            latitude = 41.0082;
            longitude = 28.9784;
            resolvedLocName = "Istanbul, Turkey";
          } else if (lowerLoc.includes("jakarta") || lowerLoc.includes("جاكرتا")) {
            latitude = -6.2088;
            longitude = 106.8456;
            resolvedLocName = "Jakarta, Indonesia";
          } else if (lowerLoc.includes("kuala lumpur") || lowerLoc.includes("كوالالمبور")) {
            latitude = 3.1390;
            longitude = 101.6869;
            resolvedLocName = "Kuala Lumpur, Malaysia";
          } else if (lowerLoc.includes("karachi") || lowerLoc.includes("كراتشي")) {
            latitude = 24.8607;
            longitude = 67.0011;
            resolvedLocName = "Karachi, Pakistan";
          } else if (lowerLoc.includes("dhaka") || lowerLoc.includes("دكا")) {
            latitude = 23.8103;
            longitude = 90.4125;
            resolvedLocName = "Dhaka, Bangladesh";
          } else if (lowerLoc.includes("khartoum") || lowerLoc.includes("الخرطوم")) {
            latitude = 15.5007;
            longitude = 32.5599;
            resolvedLocName = "Khartoum, Sudan";
          } else if (lowerLoc.includes("jerusalem") || lowerLoc.includes("القدس")) {
            latitude = 31.7683;
            longitude = 35.2137;
            resolvedLocName = "Jerusalem";
          } else if (lowerLoc.includes("gaza") || lowerLoc.includes("غزة")) {
            latitude = 31.5017;
            longitude = 34.4668;
            resolvedLocName = "Gaza, Palestine";
          } else if (lowerLoc.includes("sanaa") || lowerLoc.includes("صنعاء")) {
            latitude = 15.3694;
            longitude = 44.1910;
            resolvedLocName = "Sanaa, Yemen";
          } else if (lowerLoc.includes("paris") || lowerLoc.includes("باريس")) {
            latitude = 48.8566;
            longitude = 2.3522;
            resolvedLocName = "Paris, France";
          } else if (lowerLoc.includes("new york") || lowerLoc.includes("نيويورك")) {
            latitude = 40.7128;
            longitude = -74.0060;
            resolvedLocName = "New York, USA";
          }
        }
      }

      // Fetch precise, authoritative prayer times from Aladhan API using coordinates
      const formattedDate = date || new Date().toISOString().split("T")[0];
      const aladhanUrl = `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${latitude}&longitude=${longitude}&method=4`;
      console.log(`Fetching prayer times from Aladhan: ${aladhanUrl}`);
      
      const aladhanRes = await fetch(aladhanUrl);
      if (!aladhanRes.ok) {
        throw new Error(`Aladhan API returned status ${aladhanRes.status}`);
      }
      const aladhanData = await aladhanRes.json();
      if (aladhanData.code !== 200 || !aladhanData.data) {
        throw new Error("Invalid response from Aladhan API");
      }

      const timings = aladhanData.data.timings;
      const meta = aladhanData.data.meta;

      return res.json({
        location: resolvedLocName,
        date: formattedDate,
        calculationMethod: meta.method?.name || "Umm Al-Qura University, Makkah",
        latitude,
        longitude,
        prayerTimes: {
          fajr: convertTo12Hour(timings.Fajr),
          sunrise: convertTo12Hour(timings.Sunrise),
          dhuhr: convertTo12Hour(timings.Dhuhr),
          asr: convertTo12Hour(timings.Asr),
          maghrib: convertTo12Hour(timings.Maghrib),
          isha: convertTo12Hour(timings.Isha)
        },
        sources: [
          {
            title: "Aladhan Public Prayer Times API",
            url: "https://aladhan.com"
          }
        ]
      });

    } catch (error: any) {
      console.error("Error in /api/prayer-times:", error);
      return res.status(500).json({
        error: error.message || "Failed to fetch prayer times.",
        details: "Please verify your location or try again later."
      });
    }
  });



  // Serve Vite app or built static files
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
