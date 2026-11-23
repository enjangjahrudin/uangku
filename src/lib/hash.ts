import { createHash } from "node:crypto";

export function hashPin(pin: string): string {
  return createHash("sha256").update(pin.trim()).digest("hex");
}
