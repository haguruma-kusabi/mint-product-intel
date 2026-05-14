let cache = {
  data: null,
  time: 0,
};

export default async function handler(req, res) {
  try {
    const CACHE_TTL = 1000 * 60 * 10;

    if (cache.data && Date.now() - cache.time < CACHE_TTL) {
      return res.status(200).json(cache.data);
    }

    const queries = [
      "チョコミント 新発売",
      "チョコミント コンビニ",
      "チョコミント スターバックス",
      "チョコミント タリーズ",
      "チョコミント アイス",
    ];

    const fetchRSS = async (q) => {
      try {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ja&gl=JP&ceid=JP:ja`;
        const xml = await fetch(url).then((r) => r.text());

        return [...xml.matchAll(/<item>(.*?)<\/item>/gs)].map((m) => {
          const item = m[1];
          return {
            title: item.match(/<title>(.*?)<\/title>/)?.[1] || "",
            link: item.match(/<link>(.*?)<\/link>/)?.[1] || "",
            date: item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "",
          };
        });
      } catch {
        return [];
      }
    };

    const results = await Promise.all(queries.map(fetchRSS));
    let items = results.flat();

    /* =========================
       ■ 軽量画像取得（安全版）
    ========================= */
    const getImage = async (url) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const r = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: controller.signal,
        });

        clearTimeout(timeout);

        const html = await r.text();

        const img =
          html.match(/<meta property="og:image" content="(.*?)"/)?.[1] ||
          html.match(/<meta name="twitter:image" content="(.*?)"/)?.[1];

        if (!img) return null;

        return img.startsWith("http")
          ? img
          : new URL(img, url).href;
      } catch {
        return null;
      }
    };

    /* =========================
       ■ 失敗しても絶対落ちない処理
    ========================= */
    const enriched = await Promise.all(
      items.map(async (item) => {
        const img = await getImage(item.link);

        return {
          ...item,
          img: img || "https://placehold.jp/300x200.png",
        };
      })
    );

    enriched.sort((a, b) => new Date(b.date) - new Date(a.date));

    cache = {
      data: enriched,
      time: Date.now(),
    };

    res.status(200).json(enriched);
  } catch {
    res.status(200).json([]); // ★絶対落とさない
  }
}
