export const extractText = (html = "") => {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gs, "")
    .replace(/<style[^>]*>.*?<\/style>/gs, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 5000);
};
