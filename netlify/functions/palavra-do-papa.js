const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async () => {
    try {
        const url = "https://www.paulus.com.br/portal/liturgia-diaria/";

        const { data } = await axios.get(url);

        const $ = cheerio.load(data);

        let titulo = "";
        let paragrafos = [];

        // Ajuste baseado na estrutura real do site
        $(".post-content h4, .post-content h3").each((_, el) => {
            const texto = $(el).text().trim();
            if (texto.toLowerCase().includes("reflex")) {
                titulo = texto;
            }
        });

        $(".post-content p").each((_, el) => {
            const texto = $(el).text().trim();

            if (texto.length > 50) {
                paragrafos.push(texto);
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                titulo,
                paragrafos
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                erro: "Erro ao buscar reflexão"
            })
        };
    }
};
