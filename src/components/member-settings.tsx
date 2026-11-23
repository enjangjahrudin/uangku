"use client";

import { useState } from "react";
import { addMember, deleteMember, setMemberPin } from "@/app/actions-p3";
import type { Member } from "@/lib/queries";

export function MemberSettings({ members }: { members: Member[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-lg">Anggota Keluarga & PIN</h2>
        <p className="text-sm text-muted max-w-xl mt-0.5">
          Setiap anggota keluarga dapat memiliki akun dengan nama dan PIN mandiri. Transaksi yang dicatat akan otomatis terhubung ke nama anggota yang sedang masuk.
        </p>
      </div>

      {members.length > 0 && (
        <div className="card divide-y divide-line max-w-lg">
          {members.map((m) => (
            <div key={m.id} className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold text-xs flex items-center justify-center shrink-0">
                    {m.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="font-semibold text-sm truncate">{m.name}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${m.has_pin ? "bg-brand-soft text-brand" : "bg-bg text-muted border border-line"}`}>
                    {m.has_pin ? "🔒 PIN Aktif" : "🔓 Tanpa PIN"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(editingId === m.id ? null : m.id)}
                    className="text-xs text-brand font-semibold hover:underline"
                  >
                    {editingId === m.id ? "Tutup" : m.has_pin ? "Ganti PIN" : "Pasang PIN"}
                  </button>
                  <form action={deleteMember.bind(null, m.id)}>
                    <button className="text-xs text-muted hover:text-out" title="Hapus anggota">
                      Hapus
                    </button>
                  </form>
                </div>
              </div>

              {editingId === m.id && (
                <form action={setMemberPin} onSubmit={() => setEditingId(null)} className="flex items-center gap-2 pt-2 border-t border-line/60">
                  <input type="hidden" name="member_id" value={m.id} />
                  <input
                    name="pin"
                    type="password"
                    inputMode="numeric"
                    placeholder="PIN baru (4-6 digit, kosongkan utk hapus)"
                    className="input !py-1.5 text-xs flex-1"
                  />
                  <button className="btn btn-primary !py-1.5 text-xs">Simpan PIN</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Tambah Anggota */}
      <form action={addMember} className="card p-4 space-y-3 max-w-lg">
        <h3 className="font-semibold text-sm">Tambah Anggota Baru</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Nama Anggota</label>
            <input name="name" required placeholder="mis. Ayah, Ibu, Kakak" className="input text-sm" />
          </div>
          <div>
            <label className="label">PIN Akun (Opsional)</label>
            <input name="pin" type="password" inputMode="numeric" placeholder="4-6 digit angka" className="input text-sm" />
          </div>
        </div>
        <button className="btn btn-primary w-full sm:w-auto text-xs !py-2">
          + Tambahkan Anggota
        </button>
      </form>
    </section>
  );
}
