const url = process.argv[2] ?? "http://localhost:3456/";
const res = await fetch(url, { redirect: "follow" });
const html = await res.text();

const pick = (re) => html.match(re)?.[1] ?? "(not found)";

const result = {
  fetchedUrl: res.url,
  status: res.status,
  title: pick(/<title>([^<]+)<\/title>/),
  description: pick(/name="description" content="([^"]+)"/),
  ogTitle: pick(/property="og:title" content="([^"]+)"/),
  ogImage: pick(/property="og:image" content="([^"]+)"/),
  ogDescription: pick(/property="og:description" content="([^"]+)"/),
  twitterImage: pick(/name="twitter:image" content="([^"]+)"/),
  twitterTitle: pick(/name="twitter:title" content="([^"]+)"/),
  hasOpengraphImageRoute: /opengraph-image/.test(html),
  metaTags: [...html.matchAll(/<meta[^>]+>/g)].map((m) => m[0]).filter((t) =>
    /og:|twitter:|description|title/.test(t)
  ),
};

console.log(JSON.stringify(result, null, 2));
