"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  Mail01Icon,
  Cancel01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { MailSend01Icon } from "@hugeicons-pro/core-solid-rounded";
import { CoreButton } from "@/components/ui/CoreButton";
import { CoreInput } from "@/components/ui/CoreInput";

export default function ForgotPasswordPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-full max-w-[400px] px-6 flex flex-col items-center">
        {/* Back link */}
        <a
          href="/login"
          className="group flex items-center gap-1.5 text-[14px] text-[#475569] hover:text-[#0F172A] mb-8 self-start px-3 py-1.5 rounded-full hover:bg-[#F2F7F9] transition-all duration-150 cursor-pointer"
        >
          <span className="group-hover:hidden">
            <HugeiconsIcon
              icon={ArrowLeft02Icon}
              size={15}
              color="currentColor"
              strokeWidth={1.5}
            />
          </span>
          <span className="hidden group-hover:block">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={15}
              color="currentColor"
              strokeWidth={2}
            />
          </span>
          Back to sign in
        </a>

        {/* Icon */}
        <div className="w-14 h-14 bg-[#F2F7F9] rounded-2xl flex items-center justify-center mb-6">
          <HugeiconsIcon
            icon={Mail01Icon}
            size={28}
            color="#00B3FF"
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h1 className="font-[SN_Pro] text-[24px] font-semibold text-[#0F172A] text-center mb-2 leading-[130%]">
          Reset your password
        </h1>

        {/* Subtitle */}
        <p className="text-[14px] text-[#475569] text-center mb-8">
          Enter your email and we&apos;ll send you a reset link
        </p>

        {/* Email field */}
        <CoreInput
          label="Email address"
          type="email"
          placeholder="name@princepsfinance.com"
          className="w-full"
        />

        {/* CTA */}
        <CoreButton
          variant="filled"
          className="w-full mt-6"
          onClick={() => setShowModal(true)}
        >
          Send reset link
        </CoreButton>

        {/* Sign in link */}
        <p className="text-[13px] text-[#475569] text-center mt-6">
          Remember your password?{" "}
          <a href="/login" className="text-[#00B3FF] font-semibold hover:underline">
            Sign in
          </a>
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-10 w-full max-w-[440px] flex flex-col items-center text-center shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F2F7F9] transition-colors"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={16}
                color="#94A3B8"
                strokeWidth={1.5}
              />
            </button>

            {/* Success icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: "rgba(0, 179, 255, 0.05)" }}
            >
              <HugeiconsIcon
                icon={MailSend01Icon}
                size={28}
                color="#00B3FF"
                strokeWidth={0}
              />
            </div>

            {/* Title */}
            <h2 className="font-[SN_Pro] text-[20px] font-semibold text-[#0F172A] mb-2">
              Reset link sent
            </h2>

            {/* Subtitle */}
            <p className="text-[14px] text-[#475569] mb-1 leading-relaxed">
              We&apos;ve sent a password reset link to
            </p>
            <p className="text-[14px] font-semibold text-[#0F172A] mb-6">
              tobilobaajimosun@gmail.com
            </p>

            {/* Buttons */}
            <CoreButton
              variant="filled"
              className="w-full mb-3"
              onClick={() => setShowModal(false)}
            >
              Done
            </CoreButton>
            <CoreButton
              variant="ghost"
              className="w-full"
              onClick={() => setShowModal(false)}
            >
              Resend email
            </CoreButton>
          </div>
        </div>
      )}
    </div>
  );
}
