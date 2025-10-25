import axios from "axios";

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const response = await axios.post(
      "https://api.sendgrid.com/v3/mail/send",
      { 
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.EMAIL_USER },
        subject,
        content: [
          { type: "text/plain", value: text },
          ...(html ? [{ type: "text/html", value: html }] : []),
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error real de SendGrid:", err.response?.data || err.message);
    throw err;
  }
};