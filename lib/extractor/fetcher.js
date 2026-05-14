export const fetchHTML = async (url) => {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  return {
    html: await res.text(),
  };
};
