import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
      throw new Error('Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD.');
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });
  }

  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

export async function sendVerificationEmail(email, otp) {
  await sendEmail({
    to: email,
    subject: 'Your SwiftLink verification code',
    text: `Your SwiftLink verification code is ${otp}. It expires in 5 minutes.`,
    html: `<p>Your SwiftLink verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p><p>This code expires in 5 minutes.</p>`,
  });
}

export async function sendShipmentEmail(email, { recipientName, senderName, from, to: destination, departureDate, trackingCode }) {
  const text = `Hello ${recipientName},\n\n${senderName} has created a shipment for you.\nTracking code: ${trackingCode}\nFlight: ${from} to ${destination}\nDeparture: ${departureDate}\n\nUse this tracking code in SwiftLink to follow your shipment.`;
  await sendEmail({
    to: email,
    subject: `SwiftLink shipment ${trackingCode}`,
    text,
    html: `<p>Hello ${recipientName},</p><p>${senderName} has created a shipment for you.</p><p><strong>Tracking code:</strong> ${trackingCode}<br><strong>Flight:</strong> ${from} to ${destination}<br><strong>Departure:</strong> ${departureDate}</p><p>Use this tracking code in SwiftLink to follow your shipment.</p>`,
  });
}
