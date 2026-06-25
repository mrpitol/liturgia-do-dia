// netlify/functions/palavra-do-papa.js
const cheerio = require("cheerio");

exports.handler = async () => {
  try {
    const res = await fetch("https://www.vaticannews.va/pt/palavra-do-dia.html", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!res.ok) throw new Error("Erro ao acessar Vatican News");

    const html = await res.text();
    const $ = cheerio.load(html);

    const titulo = $("h1").first().text().trim() || "Palavra do Papa";

    const paragrafos = [];
    $("article p, .article__body p, main p").each((_, el) => {
      const texto = $(el).text().trim();
      if (texto.length > 50) paragrafos.push(texto);
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        titulo,
        paragrafos: paragrafos.length > 0 ? paragrafos : ["Nenhum texto encontrado no momento."]
      })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        titulo: "Palavra do Papa",
        paragrafos: ["Não foi possível carregar a Palavra do Papa no momento."]
      })
    };
  }
};
