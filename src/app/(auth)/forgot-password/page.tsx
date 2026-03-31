"use client";

import { useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Cancel01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { MailSend01Icon } from "@hugeicons-pro/core-solid-rounded";
import { CoreButton } from "@/components/ui/CoreButton";
import { CoreInput } from "@/components/ui/CoreInput";

export default function ForgotPasswordPage() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="relative min-h-screen bg-white flex flex-col">
      {/* Logo — top left */}
      <div className="absolute top-6 left-6">
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
        <div className="w-full max-w-[380px] mx-auto px-6 flex flex-col">
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
            Reset your password
          </h1>
          <p className="text-[14px] text-[#475569] text-center mb-8">
            Enter your email and we&apos;ll send a reset link
          </p>

          <CoreInput
            label="Email address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />

          <CoreButton
            variant="filled"
            className="w-full h-14 rounded-xl text-[15px] font-semibold mt-4"
            onClick={() => setShowModal(true)}
          >
            Send reset link
          </CoreButton>

          <p className="text-[13px] text-[#475569] text-center mt-6">
            Remember your password?{" "}
            <a
              href="/login"
              className="text-[#00B3FF] font-semibold hover:underline"
            >
              Sign in
            </a>
          </p>
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

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl w-full max-w-[400px] p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-[#F2F7F9] transition-colors"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={16}
                color="#94A3B8"
                strokeWidth={1.5}
              />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: "rgba(0,179,255,0.05)" }}
              >
                <HugeiconsIcon
                  icon={MailSend01Icon}
                  size={26}
                  color="#00B3FF"
                  strokeWidth={0}
                />
              </div>

              <h2 className="font-[SN_Pro] text-[20px] font-semibold text-[#0F172A] mb-2">
                Reset link sent
              </h2>
              <p className="text-[14px] text-[#475569] mb-1">
                We&apos;ve sent a link to
              </p>
              <p className="text-[14px] font-semibold text-[#0F172A]">
                {email || "your email"}
              </p>

              <CoreButton
                variant="filled"
                className="w-full h-12 rounded-xl font-semibold mt-6"
                onClick={() => setShowModal(false)}
              >
                Done
              </CoreButton>
              <CoreButton
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setShowModal(false)}
              >
                Resend email
              </CoreButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
