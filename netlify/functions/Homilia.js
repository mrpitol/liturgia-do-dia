const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async function () {

  try {

    const url = "https://padrepauloricardo.org/liturgia/";

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });


    const $ = cheerio.load(data);


    // remove elementos que não interessam
    $("script, style, nav, footer, header, aside, form, button")
      .remove();


    let blocos = [];


    // captura todo texto relevante
    $("h1, h2, h3, p, article, main, section")
      .each((i, el) => {


        let texto = $(el)
          .text()
          .replace(/\s+/g, " ")
          .trim();


        // elimina lixo e duplicados
        if (
          texto.length > 30 &&
          !blocos.includes(texto)
        ) {

          blocos.push(texto);

        }

      });



    // organização simples

    const resposta = {

      fonte: url,

      titulo:
        blocos.find(x =>
          x.includes("Liturgia")
        ) || "",


      data:
        blocos.find(x =>
          x.includes("Hoje")
        ) || "",


      primeira_leitura:
        pegarBloco(
          blocos,
          2
        ),


      salmo:
        blocos.find(x =>
          x.includes("Senhor")
        ) || "",


      evangelho:
        blocos.find(x =>
          x.includes("Naquele tempo")
        ) || "",


      referencia:
        pegarReferencia(blocos),


      homilia:
        blocos.find(x =>
          x.includes("No Evangelho de hoje")
        ) || "",


      // mantém tudo para IA/filtro depois
      blocos

    };


    return {

      statusCode:200,

      body:JSON.stringify(
        resposta,
        null,
        2
      )

    };


  } catch(err) {


    return {

      statusCode:500,

      body:JSON.stringify({
        erro: err.message
      })

    };

  }

};



// pega bloco por posição
function pegarBloco(lista, posicao){

  return lista[posicao] || "";

}


// extrai referência Mt/Mc/Lc/Jo
function pegarReferencia(blocos){

  const texto = blocos.join(" ");

  const r = texto.match(
    /\((Mt|Mc|Lc|Jo).*?\)/
  );

  return r ? r[0] : "";

}
