import { useEffect, useState } from "react";

export default function Home() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const run = async () => {
      const data = await fetch("/api/news").then((r) => r.json());
      setItems(data);
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

  const isNew = (date) => {
    const diff =
      (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
    return diff < 2;
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🍫 mint product intel</h1>

      <div style={styles.grid}>
        {items.map((item, i) => {
          const brand = getBrand(item.title + item.link);

          return (
            <div key={i} style={styles.card}>

              {/* バッジ */}
              {isNew(item.date) && (
                <div style={styles.badgeNew}>NEW</div>
              )}
              {brand && (
                <div style={styles.badgeBrand}>{brand}</div>
              )}

              {/* ヘッダー */}
              <div style={styles.header}>
                <span style={styles.emoji}>
                  {getEmoji(item.title)}
                </span>

                <div style={styles.date}>
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>

              {/* タイトル */}
              <div style={styles.titleText}>
                {item.title}
              </div>

              {/* アクション */}
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

/* ■ styles（強化版UI復元） */

const styles = {
  page: {
    padding: 14,
    maxWidth: 560,
    margin: "0 auto",
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,#0f2027,#203a43,#2c5364)",
    color: "#fff",
    fontFamily: "sans-serif",
  },

  title: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 14,
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
    marginBottom: 6,
    fontSize: 12,
    color: "#666",
  },

  emoji: {
    fontSize: 20,
  },

  date: {
    fontSize: 11,
  },

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
    color: "#fff",
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: 6,
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
};
