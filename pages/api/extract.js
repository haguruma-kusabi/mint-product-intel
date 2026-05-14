import { analyze } from "../../lib/extractor/index.js";

export default async function handler(req, res) {
  const { url, title } = req.query;

  if (!url) {
    return res.status(400).json({ error: "missing url" });
  }

  const result = await analyze(url, title || "");

  res.status(200).json(result);
}
