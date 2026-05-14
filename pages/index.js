import { useEffect, useState } from "react";

const GROUPS = {
  コンビニ: ["ローソン", "セブン", "ファミマ"],
  カフェ: ["スタバ", "タリーズ", "ドトール"],
  メーカー: ["明治", "森永", "グリコ", "ロッテ"],
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
      try {
        const data = await fetch("/api/news").then((r) => r.json());

        const sorted = [...data].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setItems(sorted);
      } finally {
        setLoading(false);
      }
    };

    run();

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mint-fav");
      if (saved) setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFav = (item) => {
    let updated;

    if (favorites.some((f) => f.link === item.link)) {
      updated = favorites.filter((f) => f.link !== item.link);
    } else {
      updated = [...favorites, item];
    }

    setFavorites(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem("mint-fav", JSON.stringify(updated));
    }
  };

  const isFav = (item) =>
    favorites.some((f) => f.link === item.link);

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

  const toggleGroup = (g) => {
    setActiveGroups((prev) =>
      prev.includes(g)
        ? prev.filter((x) => x !== g)
        : [...prev, g]
    );
  };

  const baseList = tab === "fav" ? favorites : items;

  const filtered = baseList.filter((item) => {
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
      <h1 style={styles.title}>🍫 mint intel</h1>

      <div style={styles.tabRow}>
        <button onClick={() => setTab("all")} style={tabBtn(tab === "all")}>
          新着
        </button>
        <button onClick={() => setTab("fav")} style={tabBtn(tab === "fav")}>
          お気に入り
        </button>
      </div>

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

      {loading && (
        <div>
          {[1, 2, 3].map((i) => (
            <div key={i} style={skeleton} />
          ))}
        </div>
      )}

      <div style={styles.grid}>
        {!loading &&
          filtered.map((item, i) => {
            const brand = getBrand(item.title + item.link);

            return (
              <div key={i} style={styles.card}>
                {/* ■ ブランド（上固定） */}
                {brand && (
                  <div style={styles.badgeBrand}>{brand}</div>
                )}

                {/* ■ アイコン行 */}
                <div style={styles.iconRow}>
                  <span style={styles.emoji}>
                    {getEmoji(item.title)}
                  </span>
                </div>

                {/* ■ タイトル */}
                <div style={styles.titleText}>{item.title}</div>

                {/* ■ ★ 完全分離メタ行（競合解消ポイント） */}
                <div style={styles.metaRow}>
                  <span style={styles.date}>
                    {new Date(item.date).toLocaleDateString()}
                  </span>

                  <button onClick={() => toggleFav(item)} style={favBtn}>
                    {isFav(item) ? "❤️" : "🤍"}
                  </button>
                </div>

                <a href={item.link} target="_blank" style={styles.link}>
                  記事 →
                </a>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* =========================
   ■ 安全関数
========================= */

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

const favBtn = {
  border: "none",
  background: "transparent",
};

const skeleton = {
  height: 120,
  marginBottom: 10,
  borderRadius: 12,
  background: "#ffffff22",
};

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

  tabRow: {
    display: "flex",
    gap: 6,
    marginBottom: 10,
  },

  searchRow: {
    display: "flex",
    gap: 6,
    marginBottom: 10,
  },

  search: {
    flex: 2,
    padding: 6,
    borderRadius: 10,
    border: "none",
  },

  select: {
    flex: 1,
    borderRadius: 10,
    border: "none",
  },

  filterRow: {
    display: "flex",
    gap: 6,
    marginBottom: 12,
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

  badgeBrand: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "#333",
    color: "#fff",
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: 6,
  },

  iconRow: {
    marginBottom: 6,
  },

  emoji: {
    fontSize: 20,
  },

  titleText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 11,
    color: "#666",
    marginBottom: 6,
  },

  date: {
    fontSize: 11,
  },

  link: {
    fontSize: 12,
    color: "#007aff",
    textDecoration: "none",
  },
};
