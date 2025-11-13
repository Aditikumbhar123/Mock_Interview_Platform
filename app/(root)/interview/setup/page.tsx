"use client";
import { useState } from "react";
import ResumeUpload from "@/components/ResumeUpload";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

export default function InterviewSetupPage() {
  const [skills, setSkills] = useState<string>("");

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-xl font-semibold">Interview Generation</h3>

      {/* Step 1: Upload Resume */}
 <ResumeUpload onSkillsExtracted={(extracted) => setSkills(extracted)} />


      {/* Step 2: Show extracted skills */}
      {skills && (
        <div className="p-4 bg-gray-100 rounded-md border">
          <h4 className="font-medium mb-2">Extracted Skills:</h4>
          <p className="text-gray-700">{skills}</p>
        </div>
      )}

      {/* Step 3: Pass skills to Agent (to generate questions) */}
      <Agent
        userName="Candidate"
        userId="123"
        profileImage=""
        type="generate"
        extractedSkills={skills}
      />
    </div>
  );
}
