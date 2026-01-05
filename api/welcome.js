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
    const guildTag = q.guildTag ?? "BLUU";
    const badges = q.badges ? String(q.badges).split(",").map(b => b.trim()).filter(Boolean) : ["nitro", "booster"];

    const width = 1000;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    
    // PENTING: Gunakan font Inter jika sudah terload, jika tidak gunakan sans-serif
    // Font name di ctx.font harus MATCH dengan name di GlobalFonts.register
    const fontName = isFontLoaded ? "Inter" : "sans-serif";

    ctx.clearRect(0, 0, width, height);

    // Decorative shapes
    ctx.save();
    const orb1 = ctx.createRadialGradient(200, 100, 0, 200, 100, 150);
    orb1.addColorStop(0, "rgba(255, 255, 255, 0.1)");
    orb1.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = orb1;
    ctx.beginPath();
    ctx.arc(200, 100, 150, 0, Math.PI * 2);
    ctx.fill();

    const orb2 = ctx.createRadialGradient(800, 300, 0, 800, 300, 200);
    orb2.addColorStop(0, "rgba(255, 255, 255, 0.08)");
    orb2.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = orb2;
    ctx.beginPath();
    ctx.arc(800, 300, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

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

    roundRect(cardX, cardY, cardW, cardH, radius);
    const glass = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
    glass.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    glass.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
    glass.addColorStop(1, "rgba(255, 255, 255, 0.12)");
    ctx.fillStyle = glass;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const avatarSize = 220;
    const avatarX = 80;
    const avatarY = (height - avatarSize) / 2;

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

    roundRect(avatarX, avatarY, avatarSize, avatarSize, 60);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 4;
    ctx.stroke();

    const contentX = avatarX + avatarSize + 60;
    const contentY = height / 2;

    // Server Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = `800 18px ${fontName}`;
    ctx.fillText("SERVER MEMBER JOINED", contentX, contentY - 85);

    // Display Name with scaling
    ctx.fillStyle = "#FFFFFF";
    let fontSize = 72;
    ctx.font = `bold ${fontSize}px ${fontName}`;
    const nameAreaWidth = cardW - (avatarSize + 140) - (guildTag ? 150 : 0);
    while (ctx.measureText(displayName).width > nameAreaWidth && fontSize > 24) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px ${fontName}`;
    }
    ctx.textBaseline = "middle";
    ctx.fillText(displayName, contentX, contentY - 10);
    const actualNameWidth = ctx.measureText(displayName).width;

    // Guild Tag
    if (guildTag) {
      const tagText = guildTag;
      ctx.font = `800 22px ${fontName}`;
      const tw = ctx.measureText(tagText).width;
      const tx = contentX + actualNameWidth + 25;
      const ty = contentY - 32;
      roundRect(tx, ty, tw + 24, 40, 12);
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(tagText, tx + 12, ty + 20);
    }

    // Badges
    let badgeX = contentX;
    const badgeY = contentY + 45;
    const badgeSize = 36;
    for (const type of badges) {
      const img = await getBadgeImage(type);
      if (img) {
        ctx.drawImage(img, badgeX, badgeY, badgeSize, badgeSize);
        badgeX += badgeSize + 15;
      }
    }

    // Footer
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = `600 24px ${fontName}`;
    const footerY = contentY + 110;
    ctx.fillText(`MEMBER #${memberCount}  •  ${serverName.toUpperCase()}`, contentX, footerY);

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
