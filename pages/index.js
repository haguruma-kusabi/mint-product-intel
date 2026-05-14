import { useEffect, useState } from "react";

/* =========================
   ■ グループ
========================= */
const GROUPS = {
  コンビニ: ["ローソン", "セブン", "ファミマ"],
  カフェ: ["スタバ", "タリーズ", "ドトール"],
  メーカー: ["明治", "森永", "グリコ", "ロッテ"],
};

/* =========================
   ■ ブランド判定
========================= */
const getBrand = (item) => {
  const text = (
    (item.title || "") +
    (item.link || "")
  )
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/スターバックスコーヒー/g, "スターバックス");

  if (/(lawson|ローソン)/.test(text)) return "ローソン";
  if (/(7-?eleven|セブン|seven)/.test(text)) return "セブン";
  if (/(familymart|ファミマ)/.test(text)) return "ファミマ";

  if (/(starbucks|スタバ|スターバックス|sbux)/.test(text)) return "スタバ";
  if (/(tully'?s|タリーズ|tully)/.test(text)) return "タリーズ";
  if (/(doutor|ドトール)/.test(text)) return "ドトール";

  if (/(meiji|明治)/.test(text)) return "明治";
  if (/(morinaga|森永)/.test(text)) return "森永";
  if (/(glico|グリコ)/.test(text)) return "グリコ";
  if (/(lotte|ロッテ)/.test(text)) return "ロッテ";

  return "";
};

const getBrandColor = (brand) => {
  if (brand === "セブン") return "#ff9f43";
  if (brand === "ローソン") return "#2d7ff9";
  if (brand === "ファミマ") return "#2ecc71";
  return "#333";
};

/* =========================
   ■ 絵文字
========================= */
const getEmoji = (text = "") => {
  if (/アイス/.test(text)) return "🍨";
  if (/スイーツ|ケーキ/.test(text)) return "🍰";
  if (/ドリンク/.test(text)) return "🥤";
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
    fetchData();

    const saved = localStorage.getItem("mint-fav");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  const toggleFav = (item) => {
    const exists = favorites.some((f) => f.link === item.link);

    const updated = exists
      ? favorites.filter((f) => f.link !== item.link)
      : [...favorites, item];

    setFavorites(updated);
    localStorage.setItem("mint-fav", JSON.stringify(updated));
  };

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

    const brand = getBrand(item);

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

      {/* タブ */}
      <div style={styles.tabRow}>
        <button onClick={() => setTab("all")} style={tabBtn(tab === "all")}>
          新着
        </button>
        <button onClick={() => setTab("fav")} style={tabBtn(tab === "fav")}>
          お気に入り
        </button>
      </div>

      {/* 検索 */}
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

      {/* フィルタ */}
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

      {/* ローディングUI */}
      {loading && (
        <>
          <div style={{ marginBottom: 10, textAlign: "center", fontSize: 12 }}>
            読み込み中...
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.skeleton} />
          ))}
        </>
      )}

      {/* カード */}
      <div style={styles.grid}>
        {!loading &&
          filtered.map((item, i) => {
            const brand = getBrand(item);

            return (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div style={styles.card}>
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

                  <div style={styles.emojiBox}>
                    {getEmoji(item.title)}
                  </div>

                  <div style={styles.titleText}>{item.title}</div>

                  <div style={styles.metaRow}>
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
              </a>
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

  title: { textAlign: "center", fontSize: 18 },

  tabRow: { display: "flex", gap: 6, marginBottom: 10 },

  searchRow: { display: "flex", gap: 6, marginBottom: 10 },

  search: { flex: 2, padding: 6, borderRadius: 10, border: "none" },

  select: { flex: 1, borderRadius: 10 },

  filterRow: { display: "flex", gap: 6, marginBottom: 12 },

  grid: { display: "grid", gap: 14 },

  card: {
    background: "#fff",
    color: "#111",
    borderRadius: 14,
    padding: 12,
    position: "relative",
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
    marginBottom: 6,
  },

  metaRow: {
    fontSize: 11,
    color: "#666",
  },

  skeleton: {
    height: 180,
    borderRadius: 14,
    background: "#ffffff22",
    marginBottom: 10,
    animation: "pulse 1.5s infinite",
  },
};

const tabBtn = (active) => ({
  flex: 1,
  padding: 6,
  borderRadius: 10,
  border: "none",
  color: "#fff",
  background: active ? "#00c6ff" : "#2a2f36",
});

const filterBtn = (active) => ({
  flex: 1,
  padding: 6,
  borderRadius: 10,
  border: "none",
  color: "#fff",
  background: active ? "#00c6ff" : "#2a2f36",
});

/* アニメーション */
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes pulse {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
}
