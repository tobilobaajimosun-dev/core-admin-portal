import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { CoreButton } from "@/components/ui/CoreButton";

export default function ResetSuccessPage() {
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
        <div className="w-14 h-14 bg-[#F0FDF4] rounded-2xl flex items-center justify-center mb-6">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={28}
            color="#22C55E"
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h1 className="font-[SN_Pro] text-[24px] font-semibold text-[#0F172A] text-center mb-2 leading-[130%]">
          Password updated
        </h1>

        {/* Subtitle */}
        <p className="text-[14px] text-[#475569] text-center mb-8">
          Your password has been changed successfully. You can now sign in with
          your new password.
        </p>

        {/* CTA */}
        <a href="/login" className="w-full">
          <CoreButton variant="filled" className="w-full">
            Back to sign in
          </CoreButton>
        </a>
      </div>
    </div>
  );
}
