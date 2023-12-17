const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const cors = require("cors");
const chalk = require("chalk");
require("dotenv").config();

const app = express();
const PORT = 4000;
app.use(cors({ origin: "*" }));

const getNow = () => {
  var returnString = "";
  const now = new Date();
  returnString += now.getHours().toString().padStart(2, "0"); // 시
  returnString += ":";
  returnString += now.getMinutes().toString().padStart(2, "0"); // 분
  returnString += ":";
  returnString += now.getSeconds().toString().padStart(2, "0"); // 초
  return returnString;
};

app.get("/:apiType/:element", async (req, res) => {
  const { apiType, element } = req.params;
  if (apiType === "API" && element) {
    try {
      await axios.get(`https://travel.naver.com/overseas/${element}/country/prepare/check?cardId=entrance`).then((response) => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0"); // 시
        const minutes = now.getMinutes().toString().padStart(2, "0"); // 분
        const seconds = now.getSeconds().toString().padStart(2, "0"); // 초

        const htmlString = response.data;
        // const htmlString = iconv.decode(response.data, "EUC-KR").toString()
        const $ = cheerio.load(htmlString);
        const data = $("body").text();
        const jsonDataRaw = JSON.parse(data);
        const jsonData = {
          ...jsonDataRaw.props.pageProps.pageData[0].geoInfo,
          ...jsonDataRaw.props.pageProps.commonInfo.geoInfo,
        };
        res.json(jsonData);
        console.log(
          chalk.blue(`[${getNow()}]`) +
            chalk.green(`[${req.ip == "::1" ? "LOCALHOST" : req.ip}]`) +
            ` ${element}_데이터 요청 (http://localhost:${PORT}/API/${element})`
        );
      });
    } catch (e) {
      console.log(chalk.blue(`[${getNow()}]`) + chalk.red(`[ERROR]`) + ` ${e.message}`);
      res.json({ request: "error", msg: e.message });
    }
  } else if (apiType === "EXCHANGE") {
    var DATE_STRING = "";
    const now = new Date();
    DATE_STRING += now.getFullYear();
    DATE_STRING += (now.getMonth() + 1).toString().padStart(2, "0");
    DATE_STRING += now.getDate().toString().padStart(2, "0");

    /*
     한국수출입은행의 현재환율 API에서 실시간 데이터를 받아와야 하지만 20231217일자 이후 날짜서부터 원인모를 문제로 데이터가 넘어오지 않음
     임시로 20231215 날짜로 고정.
     */
    DATE_STRING = "20231215";

    try {
      await axios
        .get(
          `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${process.env.KOREAN_BANK_API_KEY}&searchdate=${DATE_STRING}&data=AP01`
        )
        .then((response) => {
          res.json(response.data);
          console.log(
            chalk.blue(`[${getNow()}]`) +
              chalk.green(`[${req.ip == "::1" ? "LOCALHOST" : req.ip}]`) +
              ` 환율 데이터 요청 (http://localhost:${PORT}/EXCHANGE) (${DATE_STRING})`
          );
        });
    } catch (e) {
      console.log(chalk.blue(`[${getNow()}]`) + chalk.red(`[ERROR]`) + ` ${e.message}`);
      res.json({ request: "error", msg: e.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(chalk.yellow(`* * *\n\n[${getNow()}] 서버가 http://localhost:${PORT} 에서 실행됩니다.\n\n* * *`));
});
