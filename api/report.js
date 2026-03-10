const MAX_FIELD_LENGTH = 1200;
const MAX_MESSAGE_LENGTH = 3900;
const ALLOWED_TARGET_TYPES = new Set(['message', 'user', 'room', 'space']);

const sendJson = (res, statusCode, body) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
};

const trimValue = (value, maxLength = MAX_FIELD_LENGTH) => {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  return trimmed.slice(0, maxLength);
};

const appendLine = (lines, label, value) => {
  if (!value) return;
  lines.push(`${label}: ${value}`);
};

const formatTelegramMessage = (payload, meta) => {
  const lines = ['VChat Report', ''];

  appendLine(lines, 'Target Type', payload.targetType);
  appendLine(lines, 'Reason', payload.reason);
  appendLine(lines, 'Details', payload.details);

  lines.push('');
  appendLine(lines, 'Reporter', payload.reporterUserId);
  appendLine(lines, 'Reporter Name', payload.reporterDisplayName);

  lines.push('');
  appendLine(lines, 'Target ID', payload.targetId);
  appendLine(lines, 'Target Name', payload.targetName);
  appendLine(lines, 'Target User', payload.targetUserId);
  appendLine(lines, 'Target Sender', payload.senderUserId);
  appendLine(lines, 'Event ID', payload.eventId);
  appendLine(lines, 'Room ID', payload.roomId);
  appendLine(lines, 'Room Name', payload.roomName);
  appendLine(lines, 'Space ID', payload.spaceId);
  appendLine(lines, 'Space Name', payload.spaceName);
  appendLine(lines, 'Excerpt', payload.excerpt);

  lines.push('');
  appendLine(lines, 'Page', payload.pageUrl);
  appendLine(lines, 'App', payload.appUrl);
  appendLine(lines, 'Origin', payload.origin);
  appendLine(lines, 'IP', meta.ipAddress);
  appendLine(lines, 'User Agent', meta.userAgent);
  appendLine(lines, 'Reported At', meta.reportedAt);

  return lines.join('\n').slice(0, MAX_MESSAGE_LENGTH);
};

const parseJsonBody = (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    return JSON.parse(req.body);
  }
  return {};
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_REPORT_CHANNEL_ID;

  if (!botToken || !channelId) {
    sendJson(res, 500, { error: 'Reporting service is not configured' });
    return;
  }

  let body;
  try {
    body = parseJsonBody(req);
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body' });
    return;
  }

  const payload = {
    targetType: trimValue(body.targetType, 32),
    reason: trimValue(body.reason, 300),
    details: trimValue(body.details),
    reporterUserId: trimValue(body.reporterUserId, 255),
    reporterDisplayName: trimValue(body.reporterDisplayName, 255),
    targetId: trimValue(body.targetId, 255),
    targetName: trimValue(body.targetName, 255),
    targetUserId: trimValue(body.targetUserId, 255),
    senderUserId: trimValue(body.senderUserId, 255),
    eventId: trimValue(body.eventId, 255),
    roomId: trimValue(body.roomId, 255),
    roomName: trimValue(body.roomName, 255),
    spaceId: trimValue(body.spaceId, 255),
    spaceName: trimValue(body.spaceName, 255),
    excerpt: trimValue(body.excerpt, 700),
    pageUrl: trimValue(body.pageUrl, 700),
    appUrl: trimValue(body.appUrl, 700),
    origin: trimValue(body.origin, 255),
  };

  if (!payload.reason || !payload.targetType || !payload.targetId) {
    sendJson(res, 400, { error: 'Missing required report fields' });
    return;
  }

  if (!ALLOWED_TARGET_TYPES.has(payload.targetType)) {
    sendJson(res, 400, { error: 'Invalid report target type' });
    return;
  }

  const meta = {
    ipAddress: trimValue(
      req.headers['x-forwarded-for']?.toString().split(',')[0] ?? req.socket?.remoteAddress,
      255
    ),
    userAgent: trimValue(req.headers['user-agent'], 500),
    reportedAt: new Date().toISOString(),
  };

  const telegramMessage = formatTelegramMessage(payload, meta);

  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: channelId,
      text: telegramMessage,
      disable_web_page_preview: true,
    }),
  });

  if (!telegramResponse.ok) {
    const errorText = await telegramResponse.text();
    sendJson(res, 502, {
      error: 'Failed to forward report to Telegram',
      details: errorText.slice(0, 500),
    });
    return;
  }

  sendJson(res, 200, { ok: true });
}
