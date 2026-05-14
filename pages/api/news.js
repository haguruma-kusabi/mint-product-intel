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
      "チョコミント ドトール",
      "チョコミント アイス",
      "チョコミント スイーツ",
    ];

    const fetchRSS = async (q) => {
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
    };

    const results = await Promise.all(queries.map(fetchRSS));
    let items = results.flat();

    /* =========================
       ■ 画像抽出（強化版）
    ========================= */
    const extractImage = (html, url) => {
      const lowerUrl = url.toLowerCase();

      // ★ 汎用
      let img =
        html.match(/<meta property="og:image" content="(.*?)"/)?.[1] ||
        html.match(/<meta name="twitter:image" content="(.*?)"/)?.[1];

      // ★ サイト別
      if (!img) {
        if (lowerUrl.includes("entabe")) {
          img = html.match(/<img[^>]+class="main-image"[^>]+src="(.*?)"/)?.[1];
        }

        if (lowerUrl.includes("fashion-press")) {
          img = html.match(/<figure.*?<img[^>]+src="(.*?)"/s)?.[1];
        }

        if (lowerUrl.includes("gigazine")) {
          img = html.match(/<figure[^>]*>\s*<img[^>]+src="(.*?)"/s)?.[1];
        }

        if (lowerUrl.includes("prtimes")) {
          img = html.match(/<img[^>]+src="(https:\/\/prtimes\.jp\/.*?)"/)?.[1];
        }

        if (lowerUrl.includes("starbucks")) {
          img = html.match(/<img[^>]+src="(.*?)"/)?.[1];
        }

        if (lowerUrl.includes("lawson")) {
          img = html.match(/<img[^>]+src="(.*?)"/)?.[1];
        }
      }

      // ★ 最終 fallback
      if (!img) {
        img = html.match(/<img[^>]+src="(.*?)"/)?.[1];
      }

      if (!img) return "https://placehold.jp/300x200.png";

      try {
        return new URL(img, url).href;
      } catch {
        return img;
      }
    };

    /* =========================
       ■ 本文取得
    ========================= */
    const enriched = await Promise.all(
      items.map(async (item) => {
        try {
          const r = await fetch(item.link, {
            redirect: "follow",
            headers: { "User-Agent": "Mozilla/5.0" },
          });

          const finalUrl = r.url;
          const html = await r.text();

          const img = extractImage(html, finalUrl);

          return {
            ...item,
            link: finalUrl,
            img,
            raw: html,
          };
        } catch {
          return {
            ...item,
            img: "https://placehold.jp/300x200.png",
            raw: "",
          };
        }
      })
    );

    /* =========================
       ■ ソート
    ========================= */
    enriched.sort((a, b) => new Date(b.date) - new Date(a.date));

    cache = {
      data: enriched,
      time: Date.now(),
    };

    res.status(200).json(enriched);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}
