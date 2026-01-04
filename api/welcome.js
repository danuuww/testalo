// api/welcome.js
// Dynamic glass card – compact Apple style, no background, flexible badges

const { createCanvas, loadImage } = require("@napi-rs/canvas");

async function handler(req, res) {
  try {
    const q = req.query || {};

    const username = (q.username && String(q.username)) || "New Member";
    const displayName = (q.displayName && String(q.displayName)) || username;
    const avatarUrl =
      (q.avatarUrl && String(q.avatarUrl)) ||
      "https://cdn.discordapp.com/embed/avatars/0.png";
    const serverName = (q.serverName && String(q.serverName)) || "your server";
    const memberCount = (q.memberCount && String(q.memberCount)) || "1";
    const theme = (q.theme && String(q.theme).toLowerCase()) || "dark";

    // Badges: app,staff,partner,early_supporter,verified_dev,mod_programs,hypesquad,etc.
    const badgeList = q.badges
      ? String(q.badges)
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean)
      : [];

    // Guild tag (server role/tag badge kecil)
    const guildTag = q.guildTag ? String(q.guildTag).trim() : "";

    const tag = (q.tag && String(q.tag)) || `@${username}`;

    // ===== Canvas Setup =====
    const width = 900;
    const height = 260;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    const isDark = theme === "dark";

    // TRANSPARENT BACKGROUND – no colored background
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

    // ===== Glass Card =====
    const cardX = 24;
    const cardY = 24;
    const cardW = width - 48;
    const cardH = height - 48;
    const radius = 32;

    roundRect(cardX, cardY, cardW, cardH, radius);

    // Glass effect with strong contrast for text visibility
    const glassGradient = ctx.createLinearGradient(
      cardX,
      cardY,
      cardX,
      cardY + cardH
    );
    if (isDark) {
      glassGradient.addColorStop(0, "rgba(15, 23, 42, 0.98)");
      glassGradient.addColorStop(1, "rgba(30, 41, 59, 0.96)");
    } else {
      glassGradient.addColorStop(0, "rgba(255, 255, 255, 0.98)");
      glassGradient.addColorStop(1, "rgba(248, 250, 252, 0.96)");
    }
    ctx.fillStyle = glassGradient;
    ctx.fill();

    // Border with subtle glow
    ctx.lineWidth = 2;
    ctx.strokeStyle = isDark
      ? "rgba(100, 116, 139, 0.5)"
      : "rgba(203, 213, 225, 0.8)";
    ctx.stroke();

    // Inner highlight (Apple style)
    ctx.save();
    roundRect(cardX + 1, cardY + 1, cardW - 2, cardH - 2, radius - 1);
    ctx.strokeStyle = isDark
      ? "rgba(148, 163, 184, 0.15)"
      : "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // ===== Avatar =====
    const avatarCX = cardX + 76;
    const avatarCY = height / 2;
    const avatarR = 50;

    // Subtle glow
    const glow = ctx.createRadialGradient(
      avatarCX,
      avatarCY,
      0,
      avatarCX,
      avatarCY,
      avatarR + 24
    );
    glow.addColorStop(0, isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 24, 0, Math.PI * 2);
    ctx.fill();

    // Avatar circle
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
      ctx.fillStyle = isDark ? "#1e293b" : "#e2e8f0";
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
    ctx.arc(avatarCX, avatarCY, avatarR + 3, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? "rgba(15, 23, 42, 0.98)" : "rgba(255, 255, 255, 0.98)";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Status indicator
    ctx.beginPath();
    ctx.arc(avatarCX + 36, avatarCY + 38, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = isDark ? "rgba(15, 23, 42, 0.98)" : "rgba(255, 255, 255, 0.98)";
    ctx.stroke();

    // ===== Text Content =====
    const textLeft = avatarCX + 84;
    const mainColor = isDark ? "#f8fafc" : "#0f172a";
    const subColor = isDark ? "#cbd5e1" : "#475569";

    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // Welcome text
    ctx.font = "600 19px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
    ctx.fillStyle = subColor;
    ctx.fillText(`Welcome to ${serverName}!`, textLeft, cardY + 28);

    // Display name
    ctx.font = "800 34px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
    ctx.fillStyle = mainColor;
    const nameY = cardY + 58;
    ctx.fillText(displayName, textLeft, nameY);
    const nameWidth = ctx.measureText(displayName).width;

    // ===== Badge System =====
    function getBadgeStyle(key) {
      const styles = {
        app: { label: "APP", bg: "#5865F2", color: "#ffffff" },
        staff: { label: "STAFF", bg: "#f04747", color: "#ffffff" },
        partner: { label: "PARTNER", bg: "#3ba55d", color: "#ffffff" },
        early_supporter: { label: "EARLY", bg: "#ffb84d", color: "#1f1300" },
        verified_dev: { label: "DEV", bg: "#5865F2", color: "#ffffff" },
        mod_programs: { label: "MOD", bg: "#57F287", color: "#02140a" },
        hypesquad: { label: "HYPESQUAD", bg: "#f47fff", color: "#ffffff" },
        bug_hunter: { label: "BUG", bg: "#3ba55d", color: "#ffffff" },
        premium: { label: "NITRO", bg: "#ff73fa", color: "#ffffff" },
      };
      return styles[key] || { label: key.toUpperCase().slice(0, 6), bg: "rgba(148, 163, 184, 0.4)", color: "#ffffff" };
    }

    // Render badges next to name
    ctx.font = "700 14px -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
    ctx.textBaseline = "middle";

    let badgeX = textLeft + nameWidth + 12;
    const badgeY = nameY + 17;
    const maxBadgeWidth = cardX + cardW - badgeX - 20;
    let currentWidth = 0;

    badgeList.forEach((key) => {
      const { label, bg, color } = getBadgeStyle(key);
      const paddingX = 9;
      const h = 22;
      const textW = ctx.measureText(label).width;
      const w = textW + paddingX * 2;

      // Check if badge fits
      if (currentWidth + w > maxBadgeWidth) return;

      roundRect(badgeX, badgeY - h / 2, w, h, 11);
      ctx.fillStyle = bg;
      ctx.fill();

      ctx.fillStyle = color;
      ctx.fillText(label, badgeX + paddingX, badgeY);

      badgeX += w + 7;
      currentWidth += w + 7;
    });

    // ===== Tag + Guild Tag + Member Count =====
    ctx.textBaseline = "top";
    ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
    ctx.fillStyle = subColor;

    const infoY = nameY + 44;
    let infoX = textLeft;

    // Username tag
    ctx.fillText(tag, infoX, infoY);
    infoX += ctx.measureText(tag).width;

    // Guild tag (if exists)
    if (guildTag) {
      const guildPadX = 8;
      const guildH = 20;
      const guildText = guildTag.toUpperCase().slice(0, 12);
      const guildW = ctx.measureText(guildText).width + guildPadX * 2;

      infoX += 10;
      roundRect(infoX, infoY - 1, guildW, guildH, 10);
      ctx.fillStyle = isDark ? "rgba(88, 101, 242, 0.25)" : "rgba(88, 101, 242, 0.15)";
      ctx.fill();

      ctx.fillStyle = isDark ? "#818cf8" : "#5865F2";
      ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(guildText, infoX + guildPadX, infoY + guildH / 2);

      ctx.textBaseline = "top";
      ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
      ctx.fillStyle = subColor;
      infoX += guildW;
    }

    // Member count
    ctx.fillText(` • Member #${memberCount}`, infoX + 4, infoY);

    // Subtitle
    ctx.font = "400 15px -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
    ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
    ctx.fillText("We're happy to have you here.", textLeft, infoY + 26);

    // ===== Output PNG =====
    const buffer = await canvas.encode("png");
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.end(buffer);
  } catch (err) {
    console.error("Welcome error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Error in welcome:\n" + err.stack);
  }
}

module.exports = handler;
exports.default = handler;
