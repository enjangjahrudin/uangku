"use client";

import { useActionState } from "react";
import { login } from "@/app/actions-auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <form action={action} className="card p-6 w-full max-w-sm space-y-4">
        <div className="font-bold text-2xl tracking-tight">Uang<span className="text-brand">Ku</span></div>
        <div>
          <label className="label" htmlFor="pw">Kata sandi</label>
          <input id="pw" name="password" type="password" required autoFocus autoComplete="current-password" className="input" />
        </div>
        {state?.error && <p className="text-sm text-out" role="alert">{state.error}</p>}
        <button disabled={pending} className="btn btn-primary w-full">{pending ? "Memeriksa…" : "Masuk"}</button>
      </form>
    </div>
  );
}
