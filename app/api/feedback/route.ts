import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const RECIPIENT = 'maximilian.nestler@42watt.de';
const FROM = 'Feedback 42watt Tools <feedback@tools.42watt.de>';

const categoryLabels: Record<string, string> = {
  problem: '🐛 Problem / Bug',
  feature: '💡 Feature Request',
  general: '💬 Allgemeines Feedback',
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not set');
    return NextResponse.json({ error: 'E-Mail-Versand nicht konfiguriert.' }, { status: 503 });
  }
  const resend = new Resend(apiKey);

  try {
    const { email, category, message } = await req.json();

    // Basic validation
    if (!email || !category || !message) {
      return NextResponse.json({ error: 'Alle Felder sind Pflichtfelder.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Nachricht zu lang (max. 5000 Zeichen).' }, { status: 400 });
    }

    const categoryLabel = categoryLabels[category] ?? category;

    const { error } = await resend.emails.send({
      from: FROM,
      to: [RECIPIENT],
      replyTo: email,
      subject: `[42watt Tools] ${categoryLabel} von ${email}`,
      html: `
        <div style="font-family: Manrope, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #222222;">
          <div style="background: #3445FF; padding: 32px 40px;">
            <h1 style="color: white; font-size: 22px; font-weight: 300; margin: 0;">42watt Tools — Feedback</h1>
          </div>
          <div style="padding: 32px 40px; border: 1px solid #E5E0D7; border-top: none; background: #FEFBF9;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #6B7280; padding: 8px 0; width: 120px; border-bottom: 1px solid #E5E0D7;">Von</td>
                <td style="font-size: 14px; color: #222222; padding: 8px 0; border-bottom: 1px solid #E5E0D7;"><a href="mailto:${email}" style="color: #3445FF;">${email}</a></td>
              </tr>
              <tr>
                <td style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #6B7280; padding: 8px 0; width: 120px; border-bottom: 1px solid #E5E0D7;">Kategorie</td>
                <td style="font-size: 14px; color: #222222; padding: 8px 0; border-bottom: 1px solid #E5E0D7;">${categoryLabel}</td>
              </tr>
            </table>
            <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #6B7280; margin: 0 0 8px 0;">Nachricht</p>
            <div style="font-size: 15px; line-height: 1.7; color: #222222; white-space: pre-wrap; border-left: 3px solid #3445FF; padding-left: 16px;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          <div style="padding: 16px 40px; background: #F6F5F4; border: 1px solid #E5E0D7; border-top: none;">
            <p style="font-size: 12px; color: #8c8c8c; margin: 0;">Gesendet über das Feedback-Formular auf <a href="https://tools.42watt.de/feedback" style="color: #3445FF;">tools.42watt.de/feedback</a></p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'E-Mail konnte nicht gesendet werden.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Feedback API error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 });
  }
}
