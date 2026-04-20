export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  console.log("📧 Sending email (mock):");
  console.log({ to, subject, html });
};