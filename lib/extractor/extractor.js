import { normalizeText } from "./normalize.js";
import { BRAND_RULES, CATEGORY_RULES } from "./rules.js";

const matchRule = (text, rules) => {
  for (const r of rules) {
    if (new RegExp(r.key, "i").test(text)) return r.label;
  }
  return "";
};

export const extractProduct = (title, text) => {
  const raw = normalizeText(title + text);

  const brand = matchRule(raw, BRAND_RULES);
  const category = matchRule(raw, CATEGORY_RULES);

  let productName = title
    .replace(/ニュース|記事|まとめ|速報/g, "")
    .trim();

  let confidence = 0.5;

  if (brand) confidence += 0.2;
  if (category) confidence += 0.2;
  if (raw.includes("新発売")) confidence += 0.1;
  if (raw.includes("限定")) confidence += 0.1;

  return {
    productName,
    brand,
    category,
    confidence: Math.min(confidence, 0.99),
  };
};
