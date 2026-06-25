const cheerio = require("cheerio");

exports.handler = async () => {
  try {
    const response = await fetch(
      "https://www.vaticannews.va/pt/palavra-do-dia.html",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"
        }
      }
    );

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove elementos desnecessários
    $("script, style, noscript, nav, footer, .cookie, .newsletter").remove();

    // Tenta pegar o título
    let titulo =
      $("h1").first().text().trim() ||
      $(".article__title").first().text().trim() ||
      "Palavra do Papa";

    // Tenta extrair parágrafos de várias formas
    let paragrafos = [];

    // Tentativa 1: article
    $("article p").each((_, el) => {
      const texto = $(el).text().trim();
      if (texto.length > 50) paragrafos.push(texto);
    });

    // Tentativa 2: .article__body
    if (paragrafos.length === 0) {
      $(".article__body p").each((_, el) => {
        const texto = $(el).text().trim();
        if (texto.length > 50) paragrafos.push(texto);
      });
    }

    // Tentativa 3: main
    if (paragrafos.length === 0) {
      $("main p").each((_, el) => {
        const texto = $(el).text().trim();
        if (texto.length > 50) paragrafos.push(texto);
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        titulo,
        paragrafos,
        fonte: "https://www.vaticannews.va/pt/palavra-do-dia.html"
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: false,
        message: error.message
      })
    };
  }
};
