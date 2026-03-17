import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiSecurityIcon } from "@hugeicons-pro/core-stroke-rounded";
import { CoreButton } from "@/components/ui/CoreButton";
import { CoreInput } from "@/components/ui/CoreInput";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-full max-w-[400px] px-6 py-12 flex flex-col items-center">
        {/* Logo */}
        <Image
          src="/images/core-logo.png"
          width={120}
          height={40}
          alt="Core by Princeps"
          className="mb-10"
          priority
        />

        {/* Title */}
        <h1
          className="font-[SN_Pro] text-[24px] font-semibold text-[#0F172A]
                     text-center mb-2 leading-[130%]"
        >
          Welcome back
        </h1>

        {/* Subtitle */}
        <p className="text-[14px] text-[#475569] text-center mb-8">
          Sign in to your admin account
        </p>

        {/* Email field */}
        <CoreInput
          label="Email address"
          type="email"
          placeholder="name@princepsfinance.com"
          className="w-full"
        />

        {/* Password field */}
        <div className="w-full mt-4">
          <label className="text-[13px] font-medium text-[#0F172A] mb-1.5 block">
            Password
          </label>
          <CoreInput
            type="password"
            passwordToggle
            placeholder="Enter your password"
            className="w-full"
          />
          <div className="flex justify-end mt-2">
            <a
              href="/forgot-password"
              className="text-[13px] font-semibold text-[#00B3FF] hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* Sign in button */}
        <CoreButton variant="filled" className="w-full mt-6">
          Sign in
        </CoreButton>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full mt-6">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-[12px] text-[#94A3B8]">or</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        {/* Contact admin row */}
        <p className="text-[13px] text-[#475569] mt-4 text-center">
          Don&apos;t have access?{" "}
          <a className="text-[#00B3FF] font-medium hover:underline cursor-pointer">
            Contact your admin
          </a>
        </p>

        {/* Security note */}
        <div className="mt-10 w-full bg-[#F2F7F9] rounded-xl px-4 py-3 flex items-start gap-2.5">
          <HugeiconsIcon
            icon={AiSecurityIcon}
            size={15}
            color="#475569"
            strokeWidth={1.5}
            className="mt-0.5 flex-shrink-0"
          />
          <span className="text-[12px] text-[#475569] leading-relaxed">
            5 failed attempts locks your account for 15 min. Sessions expire
            after 15 min of inactivity.
          </span>
        </div>
      </div>
    </div>
  );
}
