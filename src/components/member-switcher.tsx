"use client";

import { useTransition } from "react";
import { setMember } from "@/app/actions-p3";
import { logout } from "@/app/actions-auth";
import type { Member } from "@/lib/queries";

export function MemberSwitcher({ members, memberId }: { members: Member[]; memberId: number | null }) {
  const [pending, start] = useTransition();
  if (members.length === 0) return null;

  const current = members.find((m) => m.id === memberId);

  // Jika anggota memiliki PIN aktif, sarankan Ganti Akun via logout ke layar profil
  const hasPinSystem = members.some((m) => m.has_pin);

  if (hasPinSystem && current) {
    return (
      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface border border-line shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center shrink-0">
            {current.name.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-ink truncate">{current.name}</span>
        </div>
        <button
          type="button"
          onClick={() => start(() => logout())}
          title="Ganti akun anggota"
          className="text-[11px] text-muted hover:text-brand font-medium hover:underline shrink-0"
        >
          Ganti
        </button>
      </div>
    );
  }

  // Jika belum ada PIN, dropdown bebas tetap tersedia
  return (
    <label className="block">
      <span className="label !text-[10px] !mb-1">Pencatat Aktif</span>
      <select
        className="input !py-1.5 !px-2 !text-xs font-semibold"
        disabled={pending}
        value={memberId ?? ""}
        onChange={(e) => start(() => setMember(Number(e.target.value)))}
      >
        <option value="">Tanpa nama</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} {m.has_pin ? "🔒" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
