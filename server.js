const express    = require("express");
const nodemailer = require("nodemailer");
const cors       = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── Gmail transporter ─────────────────────────────────────
// Uses an App Password (not your real Gmail password).
// Generate one at: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "uwamariyaassumpta24@gmail.com",
    pass: "icnduqfwjezzrzqd",   // Gmail App Password
  },
});

app.post("/send-email", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields." });
  }

  const mailOptions = {
    from: `"Portfolio Contact" <uwamariyaassumpta24@gmail.com>`,
    to:   "uwamariyaassumpta24@gmail.com",
    replyTo: email,
    subject: `New message from ${name}`,
    html: `
      <h2 style="color:#fdc435">New Portfolio Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "—"}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error("Mail error:", err.message);
    res.status(500).json({ success: false, error: "Failed to send email." });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Email server running on http://localhost:${PORT}`));
