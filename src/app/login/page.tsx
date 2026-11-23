import { getMembers } from "@/lib/queries";
import { authEnabled } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const members = getMembers();
  const hasMaster = authEnabled();

  return <LoginForm members={members} hasMasterPassword={hasMaster} />;
}
