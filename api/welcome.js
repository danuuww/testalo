// api/welcome.js
const { createCanvas, loadImage } = require('@napi-rs/canvas');

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

    // ==== canvas lebih compact ====
    const width = 900;
    const height = 280;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const isDark = String(theme).toLowerCase() === 'dark';

    // ==== background gradient ====
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

    // ==== glass card ====
    const cardX = 24;
    const cardY = 24;
    const cardW = width - 48;
    const cardH = height - 48;

    roundRect(cardX, cardY, cardW, cardH, 32);
    ctx.fillStyle = isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDark
      ? 'rgba(148,163,184,0.4)'
      : 'rgba(148,163,184,0.55)';
    ctx.stroke();

    // ==== avatar ====
    const avatarCX = cardX + 90;
    const avatarCY = height / 2;
    const avatarR = 55;

    const glowGradient = ctx.createRadialGradient(
      avatarCX,
      avatarCY - 20,
      5,
      avatarCX,
      avatarCY + 20,
      110
    );
    glowGradient.addColorStop(0, 'rgba(96,165,250,0.7)');
    glowGradient.addColorStop(1, 'rgba(15,23,42,0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 30, 0, Math.PI * 2);
    ctx.fill();

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

    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 5, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? '#020617' : '#e5e7eb';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(avatarCX + 42, avatarCY + 42, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)';
    ctx.stroke();

    // ==== text area ====
    const textLeft = avatarCX + 80;
    const textTop = cardY + 28;
    const textMain = isDark ? '#f9fafb' : '#020617';
    const textSub = isDark ? '#9ca3af' : '#4b5563';

    ctx.font = '600 22px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = textSub;
    ctx.textBaseline = 'top';
    ctx.fillText(`Welcome to ${serverName}!`, textLeft, textTop);

    ctx.font = '800 36px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = textMain;
    const nameY = textTop + 30;
    ctx.fillText(username, textLeft, nameY);

    const nameWidth = ctx.measureText(username).width;

    // ==== badges ====
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

    ctx.font = '700 18px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    let badgeX = textLeft + nameWidth + 14;
    const badgeY = nameY + 3;

    badgeList.slice(0, 6).forEach(key => {
      const { label, bg, color } = badgeStyle(key);
      const paddingX = 14;
      const paddingY = 6;
      const textW = ctx.measureText(label).width;
      const w = textW + paddingX * 2;
      const h = 26;

      roundRect(badgeX, badgeY, w, h, 999);
      ctx.fillStyle = bg;
      ctx.fill();

      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';
      ctx.fillText(label, badgeX + paddingX, badgeY + h / 2);

      badgeX += w + 8;
    });

    // tag + member count
    ctx.font = '400 18px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = textSub;
    ctx.textBaseline = 'top';
    const infoY = nameY + 38;
    const tagText = finalTag;
    const tagWidth = ctx.measureText(tagText).width;

    ctx.fillText(tagText, textLeft, infoY);
    ctx.fillText(`• Member #${memberCount}`, textLeft + tagWidth + 14, infoY);

    ctx.font = '400 16px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText(
      "We're happy to have you here. Make yourself at home!",
      textLeft,
      infoY + 26
    );

    // ==== output PNG ====
    const buffer = await canvas.encode('png');
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(buffer);
  } catch (err) {
    console.error('welcome api error:', err);
    res.status(500).json({ error: 'Internal error', message: err.message });
  }
};
