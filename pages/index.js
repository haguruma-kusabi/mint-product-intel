import { useEffect, useState } from "react";

const GROUPS = {
  コンビニ: ["ローソン", "セブン", "ファミマ"],
  カフェ: ["スタバ", "タリーズ", "ドトール"],
  メーカー: ["明治", "森永", "グリコ", "ロッテ"],
};

export default function Home() {
  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [activeGroups, setActiveGroups] = useState([]);
  const [range, setRange] = useState(14);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const data = await fetch("/api/news").then((r) => r.json());
      setItems(data);
      setLoading(false);
    };
    run();
  }, []);

  const getBrand = (text = "") => {
    const t = text.toLowerCase();

    if (t.includes("lawson") || t.includes("ローソン")) return "ローソン";
    if (t.includes("7") || t.includes("セブン")) return "セブン";
    if (t.includes("familymart") || t.includes("ファミマ")) return "ファミマ";

    if (t.includes("starbucks") || t.includes("スタバ")) return "スタバ";
    if (t.includes("tully")) return "タリーズ";
    if (t.includes("doutor")) return "ドトール";

    if (t.includes("meiji")) return "明治";
    if (t.includes("morinaga")) return "森永";
    if (t.includes("glico")) return "グリコ";
    if (t.includes("lotte")) return "ロッテ";

    return "";
  };

  const getEmoji = (text = "") => {
    if (/アイス|ice/.test(text)) return "🍨";
    if (/スイーツ|ケーキ/.test(text)) return "🍰";
    if (/ドリンク|飲料/.test(text)) return "🥤";
    if (/チョコ/.test(text)) return "🍫";
    return "🍃";
  };

  const isNew = (date) =>
    (new Date() - new Date(date)) / (1000 * 60 * 60 * 24) < 2;

  const toggleGroup = (g) => {
    setActiveGroups((prev) =>
      prev.includes(g)
        ? prev.filter((x) => x !== g)
        : [...prev, g]
    );
  };

  const filtered = items.filter((item) => {
    const text = item.title.toLowerCase();

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
      <h1 style={styles.title}>🍫 mint product intel</h1>

      {/* ■ 検索 */}
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

      {/* ■ フィルタ */}
      <div style={styles.filterRow}>
        {Object.keys(GROUPS).map((g) => (
          <button
            key={g}
            onClick={() => toggleGroup(g)}
            style={{
              ...styles.filterBtn,
              background: activeGroups.includes(g)
                ? "#00c6ff"
                : "#2a2f36",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* ■ ローディング */}
      {loading && (
        <div>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.skeleton} />
          ))}
        </div>
      )}

      {/* ■ カード */}
      <div style={styles.grid}>
        {!loading &&
          filtered.map((item, i) => {
            const brand = getBrand(item.title + item.link);

            return (
              <div key={i} style={styles.card}>
                {isNew(item.date) && (
                  <div style={styles.badgeNew}>NEW</div>
                )}

                {brand && (
                  <div style={styles.badgeBrand}>{brand}</div>
                )}

                <div style={styles.header}>
                  <span style={styles.emoji}>
                    {getEmoji(item.title)}
                  </span>

                  <span style={styles.date}>
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>

                <div style={styles.titleText}>
                  {item.title}
                </div>

                <div style={styles.footer}>
                  <a
                    href={item.link}
                    target="_blank"
                    style={styles.link}
                  >
                    記事を読む →
                  </a>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* ■ styles */

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
    marginBottom: 12,
  },

  searchRow: {
    display: "flex",
    gap: 6,
    marginBottom: 10,
  },

  search: {
    flex: 2,
    padding: "6px 10px",
    borderRadius: 12,
    border: "none",
    fontSize: 13,
  },

  select: {
    flex: 1,
    borderRadius: 10,
    border: "none",
    fontSize: 12,
  },

  filterRow: {
    display: "flex",
    gap: 6,
    marginBottom: 12,
  },

  filterBtn: {
    flex: 1,
    padding: 6,
    borderRadius: 12,
    border: "none",
    color: "#fff",
    fontSize: 12,
  },

  grid: {
    display: "grid",
    gap: 14,
  },

  card: {
    background: "#fff",
    borderRadius: 14,
    padding: 12,
    position: "relative",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    color: "#111",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },

  emoji: { fontSize: 20 },

  date: { fontSize: 11 },

  titleText: {
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 1.4,
    marginBottom: 10,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  footer: {
    display: "flex",
    justifyContent: "flex-end",
  },

  link: {
    fontSize: 12,
    color: "#007aff",
    textDecoration: "none",
  },

  badgeNew: {
    position: "absolute",
    top: 8,
    left: 8,
    background: "#00c6ff",
    padding: "2px 6px",
    borderRadius: 6,
    fontSize: 10,
  },

  badgeBrand: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "#333",
    padding: "2px 6px",
    borderRadius: 6,
    fontSize: 10,
    color: "#fff",
  },

  skeleton: {
    height: 120,
    marginBottom: 10,
    borderRadius: 12,
    background: "#ffffff22",
  },
};
