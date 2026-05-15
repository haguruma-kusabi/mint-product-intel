import { useEffect, useMemo, useState } from "react";

/* =========================
   ■ グループ
========================= */
const GROUPS = {
  コンビニ: ["ローソン", "セブン", "ファミマ"],
  カフェ: ["スタバ", "タリーズ", "ドトール"],
  その他: ["その他"],
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

  if (/(7-?eleven|セブン|セブンイレブン|seven)/.test(text))
    return "セブン";

  if (/(familymart|ファミマ|ファミリーマート)/.test(text))
    return "ファミマ";

  if (
    /(starbucks|スタバ|スターバックス|sbux)/.test(
      text
    )
  )
    return "スタバ";

  if (/(tully'?s|タリーズ|tully)/.test(text))
    return "タリーズ";

  if (/(doutor|ドトール)/.test(text))
    return "ドトール";

  return "その他";
};

/* =========================
   ■ ブランド色
========================= */
const getBrandColor = (brand) => {
  if (brand === "セブン") return "#ff9f43";

  if (brand === "ローソン") return "#2d7ff9";

  if (brand === "ファミマ") return "#2ecc71";

  if (brand === "スタバ") return "#0f9d58";

  if (brand === "タリーズ") return "#b71c1c";

  if (brand === "ドトール") return "#795548";

  return "#666";
};

/* =========================
   ■ 絵文字
========================= */
const getEmoji = (text = "") => {
  if (/アイス/.test(text)) return "🍨";

  if (/スイーツ|ケーキ/.test(text))
    return "🍰";

  if (/ドリンク|フラペチーノ/.test(text))
    return "🥤";

  if (/チョコ/.test(text)) return "🍫";

  return "🍃";
};

export default function Home() {
  const [items, setItems] = useState([]);

  const [favorites, setFavorites] =
    useState([]);

  const [readItems, setReadItems] =
    useState([]);

  const [keyword, setKeyword] =
    useState("");

  const [activeGroups, setActiveGroups] =
    useState([]);

  const [range, setRange] = useState(14);

  const [tab, setTab] = useState("all");

  const [loading, setLoading] =
    useState(true);

  const [unreadOnly, setUnreadOnly] =
    useState(false);

  const [lastUpdated, setLastUpdated] =
    useState("");

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
  }, []);

  /* =========================
     ■ データ取得
  ========================= */
  const fetchData = async () => {
    try {
      const res = await fetch("/api/news");

      const data = await res.json();

      setItems(data);

      const now = new Date();

      setLastUpdated(
        now.toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
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
     ■ 既読
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

  const filtered = useMemo(() => {
    return baseList.filter((item) => {
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
  }, [
    baseList,
    keyword,
    activeGroups,
    range,
    unreadOnly,
    readItems,
  ]);

  /* =========================
     ■ 今日件数
  ========================= */
  const todayCount = items.filter((item) => {
    const diff =
      (new Date() - new Date(item.date)) /
      (1000 * 60 * 60 * 24);

    return diff <= 1;
  }).length;

  return (
    <div style={styles.page}>
      {/* 固定ヘッダー */}
      <div style={styles.sticky}>
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
            お気に入り(
            {favorites.length})
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
              setRange(
                Number(e.target.value)
              )
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
              onClick={() =>
                toggleGroup(g)
              }
              style={filterBtn(
                activeGroups.includes(g)
              )}
            >
              {g}
            </button>
          ))}
        </div>

        {/* ユーティリティ */}
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

        {/* 情報 */}
        {!loading && (
          <>
            <div style={styles.infoRow}>
              <span>
                {filtered.length}件ヒット
              </span>

              <span>
                今日 {todayCount}件
              </span>
            </div>

            <div style={styles.updateText}>
              最終更新 {lastUpdated}
            </div>
          </>
        )}
      </div>

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

      {/* 空状態 */}
      {!loading &&
        filtered.length === 0 && (
          <div style={styles.emptyBox}>
            条件に一致する記事がありません
          </div>
        )}

      {/* カード一覧 */}
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
                <div
                  style={{
                    ...styles.brandBadge,
                    background:
                      getBrandColor(brand),
                  }}
                >
                  {brand}
                </div>

                {/* 絵文字 */}
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

                {/* 下部 */}
                <div style={styles.bottomRow}>
                  <div style={styles.dateText}>
                    {new Date(
                      item.date
                    ).toLocaleDateString()}
                  </div>

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
    height: "100vh",

    overflow: "hidden",

    display: "flex",

    flexDirection: "column",

    padding: "0 16px",

    maxWidth: 520,

    margin: "0 auto",

    background:
      "linear-gradient(180deg,#0f2027,#203a43,#2c5364)",

    color: "#fff",
  },

  sticky: {
    position: "sticky",

    top: 0,

    zIndex: 100,

    paddingTop: 12,

    paddingBottom: 14,

    backdropFilter: "blur(10px)",

    background: "rgba(15,32,39,0.92)",

    flexShrink: 0,
  },

  grid: {
    display: "grid",

    gap: 18,

    overflowY: "auto",

    flex: 1,

    paddingBottom: 140,

    scrollbarWidth: "none",

    msOverflowStyle: "none",
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

    padding: 9,

    borderRadius: 10,

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

    marginBottom: 10,
  },

  utilityRow: {
    display: "flex",

    gap: 6,

    marginBottom: 10,
  },

  infoRow: {
    display: "flex",

    justifyContent: "space-between",

    fontSize: 12,

    color: "#d7e0e5",

    marginBottom: 4,
  },

  updateText: {
    fontSize: 11,

    color: "#a9bac4",

    marginBottom: 6,
  },

  loadingText: {
    textAlign: "center",

    fontSize: 12,

    marginTop: 24,

    marginBottom: 14,
  },

  card: (isRead) => ({
    background: "#fff",

    color: "#111",

    borderRadius: 18,

    padding: 12,

    position: "relative",

    boxShadow:
      "0 6px 16px rgba(0,0,0,0.18)",

    opacity: isRead ? 0.65 : 1,
  }),

  newBadge: {
    position: "absolute",

    top: 8,

    left: 8,

    background: "#ff4757",

    color: "#fff",

    fontSize: 12,

    fontWeight: "bold",

    padding: "5px 9px",

    borderRadius: 9,

    zIndex: 2,

    boxShadow:
      "0 0 10px rgba(255,71,87,0.5)",
  },

  readBadge: {
    position: "absolute",

    top: 44,

    left: 8,

    background: "#57606f",

    color: "#fff",

    fontSize: 11,

    fontWeight: "bold",

    padding: "4px 9px",

    borderRadius: 8,

    zIndex: 2,
  },

  brandBadge: {
    position: "absolute",

    top: 10,

    right: 10,

    color: "#fff",

    fontSize: 10,

    padding: "4px 8px",

    borderRadius: 8,

    zIndex: 2,
  },

  emojiBox: {
    height: 105,

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: 38,

    background: "#eef6f6",

    borderRadius: 12,

    marginBottom: 10,
  },

  titleLink: {
    textDecoration: "none",

    color: "#111",
  },

  titleText: {
    fontSize: 14,

    fontWeight: "bold",

    lineHeight: 1.55,

    marginBottom: 10,
  },

  bottomRow: {
    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    marginTop: 2,
  },

  dateText: {
    fontSize: 11,

    color: "#666",
  },

  favBtn: {
    border: "none",

    background: "transparent",

    fontSize: 20,

    cursor: "pointer",

    padding: 0,

    lineHeight: 1,
  },

  resetBtn: {
    flex: 1,

    border: "none",

    borderRadius: 10,

    background: "#57606f",

    color: "#fff",

    padding: 8,

    fontSize: 12,
  },

  emptyBox: {
    textAlign: "center",

    padding: 24,

    fontSize: 13,

    color: "#d7e0e5",
  },

  skeleton: {
    height: 170,

    borderRadius: 18,

    background: "#ffffff22",

    marginBottom: 10,

    animation: "pulse 1.5s infinite",
  },
};

const tabBtn = (active) => ({
  flex: 1,

  padding: 9,

  borderRadius: 10,

  border: "none",

  color: "#fff",

  fontSize: 12,

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

  fontSize: 12,

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

  fontSize: 12,

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

    div::-webkit-scrollbar {
      display: none;
    }
  `;

  document.head.appendChild(style);
}
