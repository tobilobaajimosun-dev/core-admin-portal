import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  LockPasswordIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { CoreButton } from "@/components/ui/CoreButton";
import { CoreInput } from "@/components/ui/CoreInput";

export default function ResetPasswordPage() {
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
            icon={LockPasswordIcon}
            size={28}
            color="#00B3FF"
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h1 className="font-[SN_Pro] text-[24px] font-semibold text-[#0F172A] text-center mb-2 leading-[130%]">
          Create new password
        </h1>

        {/* Subtitle */}
        <p className="text-[14px] text-[#475569] text-center mb-8">
          Your new password must be different from previous ones
        </p>

        {/* New password */}
        <CoreInput
          label="New password"
          type="password"
          passwordToggle
          className="w-full"
        />

        {/* Confirm password */}
        <CoreInput
          label="Confirm password"
          type="password"
          passwordToggle
          className="w-full mt-4"
        />

        {/* Password rules card */}
        <div className="mt-4 w-full bg-[#F2F7F9] rounded-xl px-4 py-3 flex flex-col gap-2">
          {[
            "At least 8 characters",
            "One uppercase letter",
            "One number or special character",
          ].map((rule) => (
            <div key={rule} className="flex items-center gap-2">
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                size={14}
                color="#94A3B8"
                strokeWidth={1.5}
                className="flex-shrink-0"
              />
              <span className="text-[12px] text-[#94A3B8]">{rule}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <CoreButton variant="filled" className="w-full mt-6">
          Set new password
        </CoreButton>
      </div>
    </div>
  );
}
