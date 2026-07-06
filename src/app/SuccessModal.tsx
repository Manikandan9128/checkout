"use client";

import Image from "next/image";
import { useState } from "react";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

const YOUTUBE_LINK = "https://www.youtube.com/@sakshamsenior";
const WHATSAPP_LINK = "https://wa.me/+919999043434";

export default function SuccessModal({
  open,
  onClose,
  title = "You're All Set!",
  subtitle = "Your registration is complete and your plan is now active.",
}: SuccessModalProps) {
  const [copied, setCopied] = useState<"whatsapp" | "youtube" | null>(null);

  if (!open) return null;

  const copyLink = (e: React.MouseEvent, link: string, key: "whatsapp" | "youtube") => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(link);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700 transition hover:bg-purple-200 sm:right-6 sm:top-6"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="relative mx-auto mb-4 h-40 w-56 sm:h-48 sm:w-64">
          <Image
            src="/success-illustration.png"
            alt="Celebrating seniors"
            fill
            sizes="(max-width: 640px) 224px, 256px"
            className="object-contain"
            priority
          />
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-gray-500 sm:text-base">
          {subtitle}
        </p>
        <div className="mx-auto mt-4 h-1 w-6 rounded-full bg-pink-500" />

        <div className="mt-6 flex flex-col gap-5 sm:mt-8">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl bg-gray-100 p-4 transition hover:bg-gray-200"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.1-1.3c1.4.8 3.1 1.2 4.9 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2Z" fill="#25D366"/>
                <path d="M9.1 7.6c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 1.9 3 4.7 4.1 2.3.9 2.8.7 3.3.7.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.5-.3-.2-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.2-.6.9-.8 1.1-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5 0-.1-.5-1.4-.7-1.9Z" fill="#fff"/>
              </svg>
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-gray-900">Chat with our bot</span>
              <span className="mt-0.5 block text-sm text-gray-500">Get instant answers and support anytime, anywhere</span>
            </span>
            <button
              type="button"
              aria-label="Copy WhatsApp link"
              onClick={(e) => copyLink(e, WHATSAPP_LINK, "whatsapp")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-purple-600 hover:bg-purple-50"
            >
              <CopyIcon copied={copied === "whatsapp"} />
            </button>
            <ExternalIcon />
          </a>

          <a
            href={YOUTUBE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl bg-gray-100 p-4 transition hover:bg-gray-200"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 12c0-3.6-.3-5-1.1-5.9-.9-1-2.2-1.1-4.7-1.3C14.4 4.6 12 4.6 12 4.6s-2.4 0-4.2.2c-2.5.2-3.8.3-4.7 1.3C2.3 7 2 8.4 2 12s.3 5 1.1 5.9c.9 1 2.2 1.1 4.7 1.3 1.8.2 4.2.2 4.2.2s2.4 0 4.2-.2c2.5-.2 3.8-.3 4.7-1.3.8-.9 1.1-2.3 1.1-5.9Z" fill="#FF0000"/>
                <path d="M10 15.2 15.5 12 10 8.8v6.4Z" fill="#fff"/>
              </svg>
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-gray-900">Watch on Youtube</span>
              <span className="mt-0.5 block text-sm text-gray-500">Helpful videos to get you started and make the most of your plan</span>
            </span>
            <button
              type="button"
              aria-label="Copy YouTube link"
              onClick={(e) => copyLink(e, YOUTUBE_LINK, "youtube")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-purple-600 hover:bg-purple-50"
            >
              <CopyIcon copied={copied === "youtube"} />
            </button>
            <ExternalIcon />
          </a>
        </div>
      </div>
    </div>
  );
}

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-purple-600">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M14 5h5m0 0v5m0-5-7 7M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
