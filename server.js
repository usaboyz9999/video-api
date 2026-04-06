const express = require("express");
const puppeteer = require("puppeteer-core");

const app = express();

app.get("/", (req, res) => {
  res.send("API شغال ✅");
});

app.get("/video", async (req, res) => {
  try {
    const videoPage = req.query.url;

    if (!videoPage) {
      return res.json({ success: false, message: "ضع رابط الصفحة" });
    }

    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();

    // 🧠 تقليد متصفح حقيقي
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9",
    });

    // 🚀 تسريع: منع تحميل الصور والخطوط
    await page.setRequestInterception(true);
    page.on("request", (reqq) => {
      const type = reqq.resourceType();
      if (["image", "font", "stylesheet"].includes(type)) {
        reqq.abort();
      } else {
        reqq.continue();
      }
    });

    let m3u8 = null;

    // 🔥 التقاط كل شيء (request + response)
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes(".m3u8")) {
        console.log("request m3u8:", url);
        m3u8 = url;
      }
    });

    page.on("response", async (response) => {
      try {
        const url = response.url();

        if (url.includes(".m3u8")) {
          console.log("response m3u8:", url);
          m3u8 = url;
        }

        const text = await response.text();
        if (text.includes(".m3u8")) {
          const match = text.match(/https?:\/\/[^"]+\.m3u8[^"]*/);
          if (match) {
            console.log("json m3u8:", match[0]);
            m3u8 = match[0];
          }
        }
      } catch {}
    });

    // فتح الصفحة
    await page.goto(videoPage, {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

    // انتظار
    await new Promise((r) => setTimeout(r, 6000));

    // 🎬 محاولة تشغيل الفيديو
    await page.evaluate(() => {
      const video = document.querySelector("video");
      if (video) {
        video.muted = true;
        video.play().catch(() => {});
      }
    });

    // 🖱️ محاكاة المستخدم
    await page.mouse.move(400, 400);
    await page.mouse.click(400, 400);

    // ⏳ انتظار طويل (مهم جدًا)
    await new Promise((r) => setTimeout(r, 15000));

    await browser.close();

    if (m3u8) {
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

app.listen(3000, () => {
  console.log("Server started");
});
