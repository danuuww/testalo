// api/welcome.js
// Glass welcome card – teks selalu kelihatan, badges opsional

const { createCanvas, loadImage } = require("@napi-rs/canvas");

async function handler(req, res) {
  try {
    const q = req.query || {};

    const username =
      (q.username && String(q.username)) || "New Member";

    const displayName =
      (q.displayName && String(q.displayName)) || username;

    const avatarUrl =
      (q.avatarUrl && String(q.avatarUrl)) ||
      "https://cdn.discordapp.com/embed/avatars/0.png";

    const serverName =
      (q.serverName && String(q.serverName)) || "your server";

    const memberCount =
      (q.memberCount && String(q.memberCount)) || "1";

    const theme =
      (q.theme && String(q.theme).toLowerCase()) || "dark";

    // contoh: badges=app,early_supporter,partner
    const badgeList = q.badges
      ? String(q.badges)
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean)
      : [];

    // tag kecil di bawah display name (opsional)
    const tag =
      (q.tag && String(q.tag)) || `${username}`;

    // ===== Canvas base =====
    const width = 900;
    const height = 260;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    const isDark = theme === "dark";

    // Background full
    const bg = ctx.createLinearGradient(0, 0, width, height);
    if (isDark) {
      bg.addColorStop(0, "#020617");
      bg.addColorStop(0.5, "#020617");
      bg.addColorStop(1, "#000000");
    } else {
      bg.addColorStop(0, "#e5f0ff");
      bg.addColorStop(0.5, "#f5f5ff");
      bg.addColorStop(1, "#ffffff");
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    function roundRect(x, y, w, h, r) {
      const radius = typeof r === "number" ? r : 20;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    // Glass card
    const cardX = 24;
    const cardY = 24;
    const cardW = width - 48;
    const cardH = height - 48;

    roundRect(cardX, cardY, cardW, cardH, 32);
    ctx.fillStyle = isDark
      ? "rgba(15,23,42,0.95)"
      : "rgba(255,255,255,0.98)";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDark
      ? "rgba(148,163,184,0.4)"
      : "rgba(148,163,184,0.6)";
    ctx.stroke();

    // ===== Avatar =====
    const avatarCX = cardX + 80;
    const avatarCY = height / 2;
    const avatarR = 52;

    // glow
    const glow = ctx.createRadialGradient(
      avatarCX,
      avatarCY,
      8,
      avatarCX,
      avatarCY,
      avatarR + 32
    );
    glow.addColorStop(0, "rgba(96,165,250,0.9)");
    glow.addColorStop(1, "rgba(15,23,42,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 30, 0, Math.PI * 2);
    ctx.fill();

    // avatar image
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    try {
      const img = await loadImage(avatarUrl);
      ctx.drawImage(
        img,
        avatarCX - avatarR,
        avatarCY - avatarR,
        avatarR * 2,
        avatarR * 2
      );
    } catch (e) {
      console.error("avatar load error:", e);
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(
        avatarCX - avatarR,
        avatarCY - avatarR,
        avatarR * 2,
        avatarR * 2
      );
    }
    ctx.restore();

    // avatar ring
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 4, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? "#020617" : "#e5e7eb";
    ctx.lineWidth = 6;
    ctx.stroke();

    // status dot
    ctx.beginPath();
    ctx.arc(avatarCX + 38, avatarCY + 40, 11, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = isDark
      ? "rgba(15,23,42,0.95)"
      : "rgba(255,255,255,0.95)";
    ctx.stroke();

    // ===== Text =====
    const mainColor = isDark ? "#f9fafb" : "#020617";
    const subColor = isDark ? "#9ca3af" : "#4b5563";

    const textLeft = avatarCX + 90;

    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // top line
    ctx.font =
      "600 20px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = subColor;
    ctx.fillText(
      `Welcome to ${serverName} server!`,
      textLeft,
      cardY + 26
    );

    // display name (besar)
    ctx.font =
      "800 36px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = mainColor;
    const nameY = cardY + 56;
    ctx.fillText(displayName, textLeft, nameY);
    const nameWidth = ctx.measureText(displayName).width;

    // badge helper
    function badgeStyle(key) {
      switch (key) {
        case "app":
          return { label: "APP", bg: "#5865F2", color: "#ffffff" };
        case "staff":
          return { label: "Staff", bg: "#f04747", color: "#ffffff" };
        case "partner":
          return { label: "Partner", bg: "#3ba55d", color: "#ffffff" };
        case "early_supporter":
          return {
            label: "Early Supporter",
            bg: "#ffb84d",
            color: "#1f1300",
          };
        case "verified_dev":
          return { label: "Verified Dev", bg: "#5865F2", color: "#ffffff" };
        case "mod_programs":
          return { label: "Moderator", bg: "#57F287", color: "#02140a" };
        default:
          return {
            label: "Badge",
            bg: "rgba(148,163,184,0.35)",
            color: "#ffffff",
          };
      }
    }

    // badges di samping nama (kalau ada)
    ctx.font =
      "700 17px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textBaseline = "middle";

    let badgeX = textLeft + nameWidth + 12;
    const badgeY = nameY + 18;

    badgeList.slice(0, 6).forEach((key) => {
      const { label, bg, color } = badgeStyle(key);
      const paddingX = 10;
      const h = 24;
      const textW = ctx.measureText(label).width;
      const w = textW + paddingX * 2;

      roundRect(badgeX, badgeY - h / 2, w, h, 999);
      ctx.fillStyle = bg;
      ctx.fill();

      ctx.fillStyle = color;
      ctx.fillText(label, badgeX + paddingX, badgeY);

      badgeX += w + 8;
    });

    // info line: tag + member #
    ctx.textBaseline = "top";
    ctx.font =
      "400 17px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = subColor;

    const infoY = nameY + 40;
    const tagText = tag;
    const tagWidth = ctx.measureText(tagText).width;

    ctx.fillText(tagText, textLeft, infoY);
    ctx.fillText(
      `• Member #${memberCount}`,
      textLeft + tagWidth + 12,
      infoY
    );

    // subtitle
    ctx.font =
      "400 15px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(
      "We're happy to have you here.",
      textLeft,
      infoY + 24
    );

    // ===== Output PNG =====
    const buffer = await canvas.encode("png");
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.end(buffer);
  } catch (err) {
    console.error("welcome error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Error in welcome:\n" + err.stack);
  }
}

module.exports = handler;
exports.default = handler;
