"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
        <div className="w-full max-w-[380px] mx-auto px-6">
          <h1 className="font-[SN_Pro] text-[22px] font-semibold text-[#0F172A] text-center mb-1 tracking-[-0.3px]">
            Welcome back
          </h1>
          <p className="text-[14px] text-[#475569] text-center mb-8">
            Sign in to your admin account
          </p>

          <div className="flex flex-col gap-3">
            <CoreInput
              floatingLabel
              label="Email address"
              type="email"
              className="w-full"
            />

            <CoreInput
              floatingLabel
              label="Password"
              type="password"
              passwordToggle
              className="w-full"
            />

            <div className="flex justify-end -mt-1">
              <a
                href="/forgot-password"
                className="text-[13px] font-semibold text-[#00B3FF] hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <CoreButton
              variant="filled"
              className="w-full h-14 rounded-xl text-[15px] font-semibold mt-2"
              loading={loading}
              onClick={handleSignIn}
            >
              Sign in
            </CoreButton>
          </div>

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

      <Toast {...toastProps} onClose={hideToast} />
    </div>
  );
}
