"use client";

import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, Loader2, KeyRound, AlertCircle, ArrowRight, X } from "lucide-react";

interface DemoOtpModalProps {
  isOpen: boolean;
  officerName?: string;
  departmentName?: string;
  onVerify: (otp: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function DemoOtpModal({
  isOpen,
  officerName,
  departmentName,
  onVerify,
  onCancel,
  isLoading,
}: DemoOtpModalProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [localError, setLocalError] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input box when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", "", "", ""]);
      setLocalError("");
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    // Only accept numeric characters
    const numericChar = value.replace(/\D/g, "");
    if (!numericChar && value !== "") return;

    const newDigits = [...digits];
    // Take the last character typed
    newDigits[index] = numericChar ? numericChar.slice(-1) : "";
    setDigits(newDigits);
    setLocalError("");

    // Auto-advance to the next box if a digit was entered
    if (numericChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move focus backward if current box is already empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const numericChars = pastedData.replace(/\D/g, "");

    if (!numericChars) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      if (i < numericChars.length) {
        newDigits[i] = numericChars[i];
      }
    }
    setDigits(newDigits);
    setLocalError("");

    // Focus the box following the last pasted digit or the last box
    const nextIndex = Math.min(numericChars.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    const code = digits.join("");
    if (code.length < 6) {
      setLocalError("Enter the complete 6-digit verification code.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setLocalError("Verification code must contain 6 digits.");
      return;
    }

    try {
      setLocalError("");
      await onVerify(code);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError("Verification failed. Please check the code and try again.");
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1b3f]/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-slate-200 transform transition-all animate-in zoom-in-95 duration-200 text-center">
        {/* Close Button (Upper Right) */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
          aria-label="Cancel verification"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
          <KeyRound className="w-7 h-7 text-blue-600" />
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>DRISHTI SETU SECURE VERIFICATION</span>
        </div>

        {/* Title & Subtitle */}
        <h3 id="otp-dialog-title" className="text-xl font-extrabold text-[#0a1b3f] tracking-tight">
          Verify Your Access
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {officerName ? (
            <>
              Officer <span className="font-semibold text-slate-700">{officerName}</span>
              {departmentName ? ` • ${departmentName}` : ""}
            </>
          ) : (
            "Enter the 6-digit verification code to continue."
          )}
        </p>

        {/* Hackathon Demo Notice Callout */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-left flex items-start gap-2.5">
          <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">
            i
          </div>
          <div className="text-[11px] text-amber-900 leading-relaxed font-medium">
            <span className="font-bold text-amber-950 uppercase tracking-wider block text-[10px]">
              DEMO MODE
            </span>
            Any 6-digit code can be used for this hackathon demonstration (e.g.{" "}
            <span className="font-mono font-bold text-amber-950 bg-amber-100/70 px-1 py-0.5 rounded">
              123456
            </span>{" "}
            or{" "}
            <span className="font-mono font-bold text-amber-950 bg-amber-100/70 px-1 py-0.5 rounded">
              000000
            </span>
            ).
          </div>
        </div>

        {/* Error Alert */}
        {localError && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2 text-left animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{localError}</div>
          </div>
        )}

        {/* 6-Digit Segmented OTP Input Form */}
        <form onSubmit={handleFormSubmit} className="mt-5 space-y-5">
          <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                aria-label={`Verification digit ${idx + 1} of 6`}
                value={digit}
                disabled={isLoading}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-bold rounded-xl border bg-slate-50 text-[#0a1b3f] transition-all outline-none shadow-sm ${
                  digit
                    ? "border-blue-500 bg-white ring-2 ring-blue-500/10"
                    : "border-slate-200 hover:border-slate-300"
                } focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/20`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isLoading || digits.join("").length !== 6}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e3a8a] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>VERIFY & CONTINUE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel & Return to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
