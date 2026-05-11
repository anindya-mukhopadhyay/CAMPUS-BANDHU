"use client";

import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_BASE_URL ?? "http://localhost:8000";

type AssistantResponse = {
  response: string;
};

export function AssistantComposer() {
  const [prompt, setPrompt] = useState("Suggest events to improve my AI + Web3 profile this month");
  const [answer, setAnswer] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${AI_BASE_URL}/api/v1/copilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error("Copilot request failed");
      }

      return (await response.json()) as AssistantResponse;
    },
    onSuccess: (data) => setAnswer(data.response)
  });

  return (
    <Card>
      <h3 className="mb-4 font-heading text-xl font-semibold">Campus Copilot</h3>
      <div className="flex flex-col gap-3">
        <Input value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Thinking..." : "Run Copilot"}
        </Button>
        {answer ? <p className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate">{answer}</p> : null}
      </div>
    </Card>
  );
}
