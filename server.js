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

    let m3u8 = null;

    // التقاط أي طلب m3u8
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes(".m3u8")) {
        console.log("تم العثور على m3u8:", url);
        m3u8 = url;
      }
    });

    // فتح الصفحة
    await page.goto(videoPage, {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    // انتظار تحميل الصفحة
    await new Promise((r) => setTimeout(r, 5000));

    // محاولة الضغط على زر تشغيل
    try {
      await page.click("button");
      console.log("تم الضغط على زر");
    } catch (e) {
      console.log("لم يتم العثور على زر");
    }

    // تحريك الماوس + الضغط
    await page.mouse.move(300, 300);
    await page.mouse.click(300, 300);

    // تشغيل الفيديو يدويًا
    await page.evaluate(() => {
      const video = document.querySelector("video");
      if (video) {
        video.muted = true;
        video.play().catch(() => {});
      }
    });

    // انتظار تحميل الفيديو
    await new Promise((r) => setTimeout(r, 8000));

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
  console.log("Server started on port 3000");
});
