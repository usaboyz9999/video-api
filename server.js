const express = require("express");
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

const app = express();

// كاش لتسريع الأداء
let cacheUrl = null;
let lastFetch = 0;

app.get("/video", async (req, res) => {
  try {
    const videoPage = req.query.url;

    if (!videoPage) {
      return res.json({ success: false, message: "ضع رابط الصفحة" });
    }

    // ⏱️ كاش 5 دقائق
    if (cacheUrl && Date.now() - lastFetch < 5 * 60 * 1000) {
      return res.json({ success: true, url: cacheUrl });
    }

    console.log("فتح المتصفح...");

    const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

    const page = await browser.newPage();

    let m3u8 = null;

    // التقاط طلبات الشبكة
    page.on("request", (request) => {
      const reqUrl = request.url();
      if (reqUrl.includes(".m3u8")) {
        console.log("تم العثور على m3u8:", reqUrl);
        m3u8 = reqUrl;
      }
    });

    console.log("فتح الصفحة...");

    await page.goto(videoPage, {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    // ⏳ انتظار تحميل الفيديو
    await new Promise((r) => setTimeout(r, 8000));

    await browser.close();

    if (m3u8) {
      cacheUrl = m3u8;
      lastFetch = Date.now();

      return res.json({
        success: true,
        url: m3u8,
      });
    }

    res.json({
      success: false,
      message: "لم يتم العثور على m3u8",
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("API شغال ✅");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
