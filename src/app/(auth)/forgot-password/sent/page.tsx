import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  MailSend01Icon,
  InformationCircleIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import { CoreButton } from "@/components/ui/CoreButton";

export default function EmailSentPage() {
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
        <div className="w-14 h-14 bg-[#F0FDF4] rounded-2xl flex items-center justify-center mb-6">
          <HugeiconsIcon
            icon={MailSend01Icon}
            size={28}
            color="#22C55E"
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h1 className="font-[SN_Pro] text-[24px] font-semibold text-[#0F172A] text-center mb-2 leading-[130%]">
          Check your email
        </h1>

        {/* Subtitle */}
        <p className="text-[14px] text-[#475569] text-center">
          We&apos;ve sent a password reset link to
        </p>
        <p className="text-[14px] font-semibold text-[#0F172A] text-center">
          name@princepsfinance.com
        </p>

        {/* Info card */}
        <div className="mt-8 w-full bg-[#F2F7F9] rounded-xl px-4 py-3 flex items-start gap-2.5">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={15}
            color="#475569"
            strokeWidth={1.5}
            className="mt-0.5 flex-shrink-0"
          />
          <span className="text-[12px] text-[#475569] leading-relaxed">
            Didn&apos;t receive the email? Check your spam folder or request a
            new link after 60 seconds.
          </span>
        </div>

        {/* Resend */}
        <CoreButton variant="outline" className="w-full mt-6">
          Resend email
        </CoreButton>

        {/* Back */}
        <CoreButton variant="ghost" className="w-full mt-2">
          Back to sign in
        </CoreButton>
      </div>
    </div>
  );
}
