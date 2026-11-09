// Vercel Serverless Function: POST /api/gastro-lead
// Přijme poptávku z formuláře na /gastro/ a pošle ji e-mailem (Resend) a volitelně do Slacku.
//
// Proměnné prostředí (Vercel > Project > Settings > Environment Variables):
//   RESEND_API_KEY     API klíč z resend.com (doména odesílatele musí být v Resendu ověřená)
//   LEAD_FROM          odesílatel, např. "Brightbox gastro <gastro@brightbox.cz>"
//   LEAD_TO            příjemci oddělení čárkou, výchozí info@brightbox.cz
//   SLACK_WEBHOOK_URL  volitelně: Incoming Webhook do kanálu pro obchod
//   ALLOWED_ORIGINS    volitelně: povolené originy oddělené čárkou, např. https://www.brand.brightbox.cz

const INTERESTS = {
  'socialni-site': 'Sociální sítě (Sparkee)',
  web: 'Web (Weblantis)',
  tisk: 'Tisk a reklamní předměty (Print4You)',
  nevim: 'Zatím neví, chce poradit',
};
const REQUIRED = { podnik: 'název podniku', jmeno: 'jméno', telefon: 'telefon' };
const LIMITS = { podnik: 120, typ: 60, mesto: 80, jmeno: 120, telefon: 20, email: 160, odkaz: 200, zprava: 2000, doporucil: 120, utm_source: 120, utm_medium: 120, utm_campaign: 120, ref: 120, stranka: 300 };

function clean(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function buildText(d, interests) {
  const when = new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' });
  const lines = [
    'Nová poptávka z gastro stránky (www.brand.brightbox.cz/gastro).',
    '',
    `Zájem: ${interests.length ? interests.join(', ') : 'nevyplněno'}`,
    '',
    `Podnik: ${d.podnik}${d.typ ? ` (${d.typ})` : ''}`,
    d.mesto ? `Město: ${d.mesto}` : null,
    `Kontakt: ${d.jmeno}`,
    `Telefon: ${d.telefon}`,
    `E-mail: ${d.email || 'nevyplněno'}`,
    d.odkaz ? `Web / Instagram: ${d.odkaz}` : null,
    d.doporucil ? `Doporučil: ${d.doporucil}` : null,
    '',
    d.zprava ? `Zpráva:\n${d.zprava}\n` : null,
    '---',
    `Odesláno: ${when}`,
    `Zdroj: ${[d.utm_source, d.utm_medium, d.utm_campaign].filter(Boolean).join(' / ') || 'přímý vstup'}`,
    d.ref ? `Ref: ${d.ref}` : null,
    d.stranka ? `Stránka: ${d.stranka}` : null,
  ];
  return lines.filter((l) => l !== null).join('\n');
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.length && req.headers.origin && !allowed.includes(req.headers.origin)) {
    return res.status(403).json({ ok: false, error: 'forbidden_origin' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'bad_json' });
  }

  // Past na roboty: skryté pole vyplní jen bot. Tváříme se, že je vše v pořádku.
  if (clean(body.web_hp, 200)) return res.status(200).json({ ok: true });

  const d = {};
  for (const [key, max] of Object.entries(LIMITS)) d[key] = clean(body[key], max);
  const interests = (Array.isArray(body.zajem) ? body.zajem : [body.zajem])
    .map((v) => INTERESTS[clean(v, 40)])
    .filter(Boolean);

  const missing = Object.keys(REQUIRED).filter((k) => !d[k]);
  if (missing.length) return res.status(422).json({ ok: false, error: 'missing_fields', fields: missing });
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return res.status(422).json({ ok: false, error: 'invalid_email' });
  if ((d.telefon.match(/\d/g) || []).length < 9) return res.status(422).json({ ok: false, error: 'invalid_phone' });

  const text = buildText(d, interests);
  const subject = `Gastro poptávka: ${d.podnik}${d.mesto ? `, ${d.mesto}` : ''}`;
  const jobs = [];

  if (process.env.RESEND_API_KEY) {
    const to = (process.env.LEAD_TO || 'info@brightbox.cz').split(',').map((s) => s.trim()).filter(Boolean);
    jobs.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.LEAD_FROM || 'Brightbox gastro <onboarding@resend.dev>',
          to,
          ...(d.email ? { reply_to: d.email } : {}),
          subject,
          text,
        }),
      }).then(async (r) => {
        if (!r.ok) throw new Error(`resend ${r.status}: ${(await r.text()).slice(0, 300)}`);
      })
    );
  }

  if (process.env.SLACK_WEBHOOK_URL) {
    jobs.push(
      fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `*${subject}*\n${text}` }),
      }).then((r) => {
        if (!r.ok) throw new Error(`slack ${r.status}`);
      })
    );
  }

  if (!jobs.length) {
    console.error('gastro-lead: chybí RESEND_API_KEY i SLACK_WEBHOOK_URL, poptávka nebyla doručena', subject);
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }

  const results = await Promise.allSettled(jobs);
  const delivered = results.some((r) => r.status === 'fulfilled');
  results.filter((r) => r.status === 'rejected').forEach((r) => console.error('gastro-lead:', r.reason && r.reason.message));
  if (!delivered) return res.status(502).json({ ok: false, error: 'delivery_failed' });
  return res.status(200).json({ ok: true });
};
