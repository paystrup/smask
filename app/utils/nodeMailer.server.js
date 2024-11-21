import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PW,
  },
});

export const sendintroMail = async (email, name) => {
  const domain = process.env.DOMAIN;
  const mailOptions = {
    from: `SMASK <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: "Welcome to Smask",
    html: `<p>Hi ${name},</p><p>Thank you for signing up. Welcome to smask! We are excited to have you on board. Go to our login page to get started. </p><a href="${domain}/login">Go to login</a>`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendDeletionMail = async (email, name) => {
  const mailOptions = {
    from: `SMASK <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: `We are going to miss you ${name}`,
    html: `<p>Hi ${name},</p><p>Sorry to let you go. We have deleted your account and all your information from our service. It's been a great ride, hope to see you back soon!</p>`,
  };

  await transporter.sendMail(mailOptions);
};
