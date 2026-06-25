const axios = require("axios");
const cheerio = require("cheerio");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 60 * 60 * 6 }); // 6h

// -----------------------------
// SCRAPERS
// -----------------------------

async function scrapeVaticanNews() {
  const url = "https://www.vaticannews.va/pt.html";

  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(data);

  const article = $("a.teaser__title-link").first();
  const link = article.attr("href");

  if (!link) throw new Error("Vatican News sem link");

  const fullUrl = link.startsWith("http")
    ? link
    : `https://www.vaticannews.va${link}`;

  const page = await axios.get(fullUrl);
  const $$ = cheerio.load(page.data);

  return {
    fonte: "Vatican News",
    titulo: $$("h1").first().text().trim(),
    homilia: $$("article").text().trim(),
    url: fullUrl
  };
}

async function scrapeACI() {
  const url = "https://www.acidigital.com/";

  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(data);

  const link = $("a").filter((i, el) =>
    $(el).text().toLowerCase().includes("homilia")
  ).first().attr("href");

  if (!link) throw new Error("ACI sem homilia");

  const fullUrl = link.startsWith("http")
    ? link
    : `https://www.acidigital.com${link}`;

  const page = await axios.get(fullUrl);
  const $$ = cheerio.load(page.data);

  return {
    fonte: "ACI Digital",
    titulo: $$("h1").first().text().trim(),
    homilia: $$("p").text().trim(),
    url: fullUrl
  };
}

async function scrapeCanacaoNova() {
  const url = "https://liturgia.cancaonova.com/";

  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(data);

  return {
    fonte: "Canção Nova",
    titulo: $("h1").first().text().trim(),
    homilia: $("article").text().trim(),
    url
  };
}

// -----------------------------
// FALLBACK ENGINE
// -----------------------------

async function getHomilia() {
  const sources = [
    scrapeVaticanNews,
    scrapeACI,
    scrapeCanacaoNova
  ];

  let lastError;

  for (const source of sources) {
    try {
      const result = await source();

      if (result?.homilia && result.homilia.length > 200) {
        return result;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Nenhuma fonte disponível");
}

// -----------------------------
// NETLIFY HANDLER
// -----------------------------

exports.handler = async function () {
  try {
    const cacheKey = "homilia_today";

    const cached = cache.get(cacheKey);
    if (cached) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          ...cached,
          cached: true
        })
      };
    }

    const data = await getHomilia();

    cache.set(cacheKey, data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...data,
        cached: false
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Falha ao obter homilia",
        details: err.message
      })
    };
  }
};
