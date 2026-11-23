export const rupiah = (n: number) =>
  (n < 0 ? "-" : "") + "Rp" + Math.abs(n).toLocaleString("id-ID");

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const currentPeriod = () => todayISO().slice(0, 7);

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export const periodLabel = (p: string) => {
  const [y, m] = p.split("-").map(Number);
  return `${BULAN[m - 1]} ${y}`;
};

export const shiftPeriod = (p: string, delta: number) => {
  const [y, m] = p.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const dateLabel = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${BULAN[m - 1].slice(0, 3)} ${y}`;
};

export const WALLET_TYPES: Record<string, string> = {
  cash: "Tunai",
  bank: "Rekening Bank",
  ewallet: "E-Wallet",
  savings: "Tabungan/Deposito",
  invest: "Investasi",
};
