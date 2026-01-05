// api/welcome.js
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";

let isFontLoaded = false;
const badgeCache = new Map();

async function loadAssets() {
  if (!isFontLoaded) {
    try {
      const fontUrl = "https://github.com/google/fonts/raw/main/ofl/inter/Inter-Bold.ttf";
      const response = await fetch(fontUrl);
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        GlobalFonts.register(buffer, "Inter");
        isFontLoaded = true;
      }
    } catch (e) {
      console.error("Font loading error:", e);
    }
  }
}

async function getBadgeImage(type) {
  if (badgeCache.has(type)) return badgeCache.get(type);
  const badgeUrls = {
    nitro: "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/nitro.png",
    booster: "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/boost1.png",
    staff: "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/staff.png",
    partner: "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/partner.png",
    verified_dev: "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/verifieddeveloper.png",
    early_supporter: "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/earlysupporter.png",
  };
  if (!badgeUrls[type]) return null;
  try {
    const img = await loadImage(badgeUrls[type]);
    badgeCache.set(type, img);
    return img;
  } catch (e) {
    return null;
  }
}

async function handler(req, res) {
  try {
    await loadAssets();
    const q = req.query || {};
    const displayName = q.displayName || q.username || "New Member";
    const avatarUrl = q.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png";
    const serverName = q.serverName || "Discord Server";
    const memberCount = q.memberCount || "1,234";
    const guildTag = q.guildTag || "KING";
    const badges = q.badges ? String(q.badges).split(",").map(b => b.trim()).filter(Boolean) : ["nitro", "booster"];

    const width = 1000;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    const font = isFontLoaded ? "Inter" : "sans-serif";

    // 1. CLEAR CANVAS
    ctx.clearRect(0, 0, width, height);

    // 2. BACKGROUND ELEMENTS (Decorative Shapes for "Mata Manja")
    ctx.save();
    // Glassy Orb 1
    const orb1 = ctx.createRadialGradient(200, 100, 0, 200, 100, 150);
    orb1.addColorStop(0, "rgba(255, 255, 255, 0.1)");
    orb1.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = orb1;
    ctx.beginPath();
    ctx.arc(200, 100, 150, 0, Math.PI * 2);
    ctx.fill();

    // Glassy Orb 2
    const orb2 = ctx.createRadialGradient(800, 300, 0, 800, 300, 200);
    orb2.addColorStop(0, "rgba(255, 255, 255, 0.08)");
    orb2.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = orb2;
    ctx.beginPath();
    ctx.arc(800, 300, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. MAIN CARD
    const cardX = 40;
    const cardY = 40;
    const cardW = width - 80;
    const cardH = height - 80;
    const radius = 50;

    const roundRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // Card Surface - High Clarity Frosted Glass
    ctx.save();
    roundRect(cardX, cardY, cardW, cardH, radius);
    const glass = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
    glass.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    glass.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
    glass.addColorStop(1, "rgba(255, 255, 255, 0.12)");
    ctx.fillStyle = glass;
    ctx.fill();

    // Soft Inner Highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 4. AVATAR SECTION
    const avatarSize = 220;
    const avatarX = 80;
    const avatarY = (height - avatarSize) / 2;

    // Avatar Glow Background
    const avGlow = ctx.createRadialGradient(avatarX + avatarSize/2, avatarY + avatarSize/2, 0, avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 60);
    avGlow.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    avGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = avGlow;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 60, 0, Math.PI * 2);
    ctx.fill();

    try {
      const img = await loadImage(avatarUrl);
      ctx.save();
      roundRect(avatarX, avatarY, avatarSize, avatarSize, 60);
      ctx.clip();
      ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    } catch (e) {
      roundRect(avatarX, avatarY, avatarSize, avatarSize, 60);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fill();
    }

    // Avatar Rim
    roundRect(avatarX, avatarY, avatarSize, avatarSize, 60);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // 5. CONTENT SECTION (Optimized Spacing & Hierarchy)
    const contentX = avatarX + avatarSize + 60;
    const contentY = height / 2;

    // Server Tagline with Line
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = `800 18px ${font}`;
    ctx.letterSpacing = "2px";
    ctx.fillText("SERVER MEMBER JOINED", contentX, contentY - 85);
    
    // Decorative Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.moveTo(contentX, contentY - 70);
    ctx.lineTo(contentX + 150, contentY - 70);
    ctx.stroke();

    // Display Name (Large & Impactful with Auto-scaling)
    ctx.fillStyle = "#FFFFFF";
    let fontSize = 72;
    ctx.font = `bold ${fontSize}px ${font}`;
    
    // Auto-scale font size if name is too long
    const maxWidth = cardW - (avatarSize + 140) - (guildTag ? 150 : 0);
    while (ctx.measureText(displayName).width > maxWidth && fontSize > 32) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px ${font}`;
    }
    
    ctx.textBaseline = "middle";
    ctx.fillText(displayName, contentX, contentY - 10);
    const nameWidth = ctx.measureText(displayName).width;

    // Discord Guild Tag (Integrated)
    if (guildTag) {
      const tagText = guildTag;
      ctx.font = `800 22px ${font}`;
      const tw = ctx.measureText(tagText).width;
      const tx = contentX + nameWidth + 25;
      const ty = contentY - 32;
      const padding = 12;

      roundRect(tx, ty, tw + padding * 2, 40, 12);
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(tagText, tx + padding, ty + 20);
    }

    // Badges Container
    let badgeX = contentX;
    const badgeY = contentY + 45;
    const badgeSize = 36;
    
    // Badge Group Background (Premium Touch)
    const badgeGroupW = badges.length * (badgeSize + 15) + 10;
    if (badges.length > 0) {
        roundRect(badgeX - 10, badgeY - 5, badgeGroupW, badgeSize + 10, 12);
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fill();
    }

    for (const type of badges) {
      const img = await getBadgeImage(type);
      if (img) {
        ctx.drawImage(img, badgeX, badgeY, badgeSize, badgeSize);
        badgeX += badgeSize + 15;
      }
    }

    // Footer Info (Member Count & Server Name)
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = `600 24px ${font}`;
    const footerY = contentY + 110;
    ctx.fillText(`MEMBER #${memberCount}`, contentX, footerY);
    
    const countW = ctx.measureText(`MEMBER #${memberCount}`).width;
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillText(" • ", contentX + countW, footerY);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText(serverName.toUpperCase(), contentX + countW + 25, footerY);

    // Final Output
    const buffer = await canvas.encode("png");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
}

export default handler;
