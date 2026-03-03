"use client";

import React, { useState } from "react";
import { MyPage } from "@/components/layout/MyPage";
import { LongPractice } from "@/components/long-practice/LongPractice";

export default function ClientMyPageWrapper() {
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);

  const handleStartChallenge = (content: any) => {
    setSelectedChallenge(content);
  };

  if (selectedChallenge) {
    return <LongPractice externalContent={selectedChallenge} />;
  }

  return <MyPage onStartChallenge={handleStartChallenge} />;
}
