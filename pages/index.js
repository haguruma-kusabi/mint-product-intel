import { useEffect, useState } from "react";

const GROUPS = {
  コンビニ: ["ローソン", "セブン", "ファミマ"],
  カフェ: ["スタバ", "タリーズ", "ドトール"],
  メーカー: ["明治", "森永", "グリコ", "ロッテ"],
};

/* =========================
   ■ ブランド判定（次世代版）
========================= */
const getBrand = (item) => {
  const text = (
    (item.title || "") +
    (item.link || "") +
    (item.desc || "") +
    (item.raw || "")
  )
    .toLowerCase()
    .replace(/\s/g, "");

  if (/(lawson|ローソン)/.test(text)) return "ローソン";
  if (/(7-?eleven|セブン|seven)/.test(text)) return "セブン";
  if (/(familymart|ファミマ|famima)/.test(text)) return "ファミマ";

  if (/(starbucks|スタバ)/.test(text)) return "スタバ";

  // ★ここ強化（取りこぼし対策）
  if (/(tully'?s|tullys|tully)/.test(text)) return "タリーズ";

  if (/(doutor|ドトール)/.test(text)) return "ドトール";

  if (/(meiji|明治)/.test(text)) return "明治";
  if (/(morinaga|森永)/.test(text)) return "森永";
  if (/(glico|グリコ)/.test(text)) return "グリコ";
  if (/(lotte|ロッテ)/.test(text)) return "ロッテ";

  return "";
};

/* =========================
   ■ ブランド色（コンビニのみ）
========================= */
const getBrandColor = (brand) => {
  if (brand === "セブン") return "#ff9f43";
  if (brand === "ローソン") return "#2d7ff9";
  if (brand === "ファミマ") return "#2ecc71";
  return "#333";
};

/* =========================
   ■ 絵文字フォールバック
========================= */
const getEmoji = (text = "") => {
  if (/アイス|ice/.test(text)) return "🍨";
  if (/スイーツ|ケーキ/.test(text)) return "🍰";
  if (/ドリンク|飲料/.test(text)) return "🥤";
  if (/チョコ/.test(text)) return "🍫";
  return "🍃";
};

/* =========================
   ■ 画像安定化（強化版）
========================= */
const getImage = (item) => {
  const html = item.raw || "";

  const img =
    html.match(/<meta property="og:image" content="(.*?)"/)?.[1] ||
    html.match(/<meta name="twitter:image" content="(.*?)"/)?.[1] ||
    html.match(/<meta itemprop="image" content="(.*?)"/)?.[1] ||
    html.match(/<img[^>]+src="(.*?)"/)?.[1];

  if (!img) return null;

  if (img.startsWith("http")) return img;

  try {
    return new URL(img, item.link).href;
  } catch {
    return null;
  }
};

export default function Home() {
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [activeGroups, setActiveGroups] = useState([]);
  const [range, setRange] = useState(14);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const data = await fetch("/api/news").then((r) => r.json());

      const sorted = [...data].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setItems(sorted);
      setLoading(false);
    };

    run();

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mint-fav");
      if (saved) setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFav = (item) => {
    const exists = favorites.some((f) => f.link === item.link);

    const updated = exists
      ? favorites.filter((f) => f.link !== item.link)
      : [...favorites, item];

    setFavorites(updated);
    localStorage.setItem("mint-fav", JSON.stringify(updated));
  };

  const isFav = (item) =>
    favorites.some((f) => f.link === item.link);

  const toggleGroup = (g) => {
    setActiveGroups((prev) =>
      prev.includes(g)
        ? prev.filter((x) => x !== g)
        : [...prev, g]
    );
  };

  const baseList = tab === "fav" ? favorites : items;

  const filtered = baseList.filter((item) => {
    const text = (
      item.title +
      item.link +
      item.desc
    ).toLowerCase();

    if (keyword && !text.includes(keyword.toLowerCase()))
      return false;

    const brand = getBrand(item);

    if (activeGroups.length > 0) {
      const ok = activeGroups.some((g) =>
        GROUPS[g].includes(brand)
      );
      if (!ok) return false;
    }

    const date = item.date ? new Date(item.date) : null;
    if (date) {
      const diff =
        (new Date() - date) / (1000 * 60 * 60 * 24);
      if (diff > range) return false;
    }

    return true;
  });

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🍫 mint intel next</h1>

      <div style={styles.grid}>
        {!loading &&
          filtered.map((item, i) => {
            const brand = getBrand(item);
            const img = getImage(item);

            return (
              <div key={i} style={styles.card}>
                {/* ブランドバッジ */}
                {brand && (
                  <div
                    style={{
                      ...styles.badge,
                      background: getBrandColor(brand),
                    }}
                  >
                    {brand}
                  </div>
                )}

                {/* 画像（完全フォールバック付き） */}
                {img ? (
                  <img
                    src={img}
                    style={styles.img}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div style={styles.emojiBox}>
                    {getEmoji(item.title)}
                  </div>
                )}

                {/* タイトル */}
                <div style={styles.titleText}>{item.title}</div>

                {/* メタ */}
                <div style={styles.metaRow}>
                  <span>
                    {item.date
                      ? new Date(item.date).toLocaleDateString()
                      : ""}
                  </span>

                  <button onClick={() => toggleFav(item)}>
                    {isFav(item) ? "❤️" : "🤍"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* =========================
   ■ styles
========================= */

const styles = {
  page: {
    padding: 14,
    maxWidth: 560,
    margin: "0 auto",
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,#0f2027,#203a43,#2c5364)",
    color: "#fff",
  },

  title: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 10,
  },

  grid: {
    display: "grid",
    gap: 14,
  },

  card: {
    background: "#fff",
    color: "#111",
    borderRadius: 14,
    padding: 12,
    position: "relative",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  },

  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    color: "#fff",
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: 6,
  },

  img: {
    width: "100%",
    height: 160,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 8,
  },

  emojiBox: {
    height: 160,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40,
    background: "#eef6f6",
    borderRadius: 10,
    marginBottom: 8,
  },

  titleText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    color: "#666",
  },
};
