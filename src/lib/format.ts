const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export const toBnNumber = (value: number | string) =>
  String(value).replace(/\d/g, (d) => bnDigits[Number(d)]);

export const formatTaka = (value: number) =>
  `৳${toBnNumber(new Intl.NumberFormat("en-US").format(Math.round(value)))}`;
