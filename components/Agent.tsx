"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface AgentProps {
  userName: string;
  userId: string;
  extractedSkills?: string;
}

export default function Agent({ userName, userId, extractedSkills }: AgentProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<any[]>([]);
  const [lastMessage, setLastMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const router = useRouter();

  // Attach event listeners
  useEffect(() => {
    vapi.on("call-start", () => setCallStatus(CallStatus.ACTIVE));
    vapi.on("call-end", () => setCallStatus(CallStatus.FINISHED));

    vapi.on("message", (msg) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        setMessages((prev) => [...prev, msg.transcript]);
        setLastMessage(msg.transcript);
      }
    });

    vapi.on("speech-start", () => setIsSpeaking(true));
    vapi.on("speech-end", () => setIsSpeaking(false));

    vapi.on("error", (err) => console.error("Vapi Error:", err));

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  // Start call
  const startInterview = async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
          skills: extractedSkills || "No skills provided",
        },
      });
    } catch (error) {
      console.error("Start error:", error);
      alert("Cannot start interview");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const stopInterview = () => {
    vapi.stop();
    setCallStatus(CallStatus.FINISHED);
  };

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <Image src="/ai-avatar.png" alt="AI" width={75} height={75} />
          {isSpeaking && <span className="animate-ping" />}
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border">
          <Image src="/user-avatar.png" alt="User" width={120} height={120} />
          <h3>{userName}</h3>
        </div>
      </div>

      {lastMessage && (
        <div className="transcript-border">
          <p>{lastMessage}</p>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="btn-call" onClick={startInterview}>
            {callStatus === CallStatus.CONNECTING ? "..." : "Call"}
          </button>
        ) : (
          <button className="btn-disconnect" onClick={stopInterview}>
            End
          </button>
        )}
      </div>
    </>
  );
}
