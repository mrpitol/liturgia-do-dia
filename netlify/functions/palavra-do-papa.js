const fetch = require("node-fetch");
const cheerio = require("cheerio");

exports.handler = async () => {
  try {
    const url = "https://www.vaticannews.va/pt/palavra-do-dia.html";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      throw new Error("Erro ao acessar o site");
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const titulo = $("h1").first().text().trim();

    const paragrafos = [];
    $("article p").each((i, el) => {
      const texto = $(el).text().trim();
      if (texto) paragrafos.push(texto);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        titulo: titulo || "Palavra do dia",
        paragrafos: paragrafos.length ? paragrafos : ["Nenhum texto encontrado"]
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
