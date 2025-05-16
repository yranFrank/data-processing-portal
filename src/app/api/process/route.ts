// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { OpenAI } from "openai";
import * as fs from "fs";
import path from "path";

// ✅ 确保环境变量被正确读取
const apiKey = process.env.OPENAI_API_KEY || "";
if (!apiKey) {
  console.error("❌ OPENAI_API_KEY is missing or empty.");
  throw new Error("The OPENAI_API_KEY environment variable is missing or empty.");
}

// ✅ 配置 OpenAI API
const openai = new OpenAI({ apiKey });

export async function POST(req: NextRequest) {
  try {
    const { urls, fields } = await req.json();
    if (!urls) {
      console.error("❌ Missing required fields: urls.");
      return NextResponse.json({ error: "Missing required fields: urls." }, { status: 400 });
    }

    // ✅ 解析 fields（支持字符串和数组）
    const requestedFields = Array.isArray(fields)
      ? fields
      : typeof fields === "string"
      ? fields.split(",").map(f => f.trim()).filter(f => f.length > 0)
      : ["Product Name", "Price", "Description"];

    if (requestedFields.length === 0) {
      console.error("❌ Invalid fields format.");
      return NextResponse.json({ error: "Invalid fields format." }, { status: 400 });
    }

    const urlList = urls.split("\n").filter((url: string) => url.trim().length > 0);
    const extractedData: any[] = [];


    for (const url of urlList) {
      let result: Record<string, any> = {};
      let errorMsg = "";

      try {
        console.log(`🌐 Fetching URL: ${url}`);
        let htmlContent = await fetchWithRetry(url);

        if (isBlockedPage(htmlContent)) {
          console.warn("⚠️ Detected anti-scraping, attempting bypass...");
          htmlContent = await fetchWithBypass(url);
        }

        // ✅ 使用 GPT 分析并提取数据
        console.log("🔍 使用 GPT 分析页面...");
        const extractedResult = await extractWithGPT(htmlContent, requestedFields);
        result = { ...extractedResult };
      } catch (err: any) {
        errorMsg = `❌ Error: ${err.message}`;
      }

      extractedData.push({
        url,
        ...result,
        ...(errorMsg ? { error: errorMsg } : {}), // ✅ 仅在有错误时添加 error 字段
      });
    }

    // ✅ 确保 CSV 包含所有用户请求的字段 + url
    const headers = Array.from(new Set(["url", ...extractedData.flatMap(Object.keys)]));
    const csvContent = [
      headers.join(","),
      ...extractedData.map(item =>
        headers.map(h => `"${item[h] ?? "N/A"}"`).join(",")
      )
    ].join("\n");

    const csvFilePath = path.join(process.cwd(), "public", "processed_data.csv");
    fs.writeFileSync(csvFilePath, '\uFEFF' + csvContent, { encoding: "utf8" });
    console.log("✅ CSV file successfully created.");

    return NextResponse.json({ downloadUrl: "/processed_data.csv" });
  } catch (err: any) {
    console.error(`❌ Unexpected error: ${err.message}`);
    return NextResponse.json({ error: `Unexpected error: ${err.message}` }, { status: 500 });
  }
}


// ✅ 自动重试请求最多三次
// ✅ 自动重试请求最多三次
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
      console.error(`❌ Fetch failed (attempt ${attempt}): ${error.message}`);
      if (attempt === retries) {
        throw new Error(`❌ All ${retries} fetch attempts failed.`);
      }
      await delay(1000 + Math.random() * 2000);
    }
  }

  // ✅ Ensuring a fallback return (never reached if retry works)
  throw new Error(`❌ Failed to fetch URL after ${retries} attempts.`);
}


// 🌐 绕过防爬机制
async function fetchWithBypass(url: string): Promise<string> {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": generateRandomUserAgent(),
      "Referer": "https://www.google.com/",
      "X-Forwarded-For": generateRandomIP(),
    },
    timeout: 15000,
  });
  return data;
}

// ✅ 检查是否为防爬页面
function isBlockedPage(htmlContent: string): boolean {
  return htmlContent.includes("Pardon Our Interruption") || 
         htmlContent.includes("Access Denied") || 
         htmlContent.includes("Your access has been blocked");
}

// ✅ GPT 数据提取
async function extractWithGPT(htmlContent: string, fields: string[]) {
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

  const rawText = response.choices[0]?.message?.content.trim() || "";
  console.log("🌐 GPT 返回内容:", rawText);
  return JSON.parse(extractJSON(rawText));
}

// ✅ 自动检测并修复 GPT 返回的 JSON 格式
function extractJSON(rawText: string) {
  const jsonRegex = /{.*}/s;
  const match = rawText.match(jsonRegex);
  if (match) {
    return match[0];
  }
  throw new Error("无效的 JSON 响应");
}

// 🌐 随机 IP 和 User-Agent
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
