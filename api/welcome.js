// api/welcome.js
// PURE TRANSPARENT - Only glass card visible

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

    const badgeList = q.badges
      ? String(q.badges)
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean)
      : [];

    const guildTag = q.guildTag ? String(q.guildTag).trim() : "";

    // Canvas
    const width = 1000;
    const height = 300;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    const isDark = theme === "dark";

    // ===== PENTING: TRANSPARENT BACKGROUND =====
    // Jangan pakai fillRect atau apapun di sini!

    // Helper
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

    // Glass card ONLY
    const cardX = 20;
    const cardY = 20;
    const cardW = width - 40;
    const cardH = height - 40;
    const radius = 36;

    // Draw glass card dengan backdrop blur effect
    roundRect(cardX, cardY, cardW, cardH, radius);

    // Glass gradient
    const glassGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    if (isDark) {
      glassGrad.addColorStop(0, "rgba(30, 41, 59, 0.92)");
      glassGrad.addColorStop(1, "rgba(15, 23, 42, 0.88)");
    } else {
      glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.92)");
      glassGrad.addColorStop(1, "rgba(248, 250, 252, 0.88)");
    }
    ctx.fillStyle = glassGrad;
    ctx.fill();

    // Border
    ctx.strokeStyle = isDark
      ? "rgba(148, 163, 184, 0.4)"
      : "rgba(203, 213, 225, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner highlight (glassmorphism effect)
    ctx.save();
    roundRect(cardX + 2, cardY + 2, cardW - 4, cardH - 4, radius - 2);
    ctx.strokeStyle = isDark
      ? "rgba(241, 245, 249, 0.1)"
      : "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Avatar
    const avatarCX = cardX + 90;
    const avatarCY = height / 2;
    const avatarR = 60;

    // Glow
    const glow = ctx.createRadialGradient(avatarCX, avatarCY, 0, avatarCX, avatarCY, avatarR + 28);
    glow.addColorStop(0, "rgba(99, 102, 241, 0.4)");
    glow.addColorStop(1, "rgba(99, 102, 241, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 28, 0, Math.PI * 2);
    ctx.fill();

    // Avatar background
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? "#475569" : "#cbd5e1";
    ctx.fill();

    // Load avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    try {
      const img = await loadImage(avatarUrl);
      ctx.drawImage(img, avatarCX - avatarR, avatarCY - avatarR, avatarR * 2, avatarR * 2);
    } catch (e) {
      // Fallback: initial letter
      ctx.fillStyle = isDark ? "#64748b" : "#94a3b8";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(displayName.charAt(0).toUpperCase(), avatarCX, avatarCY);
    }
    ctx.restore();

    // Avatar ring
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 4, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 7;
    ctx.stroke();

    // Status dot
    ctx.beginPath();
    ctx.arc(avatarCX + 44, avatarCY + 46, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();
    ctx.strokeStyle = isDark ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Text area
    const textLeft = avatarCX + 100;
    const mainColor = isDark ? "#f1f5f9" : "#0f172a";
    const subColor = isDark ? "#cbd5e1" : "#475569";

    // Welcome text
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "600 22px Arial, 'Segoe UI', sans-serif";
    ctx.fillStyle = subColor;
    ctx.fillText(`Welcome to ${serverName} server!`, textLeft, cardY + 36);

    // Display name
    const nameToShow = displayName || username;
    ctx.font = "bold 42px Arial, 'Segoe UI', sans-serif";
    ctx.fillStyle = mainColor;
    const nameY = cardY + 72;
    ctx.fillText(nameToShow, textLeft, nameY);
    const nameWidth = ctx.measureText(nameToShow).width;

    // Badges
    function getBadgeStyle(key) {
      const styles = {
        app: { label: "APP", bg: "#5865F2", color: "#fff" },
        staff: { label: "STAFF", bg: "#f04747", color: "#fff" },
        partner: { label: "PARTNER", bg: "#3ba55d", color: "#fff" },
        early_supporter: { label: "EARLY", bg: "#ffb84d", color: "#1a0d00" },
        verified_dev: { label: "DEV", bg: "#5865F2", color: "#fff" },
        mod_programs: { label: "MOD", bg: "#57F287", color: "#0a2e13" },
        hypesquad: { label: "HYPESQUAD", bg: "#f47fff", color: "#fff" },
        bug_hunter: { label: "BUG", bg: "#3ba55d", color: "#fff" },
        nitro: { label: "NITRO", bg: "#ff73fa", color: "#fff" },
        booster: { label: "BOOST", bg: "#f47fff", color: "#fff" },
      };
      return styles[key] || { label: key.toUpperCase().slice(0, 8), bg: "#6b7280", color: "#fff" };
    }

    ctx.font = "bold 16px Arial, 'Segoe UI', sans-serif";
    ctx.textBaseline = "middle";

    let badgeX = textLeft + nameWidth + 14;
    const badgeY = nameY + 21;

    badgeList.slice(0, 6).forEach((key) => {
      const { label, bg, color } = getBadgeStyle(key);
      const pad = 11;
      const h = 26;
      const tw = ctx.measureText(label).width;
      const w = tw + pad * 2;

      roundRect(badgeX, badgeY - h / 2, w, h, 13);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillText(label, badgeX + pad, badgeY);

      badgeX += w + 8;
    });

    // Guild tag + Member count
    ctx.textBaseline = "top";
    const infoY = nameY + 54;
    let infoX = textLeft;

    if (guildTag) {
      ctx.font = "bold 15px Arial, 'Segoe UI', sans-serif";
      const gt = guildTag.slice(0, 15);
      const gtw = ctx.measureText(gt).width + 20;

      roundRect(infoX, infoY - 1, gtw, 24, 12);
      ctx.fillStyle = isDark ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)";
      ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(129, 140, 248, 0.5)" : "rgba(99, 102, 241, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = isDark ? "#c7d2fe" : "#6366f1";
      ctx.textBaseline = "middle";
      ctx.fillText(gt, infoX + 10, infoY + 12);

      infoX += gtw + 12;
      ctx.textBaseline = "top";
    }

    ctx.font = "500 18px Arial, 'Segoe UI', sans-serif";
    ctx.fillStyle = subColor;
    ctx.fillText(`Member #${memberCount}`, infoX, infoY);

    // Subtitle
    ctx.font = "400 17px Arial, 'Segoe UI', sans-serif";
    ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
    ctx.fillText("We're glad you're here!", textLeft, infoY + 32);

    // Output PNG
    const buffer = await canvas.encode("png");
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=120");
    res.end(buffer);
  } catch (err) {
    console.error("Error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("Error: " + err.message);
  }
}

module.exports = handler;
exports.default = handler;
