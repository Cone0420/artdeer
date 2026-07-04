const base = process.argv[2] ?? "http://localhost:3458";

const checks = [
  { name: "home", path: "/" },
  { name: "robots", path: "/robots.txt" },
  { name: "sitemap", path: "/sitemap.xml" },
];

for (const { name, path } of checks) {
  const url = `${base}${path}`;
  const res = await fetch(url);
  const body = await res.text();
  console.log(`\n=== ${name.toUpperCase()} (${res.status}) ${url} ===`);

  if (name === "home") {
    const pick = (re) => body.match(re)?.[1] ?? "(not found)";
    console.log("title:", pick(/<title>([^<]+)<\/title>/));
    console.log("description:", pick(/name="description" content="([^"]+)"/));
    console.log("canonical:", pick(/rel="canonical" href="([^"]+)"/));
    console.log("og:title:", pick(/property="og:title" content="([^"]+)"/));
    console.log("og:image:", pick(/property="og:image" content="([^"]+)"/));
    console.log("twitter:card:", pick(/name="twitter:card" content="([^"]+)"/));
    console.log("twitter:image:", pick(/name="twitter:image" content="([^"]+)"/));
    console.log("favicon.ico:", /href="\/favicon\.ico"/.test(body) ? "yes" : "no");
    const jsonLd = [...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => {
      try {
        const data = JSON.parse(m[1]);
        return data["@type"];
      } catch {
        return "parse-error";
      }
    });
    console.log("JSON-LD types:", jsonLd.join(", ") || "(not found in head)");
    console.log("JSON-LD in head:", body.indexOf('<script type="application/ld+json">') < body.indexOf("</head>") ? "yes" : "no");
  } else {
    console.log(body.slice(0, 500));
  }
}
