"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/actions-auth";
import type { Member } from "@/lib/queries";

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function WalletLogo() {
  return (
    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-brand via-brand to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-brand/25 border border-white/20">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        <circle cx="16.5" cy="12.5" r="1" fill="currentColor" />
      </svg>
    </div>
  );
}

export function LoginForm({ members, hasMasterPassword }: { members: Member[]; hasMasterPassword: boolean }) {
  const [state, action, pending] = useActionState(login, undefined);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [useMaster, setUseMaster] = useState(members.length === 0);

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center px-4 overflow-hidden bg-bg py-8">
      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm z-10 space-y-6">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <WalletLogo />
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-ink">
                Uang<span className="text-brand">Ku</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-soft text-brand border border-brand/20">
                Keluarga
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              Buku Kas Pribadi & Rumah Tangga
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="card !rounded-2xl p-6 sm:p-7 shadow-xl shadow-black/[0.04] bg-surface/95 backdrop-blur-xl border-line/80 space-y-5">
          {/* SKENARIO 1: Pilih Profil Anggota Keluarga */}
          {members.length > 0 && !selectedMember && !useMaster && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-sm font-semibold text-ink">Masuk sebagai Siapa?</h2>
                <p className="text-xs text-muted mt-0.5">Pilih akun anggota keluarga Anda</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMember(m)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-line bg-surface hover:bg-brand-soft/40 hover:border-brand/40 active:scale-95 transition-all text-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand to-emerald-500 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-brand/20 mb-2 group-hover:scale-105 transition-transform">
                      {m.name.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-ink truncate w-full">{m.name}</span>
                    <span className="text-[10px] text-muted mt-0.5">
                      {m.has_pin ? "🔒 PIN Aktif" : "🔓 Tanpa PIN"}
                    </span>
                  </button>
                ))}
              </div>

              {hasMasterPassword && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setUseMaster(true)}
                    className="text-xs text-muted hover:text-ink font-medium underline"
                  >
                    Masuk dengan Kata Sandi Master
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SKENARIO 2: Form Input PIN Anggota yang Dipilih */}
          {selectedMember && !useMaster && (
            <form action={action} className="space-y-4">
              <input type="hidden" name="type" value="member" />
              <input type="hidden" name="member_id" value={selectedMember.id} />

              <div className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-line">
                <div className="w-10 h-10 rounded-full bg-brand text-white font-bold flex items-center justify-center shadow-xs">
                  {selectedMember.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted">Akun Terpilih</div>
                  <div className="font-bold text-sm text-ink truncate">{selectedMember.name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="text-xs text-brand font-semibold hover:underline"
                >
                  Ganti
                </button>
              </div>

              {selectedMember.has_pin ? (
                <div>
                  <label className="label text-xs font-semibold" htmlFor="member-pin">
                    Masukkan PIN Akun
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10">
                      <LockIcon />
                    </span>
                    <input
                      id="member-pin"
                      name="pin"
                      type={showPassword ? "text" : "password"}
                      inputMode="numeric"
                      required
                      autoFocus
                      placeholder="Masukkan PIN Anda..."
                      className="input !pl-11 !pr-11 text-sm font-medium tracking-widest !rounded-xl"
                      style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Sembunyikan PIN" : "Tampilkan PIN"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 rounded-md transition-colors z-10"
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted text-center py-1">
                  Akun ini belum memiliki PIN. Anda dapat masuk langsung atau mengatur PIN di menu Pengaturan.
                </div>
              )}

              {state?.error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-out-soft border border-out/20 text-out text-xs animate-shake">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{state.error}</span>
                </div>
              )}

              <button
                disabled={pending}
                className="btn btn-primary w-full !py-3 !rounded-xl text-sm font-bold shadow-lg shadow-brand/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {pending ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memeriksa PIN...</span>
                  </>
                ) : (
                  <>
                    <span>Buka Aplikasi</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* SKENARIO 3: Form Master Password */}
          {(useMaster || members.length === 0) && (
            <form action={action} className="space-y-4">
              <input type="hidden" name="type" value="master" />

              <div>
                <label className="label text-xs font-semibold" htmlFor="pw">
                  Kata Sandi Master
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10">
                    <LockIcon />
                  </span>
                  <input
                    id="pw"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    placeholder="Masukkan sandi master..."
                    autoComplete="current-password"
                    className="input !pl-11 !pr-11 text-sm font-medium tracking-wide !rounded-xl"
                    style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 rounded-md transition-colors z-10"
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              {state?.error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-out-soft border border-out/20 text-out text-xs animate-shake">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{state.error}</span>
                </div>
              )}

              <button
                disabled={pending}
                className="btn btn-primary w-full !py-3 !rounded-xl text-sm font-bold shadow-lg shadow-brand/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {pending ? (
                  <span>Memeriksa Sandi...</span>
                ) : (
                  <>
                    <span>Buka Buku Kas</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              {members.length > 0 && (
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setUseMaster(false)}
                    className="text-xs text-brand font-semibold hover:underline"
                  >
                    &larr; Kembali ke Pilihan Profil Anggota
                  </button>
                </div>
              )}
            </form>
          )}

          <div className="border-t border-line/60 pt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted font-medium">
            <span className="text-brand"><ShieldIcon /></span>
            <span>Data tersimpan aman di server pribadi Anda</span>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-muted/70">
          UangKu &copy; {new Date().getFullYear()} &middot; Self-hosted Financial Tracker
        </p>
      </div>
    </div>
  );
}
