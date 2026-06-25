const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async function () {
  try {
    const url = "https://www.vaticannews.va/pt.html";

    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);

    $("script, style, nav, footer, header, aside").remove();

    let raw = [];

    $("h1, h2, h3, p, article, main").each((i, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();

      if (text.length > 2) raw.push(text);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        url,
        raw: raw.join("\n")
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };
  }
};
