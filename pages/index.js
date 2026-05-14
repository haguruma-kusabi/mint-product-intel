import { useEffect, useState } from "react";

const GROUPS = {
  コンビニ: ["ローソン", "セブン", "ファミマ"],
  カフェ: ["スタバ", "タリーズ", "ドトール"],
  メーカー: ["明治", "森永", "グリコ", "ロッテ"],
};

/* =========================
   ■ ブランド判定（強化＋安定版）
========================= */
const getBrand = (text = "") => {
  const t = (text || "")
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/’/g, "'");

  // コンビニ
  if (/(lawson|ローソン)/.test(t)) return "ローソン";
  if (/(7-?eleven|セブン|seven)/.test(t)) return "セブン";
  if (/(familymart|ファミマ|famima)/.test(t)) return "ファミマ";

  // カフェ（ここが重要）
  if (/(starbucks|スタバ|sbux)/.test(t)) return "スタバ";
  if (/(tully'?s|tullys|タリーズ|tully)/.test(t)) return "タリーズ";
  if (/(doutor|ドトール)/.test(t)) return "ドトール";

  // メーカー
  if (/(meiji|明治)/.test(t)) return "明治";
  if (/(morinaga|森永)/.test(t)) return "森永";
  if (/(glico|グリコ)/.test(t)) return "グリコ";
  if (/(lotte|ロッテ)/.test(t)) return "ロッテ";

  return "";
};

/* =========================
   ■ ブランド色
========================= */
const getBrandColor = (brand) => {
  if (brand === "セブン") return "#ff9f43";
  if (brand === "ローソン") return "#2d7ff9";
  if (brand === "ファミマ") return "#2ecc71";
  return "#333";
};

/* =========================
   ■ 画像
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

/* =========================
   ■ 絵文字
========================= */
const getEmoji = (text = "") => {
  if (/アイス|ice/.test(text)) return "🍨";
  if (/スイーツ|ケーキ/.test(text)) return "🍰";
  if (/ドリンク|飲料/.test(text)) return "🥤";
  if (/チョコ/.test(text)) return "🍫";
  return "🍃";
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
    const text = (item.title + item.link).toLowerCase();

    if (keyword && !text.includes(keyword.toLowerCase()))
      return false;

    const brand = getBrand(item.title + item.link);

    if (activeGroups.length > 0) {
      const ok = activeGroups.some((g) =>
        GROUPS[g].includes(brand)
      );
      if (!ok) return false;
    }

    const diff =
      (new Date() - new Date(item.date)) /
      (1000 * 60 * 60 * 24);

    if (diff > range) return false;

    return true;
  });

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🍫 mint intel</h1>

      {/* ■ タブ（復活） */}
      <div style={styles.tabRow}>
        <button onClick={() => setTab("all")} style={tabBtn(tab === "all")}>
          新着
        </button>
        <button onClick={() => setTab("fav")} style={tabBtn(tab === "fav")}>
          お気に入り
        </button>
      </div>

      {/* ■ 検索（復活） */}
      <div style={styles.searchRow}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="検索"
          style={styles.search}
        />

        <select
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          style={styles.select}
        >
          <option value={3}>3日</option>
          <option value={7}>7日</option>
          <option value={14}>14日</option>
          <option value={30}>30日</option>
        </select>
      </div>

      {/* ■ フィルタ（復活） */}
      <div style={styles.filterRow}>
        {Object.keys(GROUPS).map((g) => (
          <button
            key={g}
            onClick={() => toggleGroup(g)}
            style={filterBtn(activeGroups.includes(g))}
          >
            {g}
          </button>
        ))}
      </div>

      {/* ■ ローディング */}
      {loading && <div style={styles.skeleton} />}

      {/* ■ カード */}
      <div style={styles.grid}>
        {!loading &&
          filtered.map((item, i) => {
            const brand = getBrand(item.title + item.link);
            const img = getImage(item);

            return (
              <div key={i} style={styles.card}>
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

                {img ? (
                  <img src={img} style={styles.img} />
                ) : (
                  <div style={styles.emojiBox}>
                    {getEmoji(item.title)}
                  </div>
                )}

                <div style={styles.titleText}>{item.title}</div>

                <div style={styles.metaRow}>
                  <span>
                    {new Date(item.date).toLocaleDateString()}
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
   ■ styles（省略なし復活）
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

  title: { textAlign: "center", fontSize: 18, marginBottom: 10 },

  tabRow: { display: "flex", gap: 6, marginBottom: 10 },

  searchRow: { display: "flex", gap: 6, marginBottom: 10 },

  search: { flex: 2, padding: 6, borderRadius: 10, border: "none" },

  select: { flex: 1, borderRadius: 10, border: "none" },

  filterRow: { display: "flex", gap: 6, marginBottom: 12 },

  grid: { display: "grid", gap: 14 },

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

  skeleton: {
    height: 120,
    borderRadius: 12,
    background: "#ffffff22",
  },
};

const tabBtn = (active) => ({
  flex: 1,
  padding: 6,
  borderRadius: 10,
  border: "none",
  fontSize: 12,
  color: "#fff",
  background: active ? "#00c6ff" : "#2a2f36",
});

const filterBtn = (active) => ({
  flex: 1,
  padding: 6,
  borderRadius: 10,
  border: "none",
  fontSize: 12,
  color: "#fff",
  background: active ? "#00c6ff" : "#2a2f36",
});
