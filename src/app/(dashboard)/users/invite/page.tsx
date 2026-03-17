import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, InformationCircleIcon } from "@hugeicons-pro/core-stroke-rounded";
import { CoreButton } from "@/components/ui/CoreButton";
import { CoreInput } from "@/components/ui/CoreInput";

export default function InviteUserPage() {
  return (
    <div className="bg-[#F8FAFC] flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] w-full max-w-[480px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h1 className="font-[SN_Pro] text-[18px] font-semibold text-[#0F172A]">
            Invite team member
          </h1>
          <Link href="/users">
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F2F7F9] transition-colors">
              <HugeiconsIcon icon={Cancel01Icon} size={16} color="#94A3B8" strokeWidth={1.5} />
            </button>
          </Link>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-4">
          <CoreInput label="Full name" placeholder="e.g. Adaeze Obi" />

          <CoreInput label="Email address" type="email" placeholder="adaeze@princepsfinance.com" />

          {/* Role selector */}
          <div>
            <label className="text-[13px] font-medium text-[#0F172A] mb-1.5 block">
              Role
            </label>
            <select className="h-12 w-full bg-[#F2F7F9] rounded-xl px-4 border-2 border-transparent outline-none text-[14px] text-[#0F172A] font-normal appearance-none focus:border-[#00B3FF] focus:shadow-[0_0_0_3px_rgba(0,179,255,0.10)] transition-all duration-150">
              <option>Super Admin</option>
              <option>Admin</option>
              <option>Finance</option>
              <option>Compliance</option>
              <option>Support</option>
              <option>Viewer</option>
            </select>
          </div>

          {/* Access note */}
          <div className="bg-[#F2F7F9] rounded-xl px-4 py-3 flex items-start gap-2.5">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={15}
              color="#475569"
              strokeWidth={1.5}
              className="mt-0.5 flex-shrink-0"
            />
            <span className="text-[12px] text-[#475569] leading-relaxed">
              An invitation email will be sent. The link expires in 48 hours.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex gap-3 justify-end">
          <Link href="/users">
            <CoreButton variant="secondary">Cancel</CoreButton>
          </Link>
          <CoreButton variant="filled">Send invitation</CoreButton>
        </div>
      </div>
    </div>
  );
}
