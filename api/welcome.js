// api/welcome.js
// GUARANTEED TEXT RENDERING - Pure transparent glass card
// Fixed for Vercel & Environments without system fonts

const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

// Cache font loading to avoid fetching on every request (if container is reused)
let isFontLoaded = false;

async function loadFonts() {
  if (isFontLoaded) return;
  
  try {
    // Register a default sans-serif font (Inter) to ensure text renders
    // Vercel serverless functions often lack system fonts
    const fontUrl = "https://github.com/google/fonts/raw/main/ofl/inter/Inter-Bold.ttf";
    const response = await fetch(fontUrl);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch font: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    GlobalFonts.register(buffer, "Inter");
    isFontLoaded = true;
    console.log("Font loaded successfully");
  } catch (error) {
    console.error("Font loading error:", error);
    // Fallback: try to register system fonts if possible, though unlikely to work in serverless if missing
    // GlobalFonts.registerFromPath if you had a local file
  }
}

async function handler(req, res) {
  try {
    // Ensure fonts are loaded before drawing
    await loadFonts();

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

    // Glass card
    const cardX = 20;
    const cardY = 20;
    const cardW = width - 40;
    const cardH = height - 40;
    const radius = 36;

    roundRect(cardX, cardY, cardW, cardH, radius);

    // Glass effect
    const glassGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    if (isDark) {
      glassGrad.addColorStop(0, "rgba(30, 41, 59, 0.95)");
      glassGrad.addColorStop(1, "rgba(15, 23, 42, 0.92)");
    } else {
      glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      glassGrad.addColorStop(1, "rgba(248, 250, 252, 0.92)");
    }
    ctx.fillStyle = glassGrad;
    ctx.fill();

    // Border
    ctx.strokeStyle = isDark
      ? "rgba(148, 163, 184, 0.5)"
      : "rgba(203, 213, 225, 0.7)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner highlight
    ctx.save();
    roundRect(cardX + 2, cardY + 2, cardW - 4, cardH - 4, radius - 2);
    ctx.strokeStyle = isDark
      ? "rgba(241, 245, 249, 0.12)"
      : "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Avatar
    const avatarCX = cardX + 90;
    const avatarCY = height / 2;
    const avatarR = 60;

    // Glow
    const glow = ctx.createRadialGradient(avatarCX, avatarCY, 0, avatarCX, avatarCY, avatarR + 28);
    glow.addColorStop(0, "rgba(99, 102, 241, 0.45)");
    glow.addColorStop(1, "rgba(99, 102, 241, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 28, 0, Math.PI * 2);
    ctx.fill();

    // Avatar circle
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
      // Fallback
      ctx.fillStyle = isDark ? "#64748b" : "#94a3b8";
      // Use loaded font if available
      ctx.font = isFontLoaded ? "bold 48px Inter" : "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(displayName.charAt(0).toUpperCase(), avatarCX, avatarCY);
    }
    ctx.restore();

    // Avatar ring
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 4, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 7;
    ctx.stroke();

    // Status
    ctx.beginPath();
    ctx.arc(avatarCX + 44, avatarCY + 46, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();
    ctx.strokeStyle = isDark ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // ===== TEXT RENDERING - FIXED =====
    const textLeft = avatarCX + 100;
    const mainColor = isDark ? "#ffffff" : "#0f172a";
    const subColor = isDark ? "#e2e8f0" : "#475569";

    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // Set font based on availability
    const fontName = isFontLoaded ? "Inter" : "sans-serif";

    // Welcome text
    ctx.font = `600 22px ${fontName}`;
    ctx.fillStyle = subColor;
    const welcomeText = `Welcome to ${serverName} server!`;
    ctx.fillText(welcomeText, textLeft, cardY + 36);

    // Display name - BOLD dan BESAR
    const nameToShow = displayName || username;
    ctx.font = `bold 42px ${fontName}`;
    ctx.fillStyle = mainColor;
    const nameY = cardY + 72;
    ctx.fillText(nameToShow, textLeft, nameY);
    const nameWidth = ctx.measureText(nameToShow).width;

    // Badges
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
        booster: { label: "BOOST", bg: "#f47fff", color: "#ffffff" },
      };
      return styles[key] || { label: key.toUpperCase().slice(0, 8), bg: "#6b7280", color: "#ffffff" };
    }

    ctx.font = `bold 16px ${fontName}`;
    ctx.textBaseline = "middle";

    let badgeX = textLeft + nameWidth + 14;
    const badgeY = nameY + 21;
    const maxBadgeWidth = cardX + cardW - badgeX - 30;
    let currentWidth = 0;

    badgeList.forEach((key) => {
      const { label, bg, color } = getBadgeStyle(key);
      const pad = 11;
      const h = 26;
      const tw = ctx.measureText(label).width;
      const w = tw + pad * 2;

      if (currentWidth + w > maxBadgeWidth) return;

      roundRect(badgeX, badgeY - h / 2, w, h, 13);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillText(label, badgeX + pad, badgeY);

      badgeX += w + 8;
      currentWidth += w + 8;
    });

    // Guild tag + Member
    ctx.textBaseline = "top";
    const infoY = nameY + 54;
    let infoX = textLeft;

    if (guildTag) {
      ctx.font = `bold 15px ${fontName}`;
      const gt = guildTag.slice(0, 15);
      const gtw = ctx.measureText(gt).width + 20;

      roundRect(infoX, infoY - 1, gtw, 24, 12);
      ctx.fillStyle = isDark ? "rgba(99, 102, 241, 0.35)" : "rgba(99, 102, 241, 0.25)";
      ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(129, 140, 248, 0.6)" : "rgba(99, 102, 241, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = isDark ? "#c7d2fe" : "#6366f1";
      ctx.textBaseline = "middle";
      ctx.fillText(gt, infoX + 10, infoY + 12);

      infoX += gtw + 12;
      ctx.textBaseline = "top";
    }

    ctx.font = `500 18px ${fontName}`;
    ctx.fillStyle = subColor;
    ctx.fillText(`Member #${memberCount}`, infoX, infoY);

    // Subtitle
    ctx.font = `400 17px ${fontName}`;
    ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
    ctx.fillText("We're glad you're here!", textLeft, infoY + 32);

    // Output
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
