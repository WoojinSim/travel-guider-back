const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

const app = express();

app.get("/API/:element", async (req, res) => {
  const { element } = req.params;
  if (element) {
    await axios
      .get(
        `https://travel.naver.com/overseas/${element}/country/prepare/check?cardId=entrance`
      )
      .then((response) => {
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
      });
  } else {
    res.json({ request: "error" });
  }
});

app.listen(4000, () => {
  console.log("서버가 http://localhost:4000 에서 실행중 입니다.");
});
