import quotes from "@/data/quotes.json";

export type QuoteCategory = "discipline" | "patience" | "consistency" | "strength";

export function quoteForToday() {
  const day = Math.floor(new Date().getTime() / 86400000);
  const categories: QuoteCategory[] = ["discipline", "patience", "consistency", "strength"];
  const category = categories[day % categories.length];
  const pool = quotes.filter((quote) => quote.category === category);
  const quote = pool[day % pool.length];
  return quote;
}
