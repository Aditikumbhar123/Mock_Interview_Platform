"use client";
import { useState } from "react";

export default function ResumeUpload({ onSkillsExtracted }: { onSkillsExtracted: (skills: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string>("");

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");
    setLoading(true);

    try {
      // Upload to extract skills
      const formData = new FormData();
      formData.append("file", file);

      const extractRes = await fetch("/api/extract-skills", {
        method: "POST",
        body: formData,
      });

      const extractData = await extractRes.json();

      if (extractData.skills) {
        setSkills(extractData.skills);
        onSkillsExtracted(extractData.skills);
        alert("✅ Skills extracted successfully!");
      } else {
        throw new Error(extractData.error || "Failed to extract skills");
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 border p-4 rounded-lg shadow">
      <h3 className="font-semibold">Upload Candidate Resume</h3>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        className="btn-primary px-4 py-2 bg-blue-600 text-white rounded-lg"
        disabled={loading}
      >
        {loading ? "Extracting..." : "Upload & Extract Skills"}
      </button>

      {skills && (
        <p className="text-sm text-green-600 mt-2">
          Extracted Skills: <b>{skills}</b>
        </p>
      )}
    </div>
  );
}
