// app/api/upload-resume/route.ts
import { NextResponse } from "next/server";
import PDFParser from "pdf2json";

export const runtime = "nodejs"; // Force Node.js runtime

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Please select a file first." },
        { status: 400 }
      );
    }

    // Convert File → Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParser = new PDFParser();

    // Extract text from the PDF
    const resumeText: string = await new Promise((resolve, reject) => {
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
        } catch (e) {
          reject("Failed to extract PDF text");
        }
      });

      pdfParser.parseBuffer(buffer);
    });

    return NextResponse.json({
      success: true,
      text: resumeText || "No readable text found.",
    });
  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to parse PDF." },
      { status: 500 }
    );
  }
}
