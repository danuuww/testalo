// api/welcome.js
// Simple glass welcome card (tanpa shape oranye)

// PENTING: pastikan package.json kamu punya dependency:
// "dependencies": { "@napi-rs/canvas": "^0.1.47", ... }
// Kalau belum ada, tambahin lalu redeploy.

const { createCanvas, loadImage } = require('@napi-rs/canvas');

async function handler(req, res) {
  try {
    const q = req.query || {};

    const username =
      (q.username && String(q.username)) || 'New Member';

    const avatarUrl =
      (q.avatarUrl && String(q.avatarUrl)) ||
      'https://cdn.discordapp.com/embed/avatars/0.png';

    const serverName =
      (q.serverName && String(q.serverName)) || 'your server';

    const memberCount =
      (q.memberCount && String(q.memberCount)) || '1';

    const theme = (q.theme && String(q.theme).toLowerCase()) || 'dark';

    // contoh: badges=app,early_supporter,partner
    const badgeList =
      q.badges
        ? String(q.badges)
            .split(',')
            .map(b => b.trim())
            .filter(Boolean)
        : [];

    // tag di bawah display name
    const tag =
      (q.tag && String(q.tag)) ||
      username;

    // ===== Canvas =====
    const width = 900;
    const height = 260;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const isDark = theme === 'dark';

    // Background full
    const bg = ctx.createLinearGradient(0, 0, width, height);
    if (isDark) {
      bg.addColorStop(0, '#020617');
      bg.addColorStop(0.5, '#020617');
      bg.addColorStop(1, '#000000');
    } else {
      bg.addColorStop(0, '#e5f0ff');
      bg.addColorStop(0.5, '#f5f5ff');
      bg.addColorStop(1, '#ffffff');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    function roundRect(x, y, w, h, r) {
      const radius = typeof r === 'number' ? r : 20;
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
      ? 'rgba(15,23,42,0.92)'
      : 'rgba(255,255,255,0.95)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDark
      ? 'rgba(148,163,184,0.45)'
      : 'rgba(148,163,184,0.6)';
    ctx.stroke();

    // Avatar
    const avatarCX = cardX + 80;
    const avatarCY = height / 2;
    const avatarR = 52;

    // glow
    const glow = ctx.createRadialGradient(
      avatarCX,
      avatarCY,
      10,
      avatarCX,
      avatarCY,
      avatarR + 36
    );
    glow.addColorStop(0, 'rgba(96,165,250,0.85)');
    glow.addColorStop(1, 'rgba(15,23,42,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 32, 0, Math.PI * 2);
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
      console.error('avatar load error:', e);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(
        avatarCX - avatarR,
        avatarCY - avatarR,
        avatarR * 2,
        avatarR * 2
      );
    }
    ctx.restore();

    // avatar outline
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 4, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? '#020617' : '#e5e7eb';
    ctx.lineWidth = 6;
    ctx.stroke();

    // status dot
    ctx.beginPath();
    ctx.arc(avatarCX + 38, avatarCY + 40, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = isDark
      ? 'rgba(15,23,42,0.95)'
      : 'rgba(255,255,255,0.95)';
    ctx.stroke();

    // Text
    const textLeft = avatarCX + 80;
    const textTop = cardY + 30;
    const mainColor = isDark ? '#f9fafb' : '#020617';
    const subColor = isDark ? '#9ca3af' : '#4b5563';

    ctx.textBaseline = 'top';

    // "Welcome to ..."
    ctx.font =
      '600 20px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = subColor;
    ctx.fillText(`Welcome to ${serverName}!`, textLeft, textTop);

    // Username
    ctx.font =
      '800 34px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = mainColor;
    const nameY = textTop + 26;
    ctx.fillText(username, textLeft, nameY);
    const nameWidth = ctx.measureText(username).width;

    // Badge style helper
    function badgeStyle(key) {
      switch (key) {
        case 'app':
          return { label: 'APP', bg: '#5865F2', color: '#ffffff' };
        case 'staff':
          return { label: 'Staff', bg: '#f04747', color: '#ffffff' };
        case 'partner':
          return { label: 'Partner', bg: '#3ba55d', color: '#ffffff' };
        case 'early_supporter':
          return { label: 'Early Supporter', bg: '#ffb84d', color: '#1f1300' };
        case 'verified_dev':
          return { label: 'Verified Dev', bg: '#5865F2', color: '#ffffff' };
        case 'mod_programs':
          return { label: 'Moderator', bg: '#57F287', color: '#02140a' };
        default:
          return {
            label: 'Badge',
            bg: 'rgba(148,163,184,0.35)',
            color: '#ffffff'
          };
      }
    }

    // Badges di samping nama
    ctx.font =
      '700 17px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    let badgeX = textLeft + nameWidth + 12;
    const badgeY = nameY + 3;

    badgeList.slice(0, 6).forEach(key => {
      const { label, bg, color } = badgeStyle(key);
      const paddingX = 12;
      const h = 24;
      const textW = ctx.measureText(label).width;
      const w = textW + paddingX * 2;

      roundRect(badgeX, badgeY, w, h, 999);
      ctx.fillStyle = bg;
      ctx.fill();

      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';
      ctx.fillText(label, badgeX + paddingX, badgeY + h / 2);

      badgeX += w + 8;
    });

    // Tag + member #N
    ctx.font =
      '400 17px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = subColor;
    const infoY = nameY + 34;
    const tagText = tag;
    const tagW = ctx.measureText(tagText).width;

    ctx.textBaseline = 'top';
    ctx.fillText(tagText, textLeft, infoY);
    ctx.fillText(
      `• Member #${memberCount}`,
      textLeft + tagW + 12,
      infoY
    );

    // subtitle kecil
    ctx.font =
      '400 15px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = subColor;
    ctx.fillText(
      "We're happy to have you here.",
      textLeft,
      infoY + 24
    );

    // output PNG
    const buffer = await canvas.encode('png');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/png');
    res.end(buffer);
  } catch (err) {
    console.error('welcome error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Error in welcome:\n' + err.stack);
  }
}

module.exports = handler;
exports.default = handler;
