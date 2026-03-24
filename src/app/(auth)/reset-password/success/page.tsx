import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons-pro/core-solid-rounded";
import { CoreButton } from "@/components/ui/CoreButton";

export default function ResetSuccessPage() {
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
        <div className="w-full max-w-[380px] mx-auto px-6 flex flex-col items-center">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: "rgba(34,197,94,0.06)" }}
          >
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              size={32}
              color="#22C55E"
              strokeWidth={0}
            />
          </div>

          <h1 className="font-[SN_Pro] text-[22px] font-semibold text-[#0F172A] text-center mb-1 tracking-[-0.3px]">
            Password updated
          </h1>
          <p className="text-[14px] text-[#475569] text-center mb-8">
            Your password has been changed.
            <br />
            You can now sign in.
          </p>

          <a href="/login" className="w-full">
            <CoreButton
              variant="filled"
              className="w-full h-14 rounded-xl text-[15px] font-semibold"
            >
              Back to sign in
            </CoreButton>
          </a>
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
