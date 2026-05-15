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

  if (/(starbucks|スタバ|スターバックス|sbux)/.test(text))
    return "スタバ";

  if (/(tully'?s|タリーズ|tully)/.test(text))
    return "タリーズ";

  if (/(doutor|ドトール)/.test(text))
    return "ドトール";

  if (/(meiji|明治)/.test(text)) return "明治";
  if (/(morinaga|森永)/.test(text)) return "森永";
  if (/(glico|グリコ)/.test(text)) return "グリコ";
  if (/(lotte|ロッテ)/.test(text)) return "ロッテ";

  return "";
};

/* =========================
   ■ ブランドカラー
========================= */
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
  const [readItems, setReadItems] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [activeGroups, setActiveGroups] = useState([]);
  const [range, setRange] = useState(14);

  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const [unreadOnly, setUnreadOnly] = useState(false);

  /* =========================
     ■ 初期化
  ========================= */
  useEffect(() => {
    fetchData();

    const savedFav =
      localStorage.getItem("mint-fav");

    if (savedFav) {
      setFavorites(JSON.parse(savedFav));
    }

    const savedRead =
      localStorage.getItem("mint-read");

    if (savedRead) {
      setReadItems(JSON.parse(savedRead));
    }

    const savedScroll =
      sessionStorage.getItem("mint-scroll");

    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(
          0,
          Number(savedScroll)
        );
      }, 100);
    }
  }, []);

  /* =========================
     ■ スクロール保存
  ========================= */
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(
        "mint-scroll",
        window.scrollY
      );
    };

    window.addEventListener(
      "scroll",
      saveScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        saveScroll
      );
  }, []);

  /* =========================
     ■ データ取得
  ========================= */
  const fetchData = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();

      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ■ お気に入り
  ========================= */
  const toggleFav = (item) => {
    const exists = favorites.some(
      (f) => f.link === item.link
    );

    const updated = exists
      ? favorites.filter(
          (f) => f.link !== item.link
        )
      : [...favorites, item];

    setFavorites(updated);

    localStorage.setItem(
      "mint-fav",
      JSON.stringify(updated)
    );
  };

  /* =========================
     ■ 既読登録
  ========================= */
  const markAsRead = (link) => {
    if (readItems.includes(link)) return;

    const updated = [...readItems, link];

    setReadItems(updated);

    localStorage.setItem(
      "mint-read",
      JSON.stringify(updated)
    );
  };

  /* =========================
     ■ 既読リセット
  ========================= */
  const clearRead = () => {
    localStorage.removeItem("mint-read");

    setReadItems([]);
  };

  /* =========================
     ■ グループ切替
  ========================= */
  const toggleGroup = (g) => {
    setActiveGroups((prev) =>
      prev.includes(g)
        ? prev.filter((x) => x !== g)
        : [...prev, g]
    );
  };

  /* =========================
     ■ フィルタ
  ========================= */
  const baseList =
    tab === "fav" ? favorites : items;

  const filtered = baseList.filter((item) => {
    const text = (
      item.title +
      item.link
    ).toLowerCase();

    if (
      keyword &&
      !text.includes(keyword.toLowerCase())
    ) {
      return false;
    }

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

    if (
      unreadOnly &&
      readItems.includes(item.link)
    ) {
      return false;
    }

    return true;
  });

  return (
    <div style={styles.page}>
      {/* タイトル */}
      <h1 style={styles.title}>
        CHOCO 🌿 SPOT
      </h1>

      {/* タブ */}
      <div style={styles.tabRow}>
        <button
          onClick={() => setTab("all")}
          style={tabBtn(tab === "all")}
        >
          新着
        </button>

        <button
          onClick={() => setTab("fav")}
          style={tabBtn(tab === "fav")}
        >
          お気に入り
        </button>
      </div>

      {/* 検索 */}
      <div style={styles.searchRow}>
        <input
          value={keyword}
          onChange={(e) =>
            setKeyword(e.target.value)
          }
          placeholder="検索"
          style={styles.search}
        />

        <select
          value={range}
          onChange={(e) =>
            setRange(Number(e.target.value))
          }
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
            style={filterBtn(
              activeGroups.includes(g)
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {/* 未読のみ */}
      <div style={styles.utilityRow}>
        <button
          onClick={() =>
            setUnreadOnly(!unreadOnly)
          }
          style={utilityBtn(unreadOnly)}
        >
          未読のみ
        </button>

        <button
          onClick={clearRead}
          style={styles.resetBtn}
        >
          既読リセット
        </button>
      </div>

      {/* 件数 */}
      {!loading && (
        <div style={styles.hitText}>
          {filtered.length}件ヒット
        </div>
      )}

      {/* ローディング */}
      {loading && (
        <>
          <div style={styles.loadingText}>
            読み込み中...
          </div>

          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={styles.skeleton}
            />
          ))}
        </>
      )}

      {/* カード */}
      <div style={styles.grid}>
        {!loading &&
          filtered.map((item, i) => {
            const brand = getBrand(item);

            const isFav = favorites.some(
              (f) => f.link === item.link
            );

            const isRead =
              readItems.includes(item.link);

            const isNew =
              (new Date() -
                new Date(item.date)) /
                (1000 * 60 * 60 * 24) <=
              3;

            return (
              <div
                key={i}
                style={styles.card(isRead)}
              >
                {/* NEW */}
                {isNew && (
                  <div style={styles.newBadge}>
                    NEW
                  </div>
                )}

                {/* 既読 */}
                {isRead && (
                  <div style={styles.readBadge}>
                    既読
                  </div>
                )}

                {/* ブランド */}
                {brand && (
                  <div
                    style={{
                      ...styles.brandBadge,
                      background:
                        getBrandColor(brand),
                    }}
                  >
                    {brand}
                  </div>
                )}

                {/* 画像 */}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    markAsRead(item.link)
                  }
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <div style={styles.emojiBox}>
                    {getEmoji(item.title)}
                  </div>
                </a>

                {/* タイトル */}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    markAsRead(item.link)
                  }
                  style={styles.titleLink}
                >
                  <div style={styles.titleText}>
                    {item.title}
                  </div>
                </a>

                {/* 日付 */}
                <div style={styles.metaRow}>
                  {new Date(
                    item.date
                  ).toLocaleDateString()}
                </div>

                {/* お気に入り */}
                <div style={styles.actionRow}>
                  <button
                    onClick={() =>
                      toggleFav(item)
                    }
                    style={styles.favBtn}
                  >
                    {isFav ? "❤️" : "🤍"}
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
    fontSize: 22,
    marginBottom: 14,
    fontWeight: "bold",
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
    padding: 8,
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
    marginBottom: 10,
  },

  utilityRow: {
    display: "flex",
    gap: 6,
    marginBottom: 10,
  },

  hitText: {
    fontSize: 12,
    marginBottom: 12,
    color: "#ddd",
  },

  loadingText: {
    textAlign: "center",
    fontSize: 12,
    marginBottom: 10,
  },

  grid: {
    display: "grid",
    gap: 14,
  },

  card: (isRead) => ({
    background: "#fff",
    color: "#111",
    borderRadius: 14,
    padding: 12,
    position: "relative",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.18)",
    opacity: isRead ? 0.6 : 1,
  }),

  newBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    background: "#ff4757",
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    padding: "4px 8px",
    borderRadius: 8,
    zIndex: 2,
  },

  readBadge: {
    position: "absolute",
    top: 40,
    left: 8,
    background: "#57606f",
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    padding: "4px 8px",
    borderRadius: 8,
    zIndex: 2,
  },

  brandBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    color: "#fff",
    fontSize: 10,
    padding: "3px 7px",
    borderRadius: 6,
    zIndex: 2,
  },

  emojiBox: {
    height: 160,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 42,
    background: "#eef6f6",
    borderRadius: 10,
    marginBottom: 10,
  },

  titleLink: {
    textDecoration: "none",
    color: "#111",
  },

  titleText: {
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 1.5,
    marginBottom: 8,
  },

  metaRow: {
    fontSize: 11,
    color: "#666",
  },

  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 8,
  },

  favBtn: {
    border: "none",
    background: "transparent",
    fontSize: 22,
    cursor: "pointer",
  },

  resetBtn: {
    flex: 1,
    border: "none",
    borderRadius: 10,
    background: "#57606f",
    color: "#fff",
    padding: 8,
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
  padding: 8,
  borderRadius: 10,
  border: "none",
  color: "#fff",
  background: active
    ? "#00c6ff"
    : "#2a2f36",
});

const filterBtn = (active) => ({
  flex: 1,
  padding: 8,
  borderRadius: 10,
  border: "none",
  color: "#fff",
  background: active
    ? "#00c6ff"
    : "#2a2f36",
});

const utilityBtn = (active) => ({
  flex: 1,
  padding: 8,
  borderRadius: 10,
  border: "none",
  color: "#fff",
  background: active
    ? "#00c6ff"
    : "#2a2f36",
});

/* pulse animation */
if (typeof document !== "undefined") {
  const style =
    document.createElement("style");

  style.innerHTML = `
    @keyframes pulse {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 0.5; }
    }
  `;

  document.head.appendChild(style);
}
