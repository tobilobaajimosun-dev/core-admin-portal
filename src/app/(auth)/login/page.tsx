"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons-pro/core-stroke-rounded";
import { CoreButton } from "@/components/ui/CoreButton";
import { CoreInput } from "@/components/ui/CoreInput";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export default function LoginPage() {
  const router = useRouter();
  const { toastProps, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("success", "Sign in successful", "Welcome back, Lademi");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* ── Left panel — form ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Logo */}
        <div className="px-10 pt-8 pb-0">
          <Image
            src="/images/core-logo.png"
            width={100}
            height={34}
            alt="Core"
            priority
          />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center px-10">
          <div className="w-full max-w-[507px]">
            {/* Heading */}
            <h1 className="font-[SN_Pro] text-[36px] font-bold text-[#00B3FF] tracking-[-0.5px] leading-[1.1] mb-2">
              Hi there.
            </h1>
            <p className="text-[16px] text-[#272932] mb-8 leading-[1.5]">
              Enter your details to access the dashboard.
            </p>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              <CoreInput
                label="Email"
                type="email"
                placeholder="Work email"
              />

              <CoreInput
                label="Password"
                type="password"
                passwordToggle
                placeholder="Enter your password"
              />
            </div>

            {/* Forgot password */}
            <div className="flex justify-end mt-3 mb-5">
              <a
                href="/forgot-password"
                className="text-[14px] font-semibold text-[#00B3FF] hover:underline cursor-pointer"
              >
                Forgot password?
              </a>
            </div>

            {/* Sign in button */}
            <CoreButton
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              onClick={handleSignIn}
            >
              Sign in
              {!loading && (
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              )}
            </CoreButton>

            <p className="text-[13px] text-[#475569] mt-6 text-center">
              Don&apos;t have access?{" "}
              <a className="text-[#00B3FF] font-semibold hover:underline cursor-pointer">
                Contact your admin
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
      </div>

      {/* ── Right panel — decorative ──────────────────────────────────── */}
      <div className="hidden lg:flex w-[580px] bg-white items-center justify-center relative overflow-hidden">
        {/* Outer blurred glow */}
        <div className="absolute w-[560px] h-[560px] rounded-full bg-[#EBF8FF] opacity-60 blur-[60px]" />

        {/* Main decorative circle */}
        <div className="relative w-[508px] h-[508px] rounded-full bg-[#F5F7FA] flex items-center justify-center">
          {/* Inner circle */}
          <div className="absolute w-[380px] h-[380px] rounded-full bg-white border border-[#E8EDF2] shadow-sm" />

          {/* Dashboard card mockup */}
          <div className="relative z-10 flex flex-col gap-3 w-[240px]">
            {/* Metric card */}
            <div className="bg-white rounded-xl border border-[#E8EDF2] shadow-sm p-4">
              <p className="text-[11px] font-medium text-[#94A3B8] mb-1">Total Loans</p>
              <p className="font-[SN_Pro] text-[22px] font-semibold text-[#0F172A] leading-none">₦ 24.6M</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[11px] font-medium text-[#22C55E]">+12.4%</span>
                <span className="text-[11px] text-[#94A3B8]">this month</span>
              </div>
            </div>

            {/* Second card */}
            <div className="bg-white rounded-xl border border-[#E8EDF2] shadow-sm p-4">
              <p className="text-[11px] font-medium text-[#94A3B8] mb-1">Active Users</p>
              <p className="font-[SN_Pro] text-[22px] font-semibold text-[#0F172A] leading-none">8,421</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[11px] font-medium text-[#22C55E]">+3.2%</span>
                <span className="text-[11px] text-[#94A3B8]">vs last week</span>
              </div>
            </div>

            {/* Bar chart mockup */}
            <div className="bg-white rounded-xl border border-[#E8EDF2] shadow-sm p-4">
              <p className="text-[11px] font-medium text-[#94A3B8] mb-3">Disbursements</p>
              <div className="flex items-end gap-1.5 h-[40px]">
                {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      backgroundColor: i === 5 ? "#00B3FF" : "#E8EDF2",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating accent dot */}
          <div className="absolute top-12 right-12 w-3 h-3 rounded-full bg-[#00B3FF] opacity-60" />
          <div className="absolute bottom-16 left-10 w-2 h-2 rounded-full bg-[#00B3FF] opacity-40" />
        </div>
      </div>

      <Toast {...toastProps} onClose={hideToast} />
    </div>
  );
}
