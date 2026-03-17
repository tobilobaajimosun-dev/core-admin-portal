import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Mail01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { CoreButton } from "@/components/ui/CoreButton";
import { CoreInput } from "@/components/ui/CoreInput";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-full max-w-[400px] px-6 flex flex-col items-center">
        {/* Back link */}
        <a
          href="/login"
          className="flex items-center gap-1.5 text-[13px] text-[#475569] hover:text-[#0F172A] mb-8 self-start"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
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
        <CoreButton variant="filled" className="w-full mt-6">
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
    </div>
  );
}
