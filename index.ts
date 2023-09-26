const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const cors = require("cors");

const app = express();
const PORT = 4000;
app.use(cors({ origin: "*" }));

app.get("/API/:element", async (req, res) => {
  // TODO: 환율 정보 가져온뒤 다시 쏴주는 API 만들어야함!!!

  const { element } = req.params;
  if (element) {
    await axios
      .get(
        `https://travel.naver.com/overseas/${element}/country/prepare/check?cardId=entrance`
      )
      .then((response) => {
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
        console.log(
          `[${hours}:${minutes}:${seconds}][` +
            (req.ip == "::1" ? "LOCALHOST" : req.ip) +
            `] ${element}_데이터 요청 (http://localhost:${PORT}/API/${element})`
        );
        res.json(jsonData);
      });
  } else {
    res.json({ request: "error" });
  }
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행중 입니다.`);
});
