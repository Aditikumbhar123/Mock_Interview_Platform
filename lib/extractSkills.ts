import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function extractSkillsFromResume(resumeText: string) {
  const { text } = await generateText({
    model: google("gemini-1.5-flash"),
    prompt: `
      Extract and summarize the following from this resume:
      - Technical skills
      - Tools/Frameworks
      - Relevant domains or job roles

      Resume Text:
      """${resumeText}"""

      Return a comma-separated list of keywords only.
    `,
  });

  return text;
}
