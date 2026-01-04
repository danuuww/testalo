// api/welcome.js
// Transparent dynamic glass card - Apple style welcome banner

const { createCanvas, loadImage } = require("@napi-rs/canvas");

async function handler(req, res) {
  try {
    const q = req.query || {};

    const username = (q.username && String(q.username)) || "NewMember";
    const displayName = (q.displayName && String(q.displayName)) || username;
    const avatarUrl =
      (q.avatarUrl && String(q.avatarUrl)) ||
      "https://cdn.discordapp.com/embed/avatars/0.png";
    const serverName = (q.serverName && String(q.serverName)) || "Alohomora";
    const memberCount = (q.memberCount && String(q.memberCount)) || "1";
    const theme = (q.theme && String(q.theme).toLowerCase()) || "dark";

    // Discord profile badges (opsional)
    const badgeList = q.badges
      ? String(q.badges)
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean)
      : [];

    // Server Guild Tag (fitur baru Discord - opsional)
    const guildTag = q.guildTag ? String(q.guildTag).trim() : "";

    // ===== Canvas Setup (lebih besar) =====
    const width = 1000;
    const height = 300;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    const isDark = theme === "dark";

    // TRANSPARENT BACKGROUND
    ctx.clearRect(0, 0, width, height);

    // Helper: rounded rectangle
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

    // ===== Dynamic Glass Card =====
    const cardX = 20;
    const cardY = 20;
    const cardW = width - 40;
    const cardH = height - 40;
    const radius = 36;

    roundRect(cardX, cardY, cardW, cardH, radius);

    // Glass fill dengan opacity tinggi untuk kontras
    if (isDark) {
      ctx.fillStyle = "rgba(17, 24, 39, 0.95)";
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    }
    ctx.fill();

    // Border glass
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isDark
      ? "rgba(75, 85, 99, 0.6)"
      : "rgba(209, 213, 219, 0.8)";
    ctx.stroke();

    // Inner glow/highlight
    ctx.save();
    roundRect(cardX + 2, cardY + 2, cardW - 4, cardH - 4, radius - 2);
    ctx.strokeStyle = isDark
      ? "rgba(156, 163, 175, 0.2)"
      : "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // ===== Avatar =====
    const avatarCX = cardX + 90;
    const avatarCY = height / 2;
    const avatarR = 60;

    // Glow effect
    const glow = ctx.createRadialGradient(
      avatarCX,
      avatarCY,
      0,
      avatarCX,
      avatarCY,
      avatarR + 32
    );
    glow.addColorStop(0, isDark ? "rgba(99, 102, 241, 0.4)" : "rgba(99, 102, 241, 0.3)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 32, 0, Math.PI * 2);
    ctx.fill();

    // Avatar image
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
      console.error("Avatar load error:", e);
      ctx.fillStyle = isDark ? "#374151" : "#e5e7eb";
      ctx.fillRect(
        avatarCX - avatarR,
        avatarCY - avatarR,
        avatarR * 2,
        avatarR * 2
      );
    }
    ctx.restore();

    // Avatar ring
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 4, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 7;
    ctx.stroke();

    // Status dot (online)
    ctx.beginPath();
    ctx.arc(avatarCX + 44, avatarCY + 46, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = isDark ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)";
    ctx.stroke();

    // ===== Text Content =====
    const textLeft = avatarCX + 100;
    const mainColor = isDark ? "#f9fafb" : "#111827";
    const subColor = isDark ? "#d1d5db" : "#4b5563";

    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // "Welcome to [Server] server!"
    ctx.font = "600 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = subColor;
    ctx.fillText(`Welcome to ${serverName} server!`, textLeft, cardY + 36);

    // Display name / Username (pilih displayName)
    const nameToShow = displayName || username;
    ctx.font = "800 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = mainColor;
    const nameY = cardY + 72;
    ctx.fillText(nameToShow, textLeft, nameY);
    const nameWidth = ctx.measureText(nameToShow).width;

    // ===== Badge System (Discord Profile Badges) =====
    function getBadgeStyle(key) {
      const styles = {
        app: { label: "APP", bg: "#5865F2", color: "#ffffff" },
        staff: { label: "STAFF", bg: "#f04747", color: "#ffffff" },
        partner: { label: "PARTNER", bg: "#3ba55d", color: "#ffffff" },
        early_supporter: { label: "EARLY", bg: "#ffb84d", color: "#1a0d00" },
        verified_dev: { label: "DEV", bg: "#5865F2", color: "#ffffff" },
        mod_programs: { label: "MOD", bg: "#57F287", color: "#0a2e13" },
        hypesquad: { label: "HYPESQUAD", bg: "#f47fff", color: "#ffffff" },
        bug_hunter: { label: "BUG", bg: "#3ba55d", color: "#ffffff" },
        nitro: { label: "NITRO", bg: "#ff73fa", color: "#ffffff" },
        booster: { label: "BOOSTER", bg: "#f47fff", color: "#ffffff" },
      };
      return (
        styles[key] || {
          label: key.toUpperCase().slice(0, 8),
          bg: "rgba(107, 114, 128, 0.5)",
          color: "#ffffff",
        }
      );
    }

    // Render badges di samping nama
    ctx.font = "700 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
    ctx.textBaseline = "middle";

    let badgeX = textLeft + nameWidth + 14;
    const badgeY = nameY + 21;
    const maxBadgeWidth = cardX + cardW - badgeX - 30;
    let currentWidth = 0;

    badgeList.forEach((key) => {
      const { label, bg, color } = getBadgeStyle(key);
      const paddingX = 11;
      const h = 26;
      const textW = ctx.measureText(label).width;
      const w = textW + paddingX * 2;

      // Check if badge fits
      if (currentWidth + w > maxBadgeWidth) return;

      roundRect(badgeX, badgeY - h / 2, w, h, 13);
      ctx.fillStyle = bg;
      ctx.fill();

      ctx.fillStyle = color;
      ctx.fillText(label, badgeX + paddingX, badgeY);

      badgeX += w + 8;
      currentWidth += w + 8;
    });

    // ===== Server Guild Tag + Member Count =====
    ctx.textBaseline = "top";
    ctx.font = "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = subColor;

    const infoY = nameY + 54;
    let infoX = textLeft;

    // Server Guild Tag (jika ada)
    if (guildTag) {
      const guildPadX = 10;
      const guildH = 24;
      const guildText = guildTag.slice(0, 15); // max 15 karakter
      ctx.font = "700 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
      const guildW = ctx.measureText(guildText).width + guildPadX * 2;

      // Guild tag badge
      roundRect(infoX, infoY - 1, guildW, guildH, 12);
      ctx.fillStyle = isDark ? "rgba(88, 101, 242, 0.3)" : "rgba(88, 101, 242, 0.2)";
      ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(99, 102, 241, 0.5)" : "rgba(99, 102, 241, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = isDark ? "#a5b4fc" : "#6366f1";
      ctx.textBaseline = "middle";
      ctx.fillText(guildText, infoX + guildPadX, infoY + guildH / 2);

      infoX += guildW + 12;
      ctx.textBaseline = "top";
    }

    // Member count
    ctx.font = "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = subColor;
    ctx.fillText(`Member #${memberCount}`, infoX, infoY);

    // Subtitle
    ctx.font = "400 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = isDark ? "#9ca3af" : "#6b7280";
    ctx.fillText("We're glad you're here!", textLeft, infoY + 32);

    // ===== Output PNG =====
    const buffer = await canvas.encode("png");
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=120");
    res.end(buffer);
  } catch (err) {
    console.error("Welcome card error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Error generating welcome card:\n" + err.stack);
  }
}

module.exports = handler;
exports.default = handler;
