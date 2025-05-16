// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { OpenAI } from "openai";


const apiKey = process.env.OPENAI_API_KEY || "";
if (!apiKey) {
  console.error(" OPENAI_API_KEY is missing or empty.");
  throw new Error("The OPENAI_API_KEY environment variable is missing or empty.");
}

//  OpenAI API
const openai = new OpenAI({ apiKey });

export async function POST(req: NextRequest) {
  try {
    const { urls, fields } = await req.json();
    if (!urls) {
      console.error(" Missing required fields: urls.");
      return NextResponse.json({ error: "Missing required fields: urls." }, { status: 400 });
    }

    const requestedFields = Array.isArray(fields)
      ? fields
      : typeof fields === "string"
      ? fields.split(",").map(f => f.trim()).filter(f => f.length > 0)
      : ["Product Name", "Price", "Description"];

    if (requestedFields.length === 0) {
      console.error("Invalid fields format.");
      return NextResponse.json({ error: "Invalid fields format." }, { status: 400 });
    }

    const urlList = urls.split("\n").filter((url: string) => url.trim().length > 0);
    const extractedData: any[] = [];

    for (const url of urlList) {
      let result: Record<string, any> = {};
      let errorMsg = "";

      try {
        console.log(` Fetching URL: ${url}`);
        let htmlContent = await fetchWithRetry(url);

        if (isBlockedPage(htmlContent)) {
          console.warn("Detected anti-scraping, attempting bypass...");
          htmlContent = await fetchWithBypass(url);
        }

        const extractedResult = await extractWithGPT(htmlContent, requestedFields);
        result = { ...extractedResult };
      } catch (err: any) {
        errorMsg = ` Error: ${err.message}`;
      }

      extractedData.push({
        url,
        ...result,
        ...(errorMsg ? { error: errorMsg } : {}),
      });
    }

    //  Generate CSV directly in-memory
    const headers = Array.from(new Set(["url", ...extractedData.flatMap(Object.keys)]));
    const csvContent = [
      headers.join(","),
      ...extractedData.map(item =>
        headers.map(h => `"${item[h] ?? "N/A"}"`).join(",")
      )
    ].join("\n");

    //  Return CSV text in the response
    return NextResponse.json({
      csvData: csvContent,
      headers,
      rows: extractedData,
    });
  } catch (err: any) {
    console.error(`Unexpected error: ${err.message}`);
    return NextResponse.json({ error: `Unexpected error: ${err.message}` }, { status: 500 });
  }
}


//  3 attempt
async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Attempting to fetch (${attempt}/${retries})`);
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent": generateRandomUserAgent(),
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://www.google.com/",
          "X-Forwarded-For": generateRandomIP(),
        },
        timeout: 15000,
      });
      return data;
    } catch (error: any) {
      console.error(` Fetch failed (attempt ${attempt}): ${error.message}`);
      if (attempt === retries) {
        throw new Error(` All ${retries} fetch attempts failed.`);
      }
      await delay(1000 + Math.random() * 2000);
    }
  }
  throw new Error(` Failed to fetch URL after ${retries} attempts.`);
}

// check for anti scrap
function isBlockedPage(htmlContent: string): boolean {
  return htmlContent.includes("Pardon Our Interruption") || 
         htmlContent.includes("Access Denied") || 
         htmlContent.includes("Your access has been blocked");
}

// gpt data read
async function extractWithGPT(htmlContent: string, fields: string[]): Promise<Record<string, string>> {
  const cleanText = htmlContent.replace(/\s+/g, " ").slice(0, 8000);
  const fieldsList = fields.join(", ");

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a data extraction assistant." },
      { role: "user", content: `
Extract the following information in JSON format:
- ${fieldsList}
HTML Content:
${cleanText}
` },
    ],
    max_tokens: 500,
  });

  const rawText = response.choices?.[0]?.message?.content?.trim();
  if (!rawText) {
    throw new Error("GPT returned an empty response.");
  }

  console.log("🌐 GPT 返回内容:", rawText);
  return JSON.parse(extractJSON(rawText));
}

// auto detect and fix gpt return
function extractJSON(rawText: string) {
  const jsonRegex = /{[\s\S]*}/;
  const match = rawText.match(jsonRegex);
  if (match) {
    return match[0];
  }
  throw new Error("无效的 JSON 响应");
}

// random ip and user
function generateRandomIP() {
  return `${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`;
}

function generateRandomUserAgent() {
  return `Mozilla/5.0 (Windows NT ${randomInt(7, 10)}.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomInt(70, 100)}.0.${randomInt(1000, 4000)}.93 Safari/537.36`;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
