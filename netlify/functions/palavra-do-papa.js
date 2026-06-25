const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async function () {
  try {
    const url = "https://www.google.com/search?q=homilia+de+hoje&sa=X&sca_esv=c05f2014a7a2071a&sxsrf=APpeQntZww-4MJwIDRfCUpMQNxiukXrNAw%3A1782404394990&udm=50&source=lnms&fbs=ABfTbFVyMZGZf1hfvX9uKjN_-G8cxpBkeIeqYwoCbfNVc4vKEwpHWb4GllXaHEISn7pMuLH3CzclHkplG4j4aUtppRGQOz0ie6UWbo87Ze-ghwOn5DXxbUfZO3y-5H4w3j74S6JvUEpbkkeqw90KS_0lIb4HV7yJXmq6n0ki6bUZ5e_9MQVJQZvXcHOA16j-P13VFqp3Tn73R9-9OsceIwxLzw81fZd1sw&aep=1&ntc=1&ved=2ahUKEwjutbzm5aKVAxXYqpUCHfB8B0oQ2J8OegQIFRAD&biw=1280&bih=559&dpr=1.5&mstk=AUtExfA8Kq9bZS2OmR15y7WYvCkCcinNSaZstC05Ap3RnAFnqpPOKE378pzwKrUnhtcf1r2sLSGb1815AMZuROyBwYmalpI1UzvMAPd7EGunvBgs-fGHANZExV8Tzn3PjaRSCpQFS39CzInvzINkmsS7pzYgroEOw1HP6SH8IS85jOMf6CQ7dVOEySuuM3Kc469pDCIpUngFqWi6dZSsahBDT64qLFEAtQQOmXDtYsYSDxTu-eimhCgIet3Kzxkh8645TBodkRNWDJ_PH26oZ6wNJS2BhJds136bRZ9qPGGSvKv8ZwWv7_e9F4vDG0QLV2Im2plLsNbdFbD43w&csuir=1&mtid=ZVU9avS5G6vR1sQP3cu_gQk.html";

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
