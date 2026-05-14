export const normalizeText = (text = "") =>
  text
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/【.*?】/g, "")
    .replace(/（.*?）/g, "");
