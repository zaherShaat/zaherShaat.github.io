import dotenv from "dotenv";
import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";
import xlsx from "xlsx";

dotenv.config();

const workbook = xlsx.readFile("./emails.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

// SMTP transport (credentials read from env with sensible defaults)
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpSecure = false;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.EMAIL_USER || "zaher970597826287@gmail.com",
    pass: process.env.EMAIL_PASS || "gblifdbgbevxpwnv"
  },
  requireTLS: smtpPort === 587,
  tls: {
    // allow self-signed certs if explicitly disabled by env
    rejectUnauthorized: process.env.TLS_REJECT_UNAUTHORIZED !== "false"
  },
  // make connection errors easier to diagnose
  connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT || "30000", 10),
  greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT || "30000", 10),
  socketTimeout: parseInt(process.env.SMTP_SOCKET_TIMEOUT || "30000", 10),
  logger: !!process.env.SMTP_LOGGER,
  debug: !!process.env.SMTP_DEBUG
});

// Read attachments (if any) from ./attachments
const attachmentsDir = path.resolve("./attachments");
let attachments = [];
if (fs.existsSync(attachmentsDir)) {
  attachments = fs.readdirSync(attachmentsDir).filter(f => f && f[0] !== '.').map(file => ({
    filename: file,
    path: path.join(attachmentsDir, file)
  }));
}

async function sendAll() {
  const delayMs = parseInt(process.env.SEND_DELAY_MS || "1000", 10);
  let sent = 0;
  let failed = 0;

  const sleep = ms => new Promise(res => setTimeout(res, ms));

  for (let row of rows) {
    const to = String(row.email || "").trim();
    const subject = row.subject || "";
    const html = row.message || "";

    if (!to) {
      console.log(`⚠ Skipping row without email: ${JSON.stringify(row)}`);
      failed++;
      continue;
    }

    try {
      const info = await transporter.sendMail({
        from: `"Zaher" <${process.env.EMAIL_USER || "zaher970597826287@gmail.com"}>`,
        to,
        subject,
        html,
        attachments: attachments.length ? attachments : undefined
      });

      console.log(`✔ Sent to ${to} — ${info.messageId}`);
      sent++;
    } catch (err) {
      console.log(`✖ Failed ${to} — ${err && err.message ? err.message : err}`);
      failed++;
    }

    if (delayMs > 0) await sleep(delayMs);
  }

  console.log(`\nSummary: Sent=${sent} Failed=${failed} Total=${rows.length}`);
}

async function initAndSend() {
  try {
    await transporter.verify();
    console.log(`SMTP OK — ${smtpHost}:${smtpPort} (secure=${smtpSecure})`);
    if (process.env.SMTP_DEBUG || process.env.SMTP_LOGGER) console.log('SMTP debug/logger enabled');
    await sendAll();
  } catch (err) {
    console.error('✖ SMTP connection failed:', err && err.message ? err.message : err);
    console.error('Hints: check network, firewall, correct port/secure, credentials, or try setting SMTP_DEBUG=1 and re-run.');
    process.exit(1);
  }
}

initAndSend();




// const nodemailer = require("nodemailer");
// const XLSX = require("xlsx");
// const path = require("path");
// const fs = require("fs");

// // ====== 1. إعداد SMTP ======
// let transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // IMPORTANT
//   auth: {
//     user: "zaher970597826287@gmail.com",
//     pass: "gblifdbgbevxpwnv",
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// });

// // const transporter = nodemailer.createTransport({
// //   host: "smtp.gmail.com",
// //   port: 465,
// //   secure: true,
// //   auth: {
// //     user: "zaher970597826287@gmail.com",
// //     pass: "Zaher2024@!"
// //   }
// // });

// // ====== 2. قراءة Excel ======
// const workbook = XLSX.readFile("emails.xlsx");
// const sheet = workbook.Sheets[workbook.SheetNames[0]];
// const rows = XLSX.utils.sheet_to_json(sheet);

// // ====== 3. المرفقات ======
// const attachmentsFolder = "./attachments";
// let attachments = [];

// if (fs.existsSync(attachmentsFolder)) {
//   attachments = fs.readdirSync(attachmentsFolder).map(file => ({
//     filename: file,
//     path: path.join(attachmentsFolder, file)
//   }));
// }

// // ====== 4. إرسال الإيميلات ======
// (async () => {
//   for (let row of rows) {
//     const mailOptions = {
//       from: '"Zaher Shaat" zaher970597826287@gmail.com',
//       to: row.email,
//       subject: row.subject,
//       html: row.message,     // ←← هنا أصبح HTML
//       attachments
//     };

//     try {
//       let info = await transporter.sendMail(mailOptions);
//       console.log(`✔ Sent to ${row.email} — ${info.messageId}`);
//     } catch (err) {
//       console.log(`✖ Failed ${row.email}`, err);
//     }
//   }
// })();
