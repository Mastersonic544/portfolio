import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const { name, email, subject, message } = await request.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    throw error(400, 'Missing required fields');
  }

  const appPassword = env.GMAIL_APP_PASSWORD;
  if (!appPassword) {
    throw error(500, 'Mail not configured');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'yassine.m.dhouib@gmail.com',
      pass: appPassword
    }
  });

  try {
    await transporter.sendMail({
      from: '"Shift Portfolio" <yassine.m.dhouib@gmail.com>',
      to:   'yassine.m.dhouib@gmail.com',
      replyTo: `"${name}" <${email}>`,
      subject: subject?.trim() ? `[Portfolio] ${subject.trim()}` : `[Portfolio] Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <p style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.1em">Portfolio Contact</p>
          <h2 style="margin:0 0 16px;font-size:20px">${subject?.trim() || 'New message'}</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
            <tr><td style="padding:6px 0;color:#666;width:72px">From</td><td>${name}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          </table>
          <div style="white-space:pre-wrap;font-size:15px;line-height:1.7;color:#111;border-left:3px solid #FF5C00;padding-left:16px">${message}</div>
          <hr style="border:none;border-top:1px solid #eee;margin:32px 0"/>
          <p style="font-size:11px;color:#aaa">Sent via yassinedhouib.dev — hit Reply to respond directly.</p>
        </div>
      `
    });
  } catch (mailErr) {
    console.error('[contact] sendMail failed:', mailErr);
    throw error(500, `Mail delivery failed: ${mailErr.message}`);
  }

  return json({ ok: true });
}
