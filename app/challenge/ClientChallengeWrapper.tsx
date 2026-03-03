"use client";

import React, { useState } from "react";
import { OpenChallenge } from "@/components/challenge/OpenChallenge";
import { LongPractice } from "@/components/long-practice/LongPractice";

export default function ClientChallengeWrapper() {
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);

  const handleStartChallenge = (content: any) => {
    setSelectedChallenge(content);
  };

  if (selectedChallenge) {
    return <LongPractice externalContent={selectedChallenge} />;
  }

  return <OpenChallenge onStartChallenge={handleStartChallenge} />;
}
