import { fetchHTML } from "./fetcher.js";
import { extractText } from "./parser.js";
import { extractProduct } from "./extractor.js";

export const analyze = async (url, title) => {
  try {
    const { html } = await fetchHTML(url);
    const text = extractText(html);

    return extractProduct(title, text);
  } catch {
    return {
      productName: title,
      brand: "",
      category: "",
      confidence: 0.2,
    };
  }
};
