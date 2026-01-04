import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge'
};

export default function handler(req) {
  const { searchParams } = new URL(req.url);

  const username = searchParams.get('username') || 'New Member';
  const tag = searchParams.get('tag') || username;
  const avatarUrl =
    searchParams.get('avatarUrl') ||
    'https://cdn.discordapp.com/embed/avatars/0.png';
  const serverName = searchParams.get('serverName') || 'your server';
  const memberCount = searchParams.get('memberCount') || '1';
  const theme = (searchParams.get('theme') || 'dark').toLowerCase();

  const badgesParam = searchParams.get('badges') || '';
  const badges = badgesParam
    ? badgesParam.split(',').filter(Boolean)
    : [];

  const isDark = theme === 'dark';

  const bgGradient = isDark
    ? 'linear-gradient(135deg, #050816 0%, #111827 40%, #020617 100%)'
    : 'linear-gradient(135deg, #e0f2fe 0%, #eff6ff 40%, #e5e7eb 100%)';

  const cardBg = isDark
    ? 'rgba(15,23,42,0.8)'
    : 'rgba(255,255,255,0.9)';

  const textMain = isDark ? '#f9fafb' : '#020617';
  const textSub = isDark ? '#9ca3af' : '#4b5563';

  // badge mapping
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
        return { label: 'Badge', bg: 'rgba(255,255,255,0.14)', color: '#ffffff' };
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '430px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: bgGradient,
          padding: '40px'
        }}
      >
        {/* big glass card */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '40px',
            backgroundColor: cardBg,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '40px 60px',
            boxShadow:
              '0 30px 80px rgba(15,23,42,0.8), 0 0 0 1px rgba(148,163,184,0.25)',
            gap: '40px'
          }}
        >
          {/* avatar */}
          <div
            style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'radial-gradient(circle at 30% 0%, rgba(96,165,250,0.7), transparent 55%), radial-gradient(circle at 70% 100%, rgba(56,189,248,0.7), transparent 55%)'
            }}
          >
            <div
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '999px',
                overflow: 'hidden',
                border: '6px solid rgba(15,23,42,0.9)',
                backgroundColor: '#020617'
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt="avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* status dot */}
            <div
              style={{
                position: 'absolute',
                bottom: '18px',
                right: '14px',
                width: '40px',
                height: '40px',
                borderRadius: '999px',
                backgroundColor: '#22c55e',
                border: '6px solid ' + cardBg
              }}
            />
          </div>

          {/* text area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              minWidth: 0
            }}
          >
            <div
              style={{
                fontSize: '30px',
                fontWeight: 600,
                color: textSub,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              Welcome to {serverName}!
            </div>

            {/* name + badges row */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '14px',
                maxWidth: '100%'
              }}
            >
              <span
                style={{
                  fontSize: '46px',
                  fontWeight: 800,
                  color: textMain,
                  letterSpacing: '-0.04em',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {username}
              </span>

              {badges.slice(0, 6).map(key => {
                const { label, bg, color } = badgeStyle(key);
                return (
                  <div
                    key={key}
                    style={{
                      padding: '6px 18px',
                      borderRadius: '999px',
                      backgroundColor: bg,
                      color,
                      fontSize: '22px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      maxWidth: '220px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>

            {/* tag + member count */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
                alignItems: 'center'
              }}
            >
              <span
                style={{
                  fontSize: '24px',
                  color: textSub
                }}
              >
                {tag}
              </span>
              <span
                style={{
                  fontSize: '24px',
                  color: textSub
                }}
              >
                • Member #{memberCount}
              </span>
            </div>

            {/* small subtitle */}
            <div
              style={{
                marginTop: '8px',
                fontSize: '22px',
                color: textSub,
                maxWidth: '90%'
              }}
            >
              We&apos;re happy to have you here. Make yourself at home!
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 430
    }
  );
}
