import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, role, level, techstack, amount, userid, skills, resumeText } =
      body;

    console.log("🎯 Generate API called with:", {
      type,
      role,
      level,
      techstack,
      skills,
    });

    const prompt = `
You are an expert technical interviewer.
Generate ${amount || 5} interview questions for the role of "${role}".
Experience level: ${level}.
Tech stack: ${techstack || "General"}.

${
  skills
    ? `The candidate's extracted skills are: ${skills}.`
    : resumeText
    ? `Here is the candidate's resume text:\n${resumeText.slice(0, 800)}`
    : "No resume provided."
}

Focus questions on these skills and related concepts.
Return ONLY a valid JSON array of questions (no explanations, no markdown).
Example: ["Question 1", "Question 2", "Question 3"]
`;

    // ---- Ask Gemini to generate questions ----
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
    });

    // ---- Clean Gemini output ----
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```json/i, "").replace(/```$/i, "").trim();

    let parsedQuestions: string[] = [];

    try {
      parsedQuestions = JSON.parse(cleaned);
    } catch (err) {
      console.warn("⚠️ Could not parse Gemini output, using fallback", err);
      parsedQuestions = [
        "Can you tell me about your experience?",
        "What are your strongest technical skills?",
        "Describe a challenging project you worked on.",
        "How do you keep your technical knowledge up to date?",
        "Why do you think you're suitable for this role?",
      ];
    }

    // ---- Save generated interview in Firestore ----
    const interviewData = {
      role,
      type,
      level,
      techstack: techstack ? techstack.split(",") : [],
      questions: parsedQuestions,
      userId: userid,
      skills: skills || null,
      resumeText: resumeText || null,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interviewData);

    console.log("✅ Interview generated successfully!");
    return new Response(JSON.stringify({ success: true, questions: parsedQuestions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("❌ Error generating interview:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  return new Response(JSON.stringify({ success: true, message: "API working" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
