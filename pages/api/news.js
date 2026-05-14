export default async function handler(req, res) {
  try {
    const rssUrl =
      "https://news.google.com/rss/search?q=チョコミント&hl=ja&gl=JP&ceid=JP:ja";

    const r = await fetch(rssUrl);
    const xml = await r.text();

    const items = [...xml.matchAll(/<item>(.*?)<\/item>/gs)].map((m) => {
      const item = m[1];

      return {
        title: item.match(/<title>(.*?)<\/title>/)?.[1] || "",
        link: item.match(/<link>(.*?)<\/link>/)?.[1] || "",
        date: item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "",
      };
    });

    res.status(200).json(items);
  } catch {
    res.status(500).json([]);
  }
}
