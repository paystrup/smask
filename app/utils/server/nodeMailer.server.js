import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendintroMail = async (email, name) => {
  if (!email || !name) {
    throw new Error("Email and name are required for sending intro mail");
  }

  const domain = process.env.BASE_URL;
  if (!domain) {
    throw new Error("BASE_URL environment variable is not set");
  }

  try {
    await resend.emails.send({
      from: `SMASK <smask@resend.dev>`,
      to: email,
      subject: "Welcome to SMASK",
      html: `<p>Hi ${name},</p><p>Thank you for signing up. Welcome to smask! We are excited to have you on board. Go to our login page to get started. </p><a href="${domain}/login">Go to login</a>`,
    });
  } catch (error) {
    console.error("Error sending intro email:", error);
    throw new Error("Failed to send intro email");
  }
};

export const sendDeletionMail = async (email, name) => {
  if (!email || !name) {
    throw new Error("Email and name are required for sending deletion mail");
  }

  try {
    await resend.emails.send({
      from: `SMASK <smask@resend.dev>`,
      to: email,
      subject: `We are going to miss you ${name}`,
      html: `<p>Hi ${name},</p><p>Sorry to let you go. We have deleted your account and all your information from our service. It's been a great ride, hope to see you back soon!</p>`,
    });
  } catch (error) {
    console.error("Error sending deletion email:", error);
    throw new Error("Failed to send deletion email");
  }
};

export const sendResetLink = async (email, name, resetLink) => {
  if (!email || !name || !resetLink) {
    throw new Error(
      "Email, name, and resetLink are required for sending reset link",
    );
  }

  try {
    await resend.emails.send({
      from: `SMASK <smask@resend.dev>`,
      to: email,
      subject: "Password reset request - Smask",
      html: `
        <h1>Hi ${name}</h1>
        <h3>You requested to reset your password. If you did not request this, please ignore this email.</h3>
        <p>Click the link below to proceed:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });
  } catch (error) {
    console.error("Error sending reset link email:", error);
    throw new Error("Failed to send reset link email");
  }
};

export const sendConfirmPasswordReset = async (email, name) => {
  if (!email || !name) {
    throw new Error(
      "Email and name are required for sending password reset confirmation",
    );
  }

  const domain = process.env.BASE_URL;
  if (!domain) {
    throw new Error("BASE_URL environment variable is not set");
  }

  try {
    await resend.emails.send({
      from: `SMASK <smask@resend.dev>`,
      to: email,
      subject: "Your password has been reset",
      html: `<p>Hi ${name},</p><p>Your password has been reset. If you did not perform this action, please freeze your account immediately. Login with your new password here.</p><a href="${domain}/login">Go to login</a>`,
    });
  } catch (error) {
    console.error("Error sending password reset confirmation email:", error);
    throw new Error("Failed to send password reset confirmation email");
  }
};

export const sendChangedPasswordConfirmation = async (email, name) => {
  if (!email || !name) {
    throw new Error(
      "Email and name are required for sending password change confirmation",
    );
  }

  const domain = process.env.BASE_URL;
  if (!domain) {
    throw new Error("BASE_URL environment variable is not set");
  }

  try {
    await resend.emails.send({
      from: `SMASK <smask@resend.dev>`,
      to: email,
      subject: "Your password has been changed",
      html: `<p>Hi ${name},</p><p>Your password has been changed. If you did not perform this action, please freeze your account immediately. Login with your new password here.</p><a href="${domain}/login">Go to login</a>`,
    });
  } catch (error) {
    console.error("Error sending password change confirmation email:", error);
    throw new Error("Failed to send password change confirmation email");
  }
};

export const sendReminder = async (email, name, days) => {
  if (!email || !name || !days) {
    throw new Error(
      "Email, days and name are required for sending password change confirmation",
    );
  }

  const domain = process.env.BASE_URL;
  if (!domain) {
    throw new Error("BASE_URL environment variable is not set");
  }

  const daysList = days.map((day) => `<li>${day}</li>`).join("");

  try {
    await resend.emails.send({
      from: "SMASK <smask@resend.dev>",
      to: email,
      subject: "Missing attendance next week",
      html: `
        <p>Hi ${name},</p>
        <p>We would love to see you in the office for a delicious meal next week! Please update your attendance today, so the chef will know to cook up something nice for you!</p>
        <p>Missing days:</p>
        <ul>${daysList}</ul>
        <a href="${domain}">Go to Smask</a>
      `,
    });
  } catch (error) {
    console.error(`Failed to send reminder email to ${email}:`, error);
  }
};
