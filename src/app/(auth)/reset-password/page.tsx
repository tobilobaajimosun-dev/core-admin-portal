"use client";

import { useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { CoreButton } from "@/components/ui/CoreButton";
import { CoreInput } from "@/components/ui/CoreInput";

const rules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  {
    label: "One number or symbol",
    test: (p: string) => /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
  },
];

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo — top left */}
      <div className="px-[100px] pt-8">
        <Image
          src="/images/core-logo.png"
          width={100}
          height={34}
          alt="Core"
          priority
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-[507px] px-[100px] flex flex-col">
          {/* Back link */}
          <a
            href="/login"
            className="group flex items-center gap-1.5 text-[13px] text-[#475569] hover:text-[#0F172A] px-3 py-1.5 rounded-full hover:bg-[#F2F7F9] transition-all mb-8 self-start -ml-3 cursor-pointer"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={15}
              color="currentColor"
              strokeWidth={1.5}
            />
            Back to sign in
          </a>

          <h1 className="font-[SN_Pro] text-[22px] font-semibold text-[#0F172A] text-center mb-1 tracking-[-0.3px]">
            Create new password
          </h1>
          <p className="text-[14px] text-[#475569] text-center mb-8">
            Must be different from your previous password
          </p>

          <div className="flex flex-col gap-3">
            <CoreInput
              label="New password"
              type="password"
              passwordToggle
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
            <CoreInput
              label="Confirm password"
              type="password"
              passwordToggle
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Password rules */}
          <div className="flex flex-col gap-2 mt-4">
            {rules.map((rule) => {
              const met = rule.test(password);
              return (
                <div key={rule.label} className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    size={15}
                    color={met ? "#22C55E" : "#E2E8F0"}
                    strokeWidth={1.5}
                  />
                  <span
                    className={`text-[13px] ${
                      met ? "text-[#0F172A]" : "text-[#94A3B8]"
                    }`}
                  >
                    {rule.label}
                  </span>
                </div>
              );
            })}
          </div>

          <CoreButton
            variant="filled"
            className="w-full h-14 rounded-xl text-[15px] font-semibold mt-6"
          >
            Set new password
          </CoreButton>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 py-6">
        <button className="text-[13px] text-[#475569] bg-[#F2F7F9] px-4 py-1.5 rounded-full hover:bg-[#E8EEF2] transition-colors">
          Help
        </button>
        <div className="flex items-center gap-4">
          {["Terms", "Privacy", "Cookies"].map((link) => (
            <a
              key={link}
              className="text-[13px] text-[#94A3B8] hover:text-[#475569] cursor-pointer transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
