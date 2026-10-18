"use client";

import Link from "next/link";
import { useState } from "react";
import type { Prompt } from "@/types";
import { formatDate } from "@/lib/utils";
import { Button } from "./Button";
import { IconCopy, IconCheck, IconBot } from "./Icons";

interface PromptCardProps {
  prompt: Prompt;
  onDelete?: (id: string) => void;
}

export function PromptCard({ prompt, onDelete }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback ignored for MVP
    }
  };

  return (
    <Link
      href={`/prompts/${prompt.id}`}
      className="block border border-border rounded-xl bg-surface p-4 hover:border-accent/40 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {prompt.is_agent_config && (
              <IconBot className="w-4 h-4 text-accent shrink-0" />
            )}
            <h3 className="font-medium text-sm truncate">{prompt.title}</h3>
          </div>
          <p className="mt-1.5 text-xs text-muted line-clamp-2 font-mono leading-relaxed">
            {prompt.content}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy prompt"
        >
          {copied ? (
            <IconCheck className="w-4 h-4 text-success" />
          ) : (
            <IconCopy className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="text-[10px] text-muted">
              +{prompt.tags.length - 3}
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted shrink-0">
          {formatDate(prompt.updated_at)}
        </span>
      </div>
    </Link>
  );
}
