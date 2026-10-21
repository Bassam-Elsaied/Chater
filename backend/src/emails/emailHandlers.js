import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplate.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    const response = await resendClient.emails.send({
      from: sender.email,
      to: email,
      subject: "Welcome to Chater",
      html: createWelcomeEmailTemplate(name, clientURL),
    });
  } catch (error) {
    console.error(`Error sending welcome email: ${error.message}`);
    throw error;
  }
};
