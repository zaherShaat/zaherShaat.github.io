import dotenv from "dotenv";
import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";
import http from "http";

dotenv.config();

// SMTP configuration
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpSecure = false;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  requireTLS: smtpPort === 587,
  tls: {
    rejectUnauthorized: process.env.TLS_REJECT_UNAUTHORIZED !== "false"
  }
});

// Email to receive notifications
const NOTIFICATION_EMAIL = process.env.EMAIL_USER;

async function sendVisitNotification(visitData) {
  try {
    const subject = `New Visit from ${visitData.country || 'Unknown Location'}`;
    const html = `
      <h3>New Visitor!</h3>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>IP:</strong> ${visitData.ip || 'Unknown'}</p>
      <p><strong>Country:</strong> ${visitData.country || 'Unknown'}</p>
      <p><strong>City:</strong> ${visitData.city || 'Unknown'}</p>
      <p><strong>Device/UA:</strong> ${visitData.userAgent}</p>
      <p><strong>Page:</strong> ${visitData.page}</p>
    `;

    const info = await transporter.sendMail({
      from: `"Visitor Tracker" <${process.env.EMAIL_USER}>`,
      to: NOTIFICATION_EMAIL,
      subject,
      html
    });

    console.log(`✔ Notification sent for visitor: ${visitData.ip}`);
  } catch (err) {
    console.error(`✖ Failed to send notification: ${err.message}`);
  }
}

// Allowed origin (your GitHub Pages domain)
const ALLOWED_ORIGIN = 'https://zahershaat.github.io';

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check route for Render
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Visitor tracker is running' }));
    return;
  }

  if (req.url === '/track-visit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const visitData = JSON.parse(body || '{}');
        // Add IP from request if not provided (though client-side IP fetch is better for location)
        const requestIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (!visitData.ip) {
          visitData.ip = requestIp;
        }

        // Respond to client immediately
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));

        // Send email asynchronously
        await sendVisitNotification(visitData);

      } catch (e) {
        console.error("Error processing request:", e);
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Bad Request" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('Visitor tracker is ready to receive notifications.');
});
