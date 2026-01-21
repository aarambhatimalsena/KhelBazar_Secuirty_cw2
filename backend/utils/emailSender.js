// utils/emailSender.js
import nodemailer from "nodemailer";
import fs from "fs";

// App branding
const FROM_NAME = "KhelBazar";
const isTest = process.env.NODE_ENV === "test";

// Always read env after dotenv.config()
const getFromEmail = () => process.env.EMAIL_USER || "";

// ================================
// Create Transporter (Safe)
// ================================
const createTransporter = () => {
  const fromEmail = getFromEmail();
  const pass = process.env.EMAIL_PASS;

  if (!fromEmail || !pass) {
    console.error("⚠️ EMAIL_USER or EMAIL_PASS missing in .env");
    console.error("   EMAIL_USER:", fromEmail);
    console.error("   EMAIL_PASS present?:", !!pass);
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: fromEmail,
      pass,
    },
  });
};

// helper for nice error logs
const logError = (label, err, extra = {}) => {
  console.error(`❌ ${label}:`, err?.message || err);
  if (Object.keys(extra).length) console.error("   ↳ extra:", extra);
};

// ======================================================
// 1️⃣ ORDER CONFIRMATION / INVOICE EMAIL  (Premium UI)
// ======================================================
export const sendOrderEmail = async (to, subject, text, invoicePath = null) => {
  if (isTest) return;

  try {
    const transporter = createTransporter();
    if (!transporter) return;

    // PDF attachment
    const attachments = [];
    if (invoicePath && fs.existsSync(invoicePath)) {
      attachments.push({
        filename: "KhelBazar-Invoice.pdf",
        path: invoicePath,
        contentType: "application/pdf",
      });
    }

    // PREMIUM UI (Soft Blue, White card, Clean fonts)
    const html = `
      <div style="margin:0; padding:0; background:#f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px; background:#f3f4f6;">
          <tr>
            <td align="center">

              <table width="100%" style="max-width:640px; background:#ffffff; border-radius:14px; border:1px solid #e5e7eb; overflow:hidden;">
                
                <!-- HEADER -->
                <tr>
                  <td style="padding:20px 22px 14px; border-bottom:1px solid #e5e7eb;">
                    <table width="100%">
                      <tr>
                        <td>
                          <div style="font-family:system-ui; font-size:20px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase;">
                            <span style="color:#111827;">KHEL</span>
                            <span style="color:#ef4444;">DOK</span>
                            <span style="color:#111827;">AN</span>
                          </div>
                          <div style="font-size:11px; color:#6b7280;">
                            Premium Basketball Gear & Apparel
                          </div>
                        </td>

                        <td align="right" style="font-size:11px; color:#9ca3af;">
                          Kathmandu, Nepal<br/>
                          <a href="mailto:support@KhelBazar.com" style="color:#6b7280; text-decoration:none;">
                            support@KhelBazar.com
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:24px 26px;">
                    
                    <h1 style="margin:0 0 10px; font-family:system-ui; font-size:20px; font-weight:700; color:#111827;">
                      Thank you for your order 🏀
                    </h1>

                    <p style="font-size:14px; color:#4b5563; font-family:system-ui;">
                      ${text || "We’ve received your order and our team is preparing it."}
                    </p>

                    ${
                      attachments.length
                        ? `
                    <div style="margin:18px 0; padding:12px 14px; border-radius:10px; background:#eff6ff; border:1px solid #dbeafe;">
                      <div style="font-weight:600; font-size:13px; color:#1d4ed8;">
                        📎 Invoice attached
                      </div>
                      <div style="font-size:13px; color:#4b5563;">
                        Your detailed invoice is attached as a PDF document.
                      </div>
                    </div>
                    `
                        : ""
                    }

                    <p style="margin:18px 0 6px; font-size:14px; color:#111827; font-weight:600;">
                      What’s next?
                    </p>

                    <ul style="padding-left:20px; color:#4b5563; font-size:13px; line-height:1.6;">
                      <li>Your items will be packed & shipped soon.</li>
                      <li>You can track everything from your KhelBazar account.</li>
                    </ul>

                    <p style="font-size:13px; color:#6b7280;">
                      If you have any questions, reply to this email — we're here to help.
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="padding:14px 20px; text-align:center; background:#f9fafb; border-top:1px solid #e5e7eb;">
                    <p style="margin:0; font-size:11px; color:#9ca3af;">
                      © ${new Date().getFullYear()} KhelBazar. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </div>
    `;

    const mailOptions = {
      from: `"${FROM_NAME} 🛍️" <${getFromEmail()}>`,
      to,
      subject: subject || "Your KhelBazar Order",
      text: text || "Thank you for your order.",
      html,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Order email sent to:", to);
  } catch (err) {
    logError("Failed to send order email", err, { to });
  }
};

// ======================================================
// 2️⃣ OTP EMAIL (generic – use for 2FA login as well)
// ======================================================
export const sendOtpEmail = async (to, otp) => {
  if (isTest) return;

  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const html = `
      <div style="font-family:system-ui; background:#f3f4f6; padding:24px;">
        <div style="max-width:520px; margin:auto; background:#fff; border-radius:12px; padding:24px; border:1px solid #e5e7eb;">
          <h2 style="margin:0; font-size:18px;">Login Verification Code</h2>
          <p style="color:#4b5563;">Use the OTP below to complete login:</p>

          <div style="margin:16px 0; text-align:center;">
            <span style="font-size:26px; font-weight:800; letter-spacing:0.2em; background:#111827; color:white; padding:10px 22px; border-radius:8px;">
              ${otp}
            </span>
          </div>

          <p style="color:#6b7280;">Valid for 10 minutes.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME} 🔐" <${getFromEmail()}>`,
      to,
      subject: "Your KhelBazar OTP Code",
      html,
    });

    console.log("✅ OTP sent to:", to);
  } catch (err) {
    logError("Failed to send OTP email", err, { to });
  }
};

// ✅ Alias if you want to call sendLoginOtpEmail from controller
export const sendLoginOtpEmail = sendOtpEmail;

// ======================================================
// 2.5 EMAIL VERIFICATION OTP
// ======================================================
export const sendEmailVerificationOtp = async (to, otp) => {
  if (isTest) return;

  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const html = `
      <div style="font-family:system-ui; background:#f3f4f6; padding:24px;">
        <div style="max-width:520px; margin:auto; background:#fff; border-radius:12px; padding:24px; border:1px solid #e5e7eb;">
          <h2 style="margin:0; font-size:18px;">Email Verification Code</h2>
          <p style="color:#4b5563;">Use the code below to verify your email:</p>

          <div style="margin:16px 0; text-align:center;">
            <span style="font-size:26px; font-weight:800; letter-spacing:0.2em; background:#111827; color:white; padding:10px 22px; border-radius:8px;">
              ${otp}
            </span>
          </div>

          <p style="color:#6b7280;">Valid for 10 minutes.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${getFromEmail()}>`,
      to,
      subject: "Email Verification Code",
      html,
    });

    console.log("Email verification OTP sent to:", to);
  } catch (err) {
    logError("Failed to send email verification OTP", err, { to });
  }
};

// ======================================================
// 3️⃣ FORGOT PASSWORD EMAIL
// ======================================================
export const sendForgotPasswordEmail = async (to, resetLink) => {
  if (isTest) return;

  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const html = `
      <div style="font-family:system-ui; background:#f3f4f6; padding:24px;">
        <div style="max-width:520px; margin:auto; background:#fff; border-radius:12px; padding:24px; border:1px solid #e5e7eb;">
          
          <h2>Password Reset Request</h2>
          <p style="color:#4b5563;">
            Click the button below to reset your password.
          </p>

          <div style="margin:22px 0; text-align:center;">
            <a href="${resetLink}" style="padding:12px 22px; background:#111827; color:white; text-decoration:none; border-radius:8px;">
              Reset Password
            </a>
          </div>

          <p style="color:#6b7280; font-size:12px;">
            Link valid for 15 minutes.
          </p>

        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME} 🔒" <${getFromEmail()}>`,
      to,
      subject: "Reset Your KhelBazar Password",
      html,
    });

    console.log("✅ Password reset email sent to:", to);
  } catch (err) {
    logError("Failed to send password reset email", err, { to });
  }
};

// ======================================================
// 4 NEW LOGIN DETECTED EMAIL
// ======================================================
export const sendNewLoginEmail = async (user, details = {}) => {
  if (isTest) return;

  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const {
      ip,
      userAgent,
      browser,
      os,
      country,
      city,
      time,
    } = details || {};

    const when = time ? new Date(time).toLocaleString() : new Date().toLocaleString();
    const location = [city, country].filter(Boolean).join(", ") || "Unknown";

    const text = `New login detected for your KhelBazar account.

Time: ${when}
IP: ${ip || "Unknown"}
Location: ${location}
Browser: ${browser || "Unknown"}
OS: ${os || "Unknown"}
Device: ${userAgent || "Unknown"}

If this was you, no action is needed.
If this wasn't you, reset your password and log out of all devices.`;

    const html = `
      <div style="font-family:system-ui; background:#f3f4f6; padding:24px;">
        <div style="max-width:520px; margin:auto; background:#fff; border-radius:12px; padding:24px; border:1px solid #e5e7eb;">
          <h2 style="margin:0; font-size:18px;">New Login Detected</h2>
          <p style="color:#4b5563;">We noticed a new login to your KhelBazar account.</p>

          <ul style="color:#4b5563; font-size:13px; line-height:1.6;">
            <li><strong>Time:</strong> ${when}</li>
            <li><strong>IP:</strong> ${ip || "Unknown"}</li>
            <li><strong>Location:</strong> ${location}</li>
            <li><strong>Browser:</strong> ${browser || "Unknown"}</li>
            <li><strong>OS:</strong> ${os || "Unknown"}</li>
            <li><strong>Device:</strong> ${userAgent || "Unknown"}</li>
          </ul>

          <p style="color:#4b5563; font-size:13px;">If this was you, no action is needed.</p>
          <p style="color:#4b5563; font-size:13px;">If this wasn't you, reset your password and log out of all devices.</p>

          <p style="color:#9ca3af; font-size:11px; margin-top:16px;">
            This is an automated security email from KhelBazar.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${getFromEmail()}>`,
      to: user.email,
      subject: "KhelBazar: New login detected",
      text,
      html,
    });

    console.log("New login email sent to:", user.email);
  } catch (err) {
    logError("Failed to send new login email", err, { to: user?.email });
  }
};
// ======================================================
// 4?? SUSPICIOUS LOGIN ALERT EMAIL
// ======================================================
export const sendSuspiciousLoginEmail = async (
  user,
  clientInfo,
  reasons = [],
  riskScore = 0
) => {
  if (isTest) return;

  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const { ip, userAgent } = clientInfo || {};
    const reasonText =
      reasons && reasons.length
        ? reasons.join(", ")
        : "Unusual login behaviour detected.";

    const html = `
      <div style="font-family:system-ui; background:#f3f4f6; padding:24px;">
        <div style="max-width:520px; margin:auto; background:#fff; border-radius:12px; padding:24px; border:1px solid #e5e7eb;">
          <h2 style="margin:0; font-size:18px;">Security Alert: Suspicious Login Detected</h2>
          <p style="color:#4b5563;">
            We noticed a <strong>potentially suspicious login</strong> to your KhelBazar account.
          </p>

          <ul style="color:#4b5563; font-size:13px; line-height:1.6;">
            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            <li><strong>IP:</strong> ${ip || "Unknown"}</li>
            <li><strong>Device:</strong> ${userAgent || "Unknown"}</li>
            <li><strong>Risk Score:</strong> ${riskScore}</li>
            <li><strong>Reason:</strong> ${reasonText}</li>
          </ul>

          <p style="color:#4b5563; font-size:13px;">
            If this was <strong>you</strong>, you don't need to do anything.
          </p>
          <p style="color:#4b5563; font-size:13px;">
            If this was <strong>not you</strong>, we recommend:
          </p>
          <ul style="color:#4b5563; font-size:13px; line-height:1.6;">
            <li>Change your password immediately.</li>
            <li>Log out of all other devices from your account settings (when available).</li>
          </ul>

          <p style="color:#9ca3af; font-size:11px; margin-top:16px;">
            This is an automated security email from KhelBazar.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME} 🔐" <${getFromEmail()}>`,
      to: user.email,
      subject: "KhelBazar: Suspicious login detected on your account",
      html,
    });

    console.log("✅ Suspicious login email sent to:", user.email);
  } catch (err) {
    logError("Failed to send suspicious login email", err, { to: user?.email });
  }
};
