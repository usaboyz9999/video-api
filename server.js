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

    // 🔥 التقاط response بدل request
    page.on("response", async (response) => {
      try {
        const url = response.url();

        if (url.includes(".m3u8")) {
          console.log("تم العثور على m3u8:", url);
          m3u8 = url;
        }

        // أحيانًا الرابط يكون داخل JSON
        const text = await response.text();

        if (text.includes(".m3u8")) {
          const match = text.match(/https?:\/\/[^"]+\.m3u8[^"]*/);
          if (match) {
            console.log("تم استخراج m3u8 من response:", match[0]);
            m3u8 = match[0];
          }
        }
      } catch {}
    });

    await page.goto(videoPage, {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    // انتظار
    await new Promise((r) => setTimeout(r, 5000));

    // محاولة تشغيل الفيديو
    await page.evaluate(() => {
      const video = document.querySelector("video");
      if (video) {
        video.muted = true;
        video.play().catch(() => {});
      }
    });

    await page.mouse.click(300, 300);

    // انتظار تحميل الفيديو
    await new Promise((r) => setTimeout(r, 10000));

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
