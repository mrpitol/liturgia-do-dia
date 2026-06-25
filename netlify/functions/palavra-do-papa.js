const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async function () {
  try {
    // URL da página da homilia (AJUSTAR)
    const url = "https://www.vatican.va/content/vatican/pt.html";

    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    // Ajustar seletores reais após inspeção da página
    const titulo = $("h1").first().text().trim();
    const texto = $("div.content").text().trim();

    return {
      statusCode: 200,
      body: JSON.stringify({
        titulo,
        homilia: texto,
        fonte: url
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Erro ao buscar homilia",
        details: err.message
      })
    };
  }
};
