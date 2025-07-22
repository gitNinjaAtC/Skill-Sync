import nodemailer from "nodemailer";

export const sendResetEmail = async (to, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"SkillSync Support" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: "Reset Your SkillSync Password",
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click the link below to reset:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
