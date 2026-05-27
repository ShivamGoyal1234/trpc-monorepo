import { emailFrom, smtpTransporter } from "./client";
import {
  formResponseCreatorEmailHtml,
  formResponseCreatorEmailText,
} from "./templates/form-response-creator";
import {
  formResponseRespondentEmailHtml,
  formResponseRespondentEmailText,
} from "./templates/form-response-respondent";
import {
  passwordResetEmailHtml,
  passwordResetEmailText,
} from "./templates/password-reset";
import { welcomeEmailHtml, welcomeEmailText } from "./templates/welcome";

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  if (!smtpTransporter || !emailFrom) {
    return;
  }
  try {
    await smtpTransporter.sendMail({
      from: emailFrom,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
  } catch (error) {
    console.error("[email] Failed to send:", error);
  }
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  appUrl: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: "Welcome to FormCraft",
    html: welcomeEmailHtml(name, appUrl),
    text: welcomeEmailText(name, appUrl),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: "Reset your FormCraft password",
    html: passwordResetEmailHtml(name, resetUrl),
    text: passwordResetEmailText(name, resetUrl),
  });
}

export async function sendFormResponseCreatorEmail(
  to: string,
  creatorName: string,
  formTitle: string,
  responseCount: number,
  dashboardUrl: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: `New response: ${formTitle}`,
    html: formResponseCreatorEmailHtml(
      creatorName,
      formTitle,
      responseCount,
      dashboardUrl,
    ),
    text: formResponseCreatorEmailText(
      creatorName,
      formTitle,
      responseCount,
      dashboardUrl,
    ),
  });
}

export async function sendFormResponseRespondentEmail(
  to: string,
  formTitle: string,
  submitMessage: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: `Response received: ${formTitle}`,
    html: formResponseRespondentEmailHtml(formTitle, submitMessage),
    text: formResponseRespondentEmailText(formTitle, submitMessage),
  });
}
