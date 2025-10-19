const fetch = require("node-fetch");

const TOKEN = "8300548820:AAFoWpI6MYPptp_mphQjU-yoN_Raq81cpzo";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "Only POST accepted" };
  }

  const body = JSON.parse(event.body || "{}");
  const message = body.message || body.callback_query?.message;
  const chatId = message?.chat?.id;
  const text = body.message?.text || "";
  const callback = body.callback_query?.data;

  // Nếu không có chat ID => bỏ qua
  if (!chatId) return { statusCode: 200, body: "No message" };

  // ======= GỬI MESSAGE =======
  async function sendMessage(text, extra = {}) {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...extra }),
    });
  }

  // ======= GỬI ẢNH / VIDEO =======
  async function sendMedia(endpoint, mediaUrl, caption, type = "photo") {
    await fetch(`${TELEGRAM_API}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        [type]: mediaUrl,
        caption,
        parse_mode: "HTML",
      }),
    });
  }

  // ======= MENU CHÍNH =======
  const menu = {
    inline_keyboard: [
      [
        { text: "💖 Ảnh Gái Xinh", callback_data: "anhgai" },
        { text: "🔥 Ảnh Sexy", callback_data: "anhgaisexy" },
      ],
      [
        { text: "🎬 Video Gái", callback_data: "videogai" },
        { text: "🎬 Video 2D", callback_data: "hentai2d" },
      ],
      [
        { text: "🎬 Video 3D", callback_data: "hentai3d" },
        { text: "🎬 Video Random", callback_data: "videorandom" },
      ],
      [
        { text: "🎮 Reg Garena", callback_data: "regarena" },
        { text: "👑 About Bot", callback_data: "about" },
      ],
      [
        { text: "🕒 Giờ VN", callback_data: "time" },
      ],
    ],
  };

  // ======= LỆNH /START =======
  if (text.startsWith("/start") || text.startsWith("/menu")) {
    await sendMessage(
      `<b>🌸 Xin chào!</b>\nChọn chức năng bạn muốn dùng bên dưới 👇`,
      { reply_markup: menu }
    );
  }

  // ======= CALLBACK TỪ INLINE MENU =======
  if (callback) {
    switch (callback) {
      case "anhgai":
        {
          const res = await fetch("https://api.zeidteam.xyz/images/gai");
          const data = await res.json();
          await sendMedia("sendPhoto", data.data, "💖 Gái xinh cực đẹp!");
        }
        break;
      case "anhgaisexy":
        {
          const res = await fetch("https://api.zeidteam.xyz/images/gaisexy");
          const data = await res.json();
          await sendMedia("sendPhoto", data.data, "🔥 Ảnh sexy cực gắt!");
        }
        break;
      case "videogai":
        {
          const res = await fetch("https://api.zeidteam.xyz/videos/gai");
          const data = await res.json();
          await sendMedia("sendVideo", data.data, "🎬 Video gái dễ thương!", "video");
        }
        break;
      case "hentai2d":
        {
          const res = await fetch("https://api-random-video.netlify.app/api/hentai2d");
          const data = await res.json();
          await sendMedia("sendVideo", data.video || data.url, "🎥 Video Anime 2D!", "video");
        }
        break;
      case "hentai3d":
        {
          const res = await fetch("https://api-random-video.netlify.app/api/hentai3d");
          const data = await res.json();
          await sendMedia("sendVideo", data.video || data.url, "💿 Video Anime 3D!", "video");
        }
        break;
      case "videorandom":
        {
          const res = await fetch("https://api-random-video.netlify.app/api/hentai3dvanguoi");
          const data = await res.json();
          await sendMedia("sendVideo", data.url, "🎥 Video Random!", "video");
        }
        break;
      case "regarena":
        {
          const res = await fetch("https://keyherlyswar.x10.mx/Apidocs/reglq.php");
          const data = await res.json();
          const acc = data.result?.[0];
          await sendMessage(
            `🎮 <b>TÀI KHOẢN GARENA</b>\n👤 ${acc.account}\n🔑 ${acc.password}`,
          );
        }
        break;
      case "about":
        await sendMessage("🤖 Bot Luxury Pro+ v3.0\n💻 Developer: Zhee");
        break;
      case "time":
        const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
        await sendMessage(`⏰ Giờ Việt Nam: <b>${now.toLocaleString()}</b>`);
        break;
    }
  }

  return { statusCode: 200, body: "ok" };
};
