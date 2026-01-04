// api/welcome.js
const { createCanvas, loadImage } = require('@napi-rs/canvas');

/**
 * Vercel Node.js Serverless Function
 * URL: /api/welcome?username=...&avatarUrl=...&serverName=...&memberCount=...&theme=dark&badges=app,early_supporter&tag=...
 */
module.exports = async (req, res) => {
  try {
    const {
      username = 'New Member',
      avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png',
      serverName = 'your server',
      memberCount = '1',
      theme = 'dark',
      badges = '',
      tag
    } = req.query;

    const badgeList = badges
      ? String(badges)
          .split(',')
          .map(b => b.trim())
          .filter(Boolean)
      : [];

    const finalTag = tag || username;

    const width = 1200;
    const height = 430;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const isDark = String(theme).toLowerCase() === 'dark';

    // ===== Background gradient =====
    const bg = ctx.createLinearGradient(0, 0, width, height);
    if (isDark) {
      bg.addColorStop(0, '#050816');
      bg.addColorStop(0.4, '#111827');
      bg.addColorStop(1, '#020617');
    } else {
      bg.addColorStop(0, '#e0f2fe');
      bg.addColorStop(0.4, '#eff6ff');
      bg.addColorStop(1, '#e5e7eb');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // helper rounded rect
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

    // ===== Big glass card =====
    const cardX = 40;
    const cardY = 40;
    const cardW = width - 80;
    const cardH = height - 80;

    roundRect(cardX, cardY, cardW, cardH, 40);
    ctx.fillStyle = isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.92)';
    ctx.fill();

    // subtle border
    ctx.lineWidth = 2;
    ctx.strokeStyle = isDark
      ? 'rgba(148,163,184,0.35)'
      : 'rgba(148,163,184,0.5)';
    ctx.stroke();

    // ===== Avatar circle =====
    const avatarCX = cardX + 150;
    const avatarCY = height / 2;
    const avatarR = 80;

    // avatar glow
    const glowGradient = ctx.createRadialGradient(
      avatarCX,
      avatarCY - 40,
      10,
      avatarCX,
      avatarCY + 40,
      140
    );
    glowGradient.addColorStop(0, 'rgba(96,165,250,0.7)');
    glowGradient.addColorStop(1, 'rgba(15,23,42,0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 40, 0, Math.PI * 2);
    ctx.fill();

    // avatar mask
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    try {
      const avatarImg = await loadImage(avatarUrl);
      ctx.drawImage(
        avatarImg,
        avatarCX - avatarR,
        avatarCY - avatarR,
        avatarR * 2,
        avatarR * 2
      );
    } catch {
      ctx.fillStyle = '#020617';
      ctx.fillRect(avatarCX - avatarR, avatarCY - avatarR, avatarR * 2, avatarR * 2);
    }

    ctx.restore();

    // avatar ring
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 6, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? '#020617' : '#e5e7eb';
    ctx.lineWidth = 8;
    ctx.stroke();

    // status dot
    ctx.beginPath();
    ctx.arc(avatarCX + 60, avatarCY + 60, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)';
    ctx.stroke();

    // ===== Text area =====
    const textLeft = avatarCX + 120;
    const textTop = cardY + 70;
    const textMain = isDark ? '#f9fafb' : '#020617';
    const textSub = isDark ? '#9ca3af' : '#4b5563';

    // server line
    ctx.font = '600 30px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = textSub;
    ctx.textBaseline = 'top';
    ctx.fillText(`Welcome to ${serverName}!`, textLeft, textTop);

    // username
    ctx.font = '800 52px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = textMain;
    const nameY = textTop + 46;
    ctx.fillText(username, textLeft, nameY);

    const nameWidth = ctx.measureText(username).width;

    // ===== Badges row =====
    function badgeStyle(key) {
      switch (key) {
        case 'app':
          return { label: 'APP', bg: '#5865F2', color: '#ffffff' };
        case 'staff':
          return { label: 'Staff', bg: '#f04747', color: '#ffffff' };
        case 'partner':
          return { label: 'Partner', bg: '#3ba55d', color: '#ffffff' };
        case 'hypesquad_events':
          return { label: 'HypeSquad', bg: '#fbb848', color: '#1f1300' };
        case 'hypesquad_bravery':
        case 'hypesquad_brilliance':
        case 'hypesquad_balance':
          return { label: 'HypeSquad', bg: '#5865F2', color: '#ffffff' };
        case 'bug_hunter_1':
        case 'bug_hunter_2':
          return { label: 'Bug Hunter', bg: '#43b581', color: '#ffffff' };
        case 'early_supporter':
          return { label: 'Early Supporter', bg: '#ffb84d', color: '#1f1300' };
        case 'verified_dev':
          return { label: 'Verified Dev', bg: '#5865F2', color: '#ffffff' };
        case 'mod_programs':
          return { label: 'Moderator', bg: '#57F287', color: '#02140a' };
        default:
          return { label: 'Badge', bg: 'rgba(148,163,184,0.35)', color: '#ffffff' };
      }
    }

    ctx.font = '700 24px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

    let badgeX = textLeft + nameWidth + 20;
    const badgeY = nameY + 6;

    badgeList.slice(0, 6).forEach(key => {
      const { label, bg, color } = badgeStyle(key);
      const paddingX = 18;
      const paddingY = 8;
      const textW = ctx.measureText(label).width;
      const w = textW + paddingX * 2;
      const h = 34;

      roundRect(badgeX, badgeY, w, h, 999);
      ctx.fillStyle = bg;
      ctx.fill();

      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';
      ctx.fillText(label, badgeX + paddingX, badgeY + h / 2);

      badgeX += w + 10;
    });

    // tag + member count
    ctx.font = '400 24px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = textSub;
    ctx.textBaseline = 'top';

    const infoY = nameY + 70;
    const tagText = finalTag;
    const tagWidth = ctx.measureText(tagText).width;

    ctx.fillText(tagText, textLeft, infoY);
    ctx.fillText(`• Member #${memberCount}`, textLeft + tagWidth + 16, infoY);

    // subtitle
    ctx.font = '400 22px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText(
      "We're happy to have you here. Make yourself at home!",
      textLeft,
      infoY + 40
    );

    // output
    const buffer = await canvas.encode('png');
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(buffer);
  } catch (err) {
    console.error('welcome api error:', err);
    res.status(500).json({ error: 'Internal error', message: err.message });
  }
};
