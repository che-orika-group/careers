// Cloudflare Pages Function — /api/submit-application
// Receives job applications from the Ché Orika Group careers page.
//   1) Sends the applicant a branded acknowledgement email via Resend
//   2) Sends an internal notification to the careers inbox with CV attached
//
// Env vars (set in Cloudflare Pages project settings):
//   RESEND_API_KEY         — Resend API key
//   FROM_EMAIL             — e.g. "Ché Orika Group <careers@cheorika.com>"
//   CAREERS_NOTIFY_EMAIL   — where applications land, e.g. "careers@cheorika.com"

import { renderCareersAckEmail } from './_lib/careers-ack-email.js';

const RESEND_BASE = 'https://api.resend.com';
const ROLE_TITLE = 'Marketing & Creative Associate';
const MAX_CV_BYTES = 5 * 1024 * 1024;

const ALLOWED_EXT = ['pdf', 'doc', 'docx'];
const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function onRequestPost(context) {
  const { request, env } = context;

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }

  const firstName = (form.get('first_name') || '').toString().trim();
  const lastName = (form.get('last_name') || '').toString().trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const email = (form.get('email') || '').toString().trim().toLowerCase();
  const phone = (form.get('phone') || '').toString().trim();
  const location = (form.get('location') || '').toString().trim();
  const portfolio = (form.get('portfolio') || '').toString().trim();
  const answerTiktok = (form.get('answer_tiktok') || '').toString().trim();
  const answerBrand = (form.get('answer_brand') || '').toString().trim();
  const answerStrength = (form.get('answer_strength') || '').toString().trim();
  const salaryExpectation = (form.get('salary_expectation') || '').toString().trim();
  const notes = (form.get('notes') || '').toString().trim();

  // Required fields
  if (!firstName || !lastName || !email || !phone || !location || !answerTiktok || !answerBrand || !answerStrength || !salaryExpectation) {
    return json({ ok: false, error: 'missing_required' }, 400);
  }

  // CV validation
  const cv = form.get('cv');
  if (!cv || typeof cv === 'string' || typeof cv.arrayBuffer !== 'function') {
    return json({ ok: false, error: 'cv_missing' }, 400);
  }

  const cvName = (cv.name || 'cv').toString();
  const ext = (cvName.split('.').pop() || '').toLowerCase();
  const cvType = (cv.type || '').toLowerCase();
  const typeOk = ALLOWED_EXT.includes(ext) || ALLOWED_MIME.includes(cvType);
  if (!typeOk) {
    return json({ ok: false, error: 'cv_type', message: 'Please upload a PDF or Word document.' }, 400);
  }

  const cvBuffer = await cv.arrayBuffer();
  if (cvBuffer.byteLength === 0) {
    return json({ ok: false, error: 'cv_empty' }, 400);
  }
  if (cvBuffer.byteLength > MAX_CV_BYTES) {
    return json({ ok: false, error: 'cv_size', message: 'CV must be under 5MB.' }, 400);
  }

  const safeCvName = sanitizeFilename(cvName, ext);
  const cvBase64 = arrayBufferToBase64(cvBuffer);

  // Send emails
  const resendKey = env.RESEND_API_KEY;
  const fromEmail = env.FROM_EMAIL || 'Ché Orika Group <careers@cheorika.com>';
  const careersTo = env.CAREERS_NOTIFY_EMAIL || 'careers@cheorika.com';
  const emailResults = { ack: null, internal: null };

  if (resendKey) {
    const resendHeaders = {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    };

    // Acknowledgement to applicant
    try {
      const ackRes = await fetch(`${RESEND_BASE}/emails`, {
        method: 'POST',
        headers: resendHeaders,
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          reply_to: 'careers@cheorika.com',
          subject: `Application Received · ${ROLE_TITLE} · Ché Orika Group`,
          html: renderCareersAckEmail(fullName, ROLE_TITLE),
        }),
      });
      emailResults.ack = ackRes.ok ? 'sent' : `error_${ackRes.status}`;
    } catch {
      emailResults.ack = 'network_error';
    }

    // Internal notification with CV
    try {
      const internalHtml = renderInternalNotification({
        fullName, email, phone, location, portfolio,
        answerTiktok, answerBrand, answerStrength,
        salaryExpectation, notes, cvName: safeCvName,
      });
      const noteRes = await fetch(`${RESEND_BASE}/emails`, {
        method: 'POST',
        headers: resendHeaders,
        body: JSON.stringify({
          from: fromEmail,
          to: [careersTo],
          reply_to: email,
          subject: `New application: ${ROLE_TITLE} · ${fullName}`,
          html: internalHtml,
          attachments: [{ filename: safeCvName, content: cvBase64 }],
        }),
      });
      emailResults.internal = noteRes.ok ? 'sent' : `error_${noteRes.status}`;
    } catch {
      emailResults.internal = 'network_error';
    }
  } else {
    emailResults.ack = 'skipped_no_key';
    emailResults.internal = 'skipped_no_key';
  }

  return json({ ok: true, emails: emailResults }, 200);
}

function renderInternalNotification(d) {
  const row = (label, value) =>
    value
      ? `<tr><td style="padding:8px 12px 8px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A84C;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:8px 0;font-family:Georgia,serif;font-size:14px;color:#2E1F16;line-height:1.6;">${escapeHtml(value)}</td></tr>`
      : '';
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FDF9F5;font-family:Georgia,serif;color:#2E1F16;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:24px 12px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
<tr><td style="background:#2E1F16;padding:20px 28px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:12px;letter-spacing:0.22em;color:#C9A84C;text-transform:uppercase;">New Application &middot; Marketing &amp; Creative Associate</td></tr>
<tr><td style="background:#FDF9F5;padding:28px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
${row('Name', d.fullName)}
${row('Email', d.email)}
${row('Phone', d.phone)}
${row('Location', d.location)}
${row('Portfolio', d.portfolio)}
${row('Salary expectation', d.salaryExpectation)}
${row('CV', d.cvName + ' (attached)')}
</table>
<div style="margin:24px 0 0 0;padding:20px;background:#F5EDDA;border-radius:6px;">
<div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:10px;">TikTok Strategy Answer</div>
<div style="font-family:Georgia,serif;font-size:14px;color:#2E1F16;line-height:1.7;">${escapeHtml(d.answerTiktok)}</div>
</div>
<div style="margin:16px 0 0 0;padding:20px;background:#F5EDDA;border-radius:6px;">
<div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:10px;">Brand They Admire</div>
<div style="font-family:Georgia,serif;font-size:14px;color:#2E1F16;line-height:1.7;">${escapeHtml(d.answerBrand)}</div>
</div>
<div style="margin:16px 0 0 0;padding:20px;background:#F5EDDA;border-radius:6px;">
<div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:10px;">Strength & Still Learning</div>
<div style="font-family:Georgia,serif;font-size:14px;color:#2E1F16;line-height:1.7;">${escapeHtml(d.answerStrength)}</div>
</div>
${d.notes ? `<div style="margin:16px 0 0 0;padding:20px;background:#F5EDDA;border-radius:6px;">
<div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:10px;">Additional Notes</div>
<div style="font-family:Georgia,serif;font-size:14px;color:#2E1F16;line-height:1.7;">${escapeHtml(d.notes)}</div>
</div>` : ''}
<p style="margin:24px 0 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#5a3e30;">CV is attached. Reply to this email to reach the applicant directly.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function escapeHtml(s) {
  return String(s || '').replace(/[<>&"']/g, c => ({
    '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'
  })[c]);
}

function sanitizeFilename(name, ext) {
  const base = String(name || 'cv')
    .replace(/[\/\\]/g, '_')
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120);
  if (base && base.toLowerCase().endsWith(`.${ext}`)) return base;
  const stem = base.replace(/\.[^.]*$/, '') || 'cv';
  return `${stem}.${ext}`;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}
