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

  return (
    <div style={{ padding: 20 }}>
      <h1>mint-product-intel</h1>

      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div>{item.title}</div>
          <a href={item.link} target="_blank">
            open
          </a>
        </div>
      ))}
    </div>
  );
}
