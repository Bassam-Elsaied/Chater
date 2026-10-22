import { Resend } from "resend";

export const resendClient = new Resend(process.env.RESEND_API_KEY);

export const sender = {
  name: process.env.EMAIL_FROM_NAME,
  email: process.env.RESEND_FROM_EMAIL,
};

export const formatFrom = ({ name, email }) => {
  const safeName = String(name ?? "")
    .replace(/[<>"]/g, "")
    .trim();

  if (!safeName) return email;
  return `${safeName} <${email}>`;
};
