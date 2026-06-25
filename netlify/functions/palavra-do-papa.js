const cheerio = require("cheerio");

exports.handler = async () => {
  try {
    const response = await fetch("https://www.vaticannews.va/pt/palavra-do-dia.html");

    const html = await response.text();
    const $ = cheerio.load(html);

    const titulo = $("h1").first().text().trim();

    const paragrafos = [];

    $("article p, main p").each((i, el) => {
      const texto = $(el).text().trim();
      if (texto.length > 40) {
        paragrafos.push(texto);
      }
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        titulo,
        paragrafos
      })
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: "Erro"
    };
  }
};
