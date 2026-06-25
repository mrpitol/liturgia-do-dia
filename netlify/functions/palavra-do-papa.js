const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeRaw(url) {
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(data);

  // remove lixo estrutural
  $("script, style, nav, footer, header, aside").remove();

  let output = [];

  // captura tudo que é texto útil
  $("h1, h2, h3, p, article, main, section").each((i, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();

    if (text && text.length > 2) {
      output.push(text);
    }
  });

  return {
    url,
    raw: output.join("\n")
  };
}
