"use client";

import Image from "next/image";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { BeyondUser } from "@/shared/types/beyond";

interface AccountSectionProps {
  user: BeyondUser | null;
}

export function AccountSection({ user }: AccountSectionProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="p-12">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-white mb-8">Account</h2>

        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-white/10">
            <Image
              src={
                user?.UserAccount.Avatar ||
                "https://cdn.discordapp.com/embed/avatars/0.png"
              }
              alt={user?.UserAccount.DisplayName || "User"}
              width={56}
              height={56}
              className="rounded-full"
              unoptimized
            />
            <div>
              <h3 className="text-xl font-semibold text-white">
                {user?.UserAccount.DisplayName || "User"}
              </h3>
              <p className="text-sm text-white/40 mt-0.5">
                {user?.ID || "N/A"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Profile Information
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <CopyableField
                label="Account ID"
                value={user?.ID || "N/A"}
                fieldKey="accountId"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
              <CopyableField
                label="Discord ID"
                value={user?.UserAccount.DiscordID || "N/A"}
                fieldKey="discordId"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
              <CopyableField
                label="Display Name"
                value={user?.UserAccount.DisplayName || "N/A"}
                fieldKey="displayName"
                copiedField={copiedField}
                onCopy={copyToClipboard}
                isLast
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Account Stats
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Season Level"
                value={user?.Profiles.Athena.SeasonLevel.toString() || "0"}
              />
              <StatCard
                label="Battle Pass Level"
                value={user?.Profiles.Athena.BookLevel.toString() || "0"}
              />
              <StatCard
                label="V-Bucks"
                value={user?.Profiles.CommonCore.Vbucks.toString() || "0"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyableField({
  label,
  value,
  fieldKey,
  copiedField,
  onCopy,
  isLast,
}: {
  label: string;
  value: string;
  fieldKey: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  isLast?: boolean;
}) {
  const isCopied = copiedField === fieldKey;

  return (
    <div
      className={`flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-all duration-200 group ${
        !isLast ? "border-b border-white/10" : ""
      }`}
    >
      <div className="flex-1">
        <label className="text-xs text-white/40 uppercase tracking-wider font-semibold block mb-1">
          {label}
        </label>
        <p className="text-sm text-white/80 font-mono">{value}</p>
      </div>
      <button
        onClick={() => onCopy(value, fieldKey)}
        className={`p-2 rounded hover:bg-white/10 transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 ${
          isCopied ? "scale-110" : ""
        }`}
      >
        {isCopied ? (
          <Check className="w-4 h-4 text-green-400 animate-in zoom-in duration-200" />
        ) : (
          <Copy className="w-4 h-4 text-white/60" />
        )}
      </button>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1.5">
        {label}
      </p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
