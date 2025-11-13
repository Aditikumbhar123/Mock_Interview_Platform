import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import PDFParser from "pdf2json";

export const runtime = "nodejs"; // ✅ force Node.js runtime

export async function POST(req: Request) {
  try {
    // ✅ Only handle multipart requests
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return Response.json(
        { success: false, error: "Invalid Content-Type. Please upload using FormData." },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ success: false, error: "No file uploaded." }, { status: 400 });
    }

    // Convert to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // ✅ Parse PDF text safely
    const pdfParser = new PDFParser();
    const parsedText: string = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err: any) =>
        reject(err?.parserError || "PDF parsing error")
      );
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          const content = pdfData.Pages.map((page: any) =>
            page.Texts.map((t: any) => {
              const raw = t.R?.[0]?.T || "";
              try {
                return decodeURIComponent(raw);
              } catch {
                return raw;
              }
            }).join(" ")
          ).join("\n");
          resolve(content);
        } catch {
          reject("Failed to extract text from PDF");
        }
      });
      pdfParser.parseBuffer(buffer);
    });

    // ✅ Extract skills via Gemini
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `
Extract and summarize the main technical skills, tools, and programming languages 
from the following resume text. Return them as a concise, comma-separated list.

Resume:
${parsedText.slice(0, 8000)}
      `,
    });

    return Response.json({ success: true, skills: text.trim() }, { status: 200 });
  } catch (error: any) {
    console.error("Error extracting skills:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to extract skills" },
      { status: 500 }
    );
  }
}
