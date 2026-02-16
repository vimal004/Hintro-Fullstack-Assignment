const nodemailer = require("nodemailer");

// Create reusable transporter object using the default SMTP transport
let transporter = null;
let testAccount = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Use real credentials
    console.log("📧 Using configured SMTP credentials");
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    console.log(
      "📧 No SMTP credentials found. Creating Ethereal test account...",
    );
    try {
      testAccount = await nodemailer.createTestAccount();

      // create reusable transporter object using the default SMTP transport
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
      console.log("✅ Ethereal Email Account created:", testAccount.user);
    } catch (err) {
      console.error("❌ Failed to create Ethereal account:", err);
      return null; // Don't return half-baked transporter
    }
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transport = await getTransporter(); // Ensures transporter is created

    if (!transport) {
      console.warn("⚠️ No email transporter available. Email not sent.");
      return false;
    }

    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM || '"TaskFlow" <noreply@taskflow.com>', // sender address
      to, // list of receivers
      subject, // Subject line
      html, // html body
    });

    console.log("✅ Message sent: %s", info.messageId);

    // Preview only available when sending through an Ethereal account
    if (info.messageId && !process.env.EMAIL_USER) {
      console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } else {
      console.log("📧 Email sent via SMTP to", to);
    }

    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};

module.exports = { sendEmail };
