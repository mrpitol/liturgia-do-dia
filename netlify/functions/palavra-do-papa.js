const cheerio = require("cheerio");

exports.handler = async () => {
  try {
    const res = await fetch("https://www.paulus.com.br/portal/liturgia-diaria/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9"
      }
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    // Título
    const titulo = $("h1").first().text().trim() || "Palavra do Papa";

    // Extrair parágrafos de forma mais agressiva
    let paragrafos = [];

    // Tenta várias estruturas comuns
    const selectors = [
      "article p",
      ".article__body p",
      "main p",
      ".content p",
      "section p",
      "div[class*='article'] p",
      "div[class*='content'] p"
    ];

    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const texto = $(el).text().trim();
        if (texto.length > 40 && !paragrafos.includes(texto)) {
          paragrafos.push(texto);
        }
      });
      if (paragrafos.length > 0) break;
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
        paragrafos: paragrafos.length > 0 
          ? paragrafos 
          : ["Não foi possível extrair o texto no momento."]
      })
    };

  } catch (error) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        titulo: "Palavra do Papa",
        paragrafos: ["Erro ao carregar a Palavra do Papa."]
      })
    };
  }
};
