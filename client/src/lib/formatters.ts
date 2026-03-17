export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyShort(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

export function sortCrasNumerically(craList: string[]): string[] {
  return [...craList].sort((a, b) => {
    const numA = parseInt(a.match(/^\d+/)?.[0] || "");
    const numB = parseInt(b.match(/^\d+/)?.[0] || "");

    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    if (!isNaN(numA)) return -1;
    if (!isNaN(numB)) return 1;
    return a.localeCompare(b, "pt-BR");
  });
}
