"use client";

import { useTransition } from "react";
import { setMember } from "@/app/actions-p3";
import type { Member } from "@/lib/queries";

export function MemberSwitcher({ members, memberId }: { members: Member[]; memberId: number | null }) {
  const [pending, start] = useTransition();
  if (members.length === 0) return null;
  return (
    <label className="block">
      <span className="label">Pencatat</span>
      <select
        className="input !py-2 !text-sm" disabled={pending} value={memberId ?? ""}
        onChange={(e) => start(() => setMember(Number(e.target.value)))}
      >
        <option value="">Tanpa nama</option>
        {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
    </label>
  );
}
