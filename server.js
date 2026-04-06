const express = require("express");

const app = express();

// 🧠 تخزين الرابط الحالي
let currentM3U8 = "ضع_هنا_رابط_m3u8";

// 🧠 تخزين آخر رابط شغال
let lastWorking = currentM3U8;

// ✅ جلب الفيديو
app.get("/get-video", (req, res) => {
  if (currentM3U8) {
    return res.json({
      success: true,
      url: currentM3U8,
    });
  }

  // fallback
  if (lastWorking) {
    return res.json({
      success: true,
      url: lastWorking,
    });
  }

  res.json({
    success: false,
  });
});

// 🔄 تحديث الرابط يدوي
app.get("/update", (req, res) => {
  const newUrl = req.query.url;

  if (!newUrl) {
    return res.json({ success: false, message: "ضع رابط" });
  }

  currentM3U8 = newUrl;
  lastWorking = newUrl;

  res.json({
    success: true,
    message: "تم التحديث",
  });
});

// 🧠 اختبار الرابط
app.get("/check", async (req, res) => {
  try {
    const response = await fetch(currentM3U8);

    if (response.ok) {
      lastWorking = currentM3U8;
      return res.json({ success: true, working: true });
    } else {
      return res.json({ success: false, working: false });
    }
  } catch {
    return res.json({ success: false, working: false });
  }
});

app.listen(3000, () => {
  console.log("Smart system running 🚀");
});
