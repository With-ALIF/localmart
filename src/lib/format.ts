const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export const toBnNumber = (value: number | string) =>
  String(value).replace(/\d/g, (d) => bnDigits[Number(d)]);

export const formatTaka = (value: number) =>
  `৳${toBnNumber(new Intl.NumberFormat("en-US").format(Math.round(value)))}`;

export function formatOrderDateTime(date: string, time?: string): string {
  if (!date) return "";
  const parts = date.split("-");
  if (parts.length === 3) {
    const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    return time ? `${formatted} ${time}` : formatted;
  }
  return time ? `${date} ${time}` : date;
}
