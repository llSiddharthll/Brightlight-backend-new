import { Router } from "express";
import nodemailer from "nodemailer";
import Contact from "../models/Contact.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message, areaOfInterest, residencyStatus } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      areaOfInterest,
      residencyStatus,
      message,
    });
    await newContact.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    // Use the direct white logo path provided by the user for maximum compatibility
    const logoUrl = "https://www.brightlightimmigration.ca/images/brightlight-logo-white.png";

    const emailTemplate = `
      <!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>Inquiry Notification</title>
        <style>
          :root { color-scheme: light dark; supported-color-schemes: light dark; }
          body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          .wrapper { width: 100%; table-layout: fixed; padding: 40px 0; }
          .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 25px rgba(0,0,0,0.06); }
          
          /* Force Header to stay Navy in Dark Mode */
          .header { background-color: #132f46 !important; padding: 22px 30px; }
          .header h1 { color: #ffffff !important; margin: 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; vertical-align: middle; display: inline-block; margin-left: 12px; }
          .logo { height: 32px; width: auto; vertical-align: middle; display: inline-block; }
          
          .content { padding: 40px 30px; background-color: #ffffff !important; }
          .status-badge { color: #e8c47c !important; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 30px; display: block; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
          
          .detail-row { margin-bottom: 25px; }
          .detail-label { display: block; font-size: 10px; font-weight: 800; color: #94a3b8 !important; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 6px; }
          .detail-value { display: block; font-size: 16px; font-weight: 700; color: #1e293b !important; border-bottom: 1px solid #f8fafc; padding-bottom: 8px; }
          
          .message-card { background-color: #f8fafc !important; border-left: 5px solid #132f46 !important; border-radius: 6px; padding: 25px; margin-top: 15px; border: 1px solid #f1f5f9; border-left-width: 5px; }
          .message-header { font-size: 11px; font-weight: 800; color: #64748b !important; text-transform: uppercase; margin-bottom: 12px; display: block; }
          .message-content { font-size: 15px; line-height: 1.7; color: #334155 !important; margin: 0; white-space: pre-wrap; }
          
          .footer { padding: 40px 20px; text-align: center; background-color: #fcfcfc !important; border-top: 1px solid #f1f5f9; }
          .footer-address { font-size: 12px; color: #64748b !important; line-height: 1.8; margin-bottom: 20px; }
          .footer-brand { font-size: 10px; color: #94a3b8 !important; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }

          /* Explicit Dark Mode Overrides */
          @media (prefers-color-scheme: dark) {
            .header { background-color: #132f46 !important; }
            .header h1 { color: #ffffff !important; }
            .logo { filter: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header" style="background-color: #132f46;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle" style="background-color: #132f46; width: 44px;">
                    <img src="${logoUrl}" alt="Brightlight Immigration" width="100" height="50" style="width: 44px; height: auto; display: block; border: 0; color: transparent;" />
                  </td>
                  <td align="left" valign="middle" style="background-color: #132f46; padding-left: 12px;">
                    <h1 style="color: #ffffff; margin: 0; font-family: sans-serif;">Website Inquiry</h1>
                  </td>
                </tr>
              </table>
            </div>
            
            <div class="content">
              <span class="status-badge">New Website Inquiry</span>
              
              <div class="detail-row">
                <span class="detail-label">Client Full Name</span>
                <span class="detail-value">${name}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Email Address</span>
                <span class="detail-value" style="color: #132f46 !important;">${email}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Phone Contact</span>
                <span class="detail-value">${phone || "Not Provided"}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Requested Service</span>
                <span class="detail-value" style="color: #e8c47c !important;">${areaOfInterest || "General Inquiries"}</span>
              </div>

              <div class="detail-row" style="margin-bottom: 10px;">
                <span class="detail-label">Current Residency</span>
                <span class="detail-value">${residencyStatus || "Unknown"}</span>
              </div>

              <div class="message-card">
                <span class="message-header">Inquiry Details</span>
                <p class="message-content">${message}</p>
              </div>
            </div>

            <div class="footer">
              <div class="footer-address">
                15315 66 Ave unit 327, Surrey, BC V3S 2A1<br/>
                Office Line: (604) 503-3734 | info@brightlightimmigration.ca
              </div>
              <div class="footer-brand">
                Brightlight Immigration &copy; 2026
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Brightlight Notifications" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || "info@brightlightimmigration.ca",
      replyTo: email,
      subject: `New Website Inquiry: ${name} (${areaOfInterest || "General"})`,
      html: emailTemplate,
    });
    res.json({ message: "Message sent and saved successfully" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "An error occurred while processing your request" });
  }
});

export default router;
