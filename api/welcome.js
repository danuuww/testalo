const { createCanvas, loadImage } = require('@napi-rs/canvas');
function roundRect(ctx, x, y, width, height, radius) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
module.exports = async (req, res) => {
  try {
    const {
      username = 'New member',
      avatarUrl,
      memberCount,
      serverName = 'Our server',
      theme = 'dark'
    } = req.query;
    const width = 1100;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    const cardX = 80;
    const cardY = 70;
    const cardW = width - 160;
    const cardH = height - 140;
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = theme === 'light'
      ? 'rgba(0,0,0,0.4)'
      : 'rgba(0,0,0,0.9)';
    roundRect(ctx, cardX + 8, cardY + 12, cardW, cardH, 40);
    ctx.fill();
    ctx.restore();
    const glassX = 60;
    const glassY = 50;
    const glassW = width - 120;
    const glassH = height - 100;
    const grad = ctx.createLinearGradient(glassX, glassY, glassX, glassY + glassH);
    if (theme === 'light') {
      grad.addColorStop(0, 'rgba(255,255,255,0.75)');
      grad.addColorStop(1, 'rgba(255,255,255,0.35)');
    } else {
      grad.addColorStop(0, 'rgba(255,255,255,0.35)');
      grad.addColorStop(1, 'rgba(255,255,255,0.10)');
    }
    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    roundRect(ctx, glassX, glassY, glassW, glassH, 40);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.globalAlpha = 0.18;
    const shineGrad = ctx.createLinearGradient(glassX, glassY, glassX + glassW, glassY + glassH);
    shineGrad.addColorStop(0, 'rgba(255,255,255,1)');
    shineGrad.addColorStop(0.4, 'rgba(255,255,255,0)');
    shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shineGrad;
    roundRect(ctx, glassX, glassY, glassW, glassH, 40);
    ctx.fill();
    ctx.restore();
    const avatarRadius = 70;
    const avatarCx = glassX + 140;
    const avatarCy = height / 2;
    if (avatarUrl) {
      try {
        const img = await loadImage(avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarCx, avatarCy, avatarRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(
          img,
          avatarCx - avatarRadius,
          avatarCy - avatarRadius,
          avatarRadius * 2,
          avatarRadius * 2
        );
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(avatarCx, avatarCy, avatarRadius + 4, 0, Math.PI * 2);
        ctx.stroke();
      } catch (e) {
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.arc(avatarCx, avatarCy, avatarRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const titleX = avatarCx + avatarRadius + 60;
    const titleY = glassY + 110;
    ctx.fillStyle = theme === 'light' ? '#111827' : '#F9FAFB';
    ctx.font = '32px sans-serif';
    const serverLabel = `Welcome to ${serverName} server!`;
    ctx.fillText(serverLabel, titleX, titleY);
    ctx.font = '64px sans-serif';
    ctx.fillText(String(username), titleX, titleY + 70);
    if (memberCount) {
      const pillText = `Member #${memberCount}`;
      ctx.font = '26px sans-serif';
      const metrics = ctx.measureText(pillText);
      const pillPaddingX = 24;
      const pillPaddingY = 10;
      const pillWidth = metrics.width + pillPaddingX * 2;
      const pillHeight = 44;
      const pillX = titleX;
      const pillY = titleY + 96;
      ctx.fillStyle = theme === 'light'
        ? 'rgba(15,23,42,0.16)'
        : 'rgba(15,23,42,0.7)';
      roundRect(ctx, pillX, pillY, pillWidth, pillHeight, 999);
      ctx.fill();
      ctx.fillStyle = theme === 'light' ? '#0F172A' : '#F9FAFB';
      ctx.fillText(
        pillText,
        pillX + pillPaddingX,
        pillY + pillHeight / 2 + 8
      );
    }
    const buffer = canvas.toBuffer('image/png');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate image', details: err.message });
  }
};
