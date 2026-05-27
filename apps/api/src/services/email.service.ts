import {
  sendFormResponseCreatorEmail,
  sendFormResponseRespondentEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@repo/email";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const emailService = {
  sendWelcome: (to: string, name: string) =>
    sendWelcomeEmail(to, name, appUrl),

  sendPasswordReset: (to: string, name: string, token: string) => {
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    return sendPasswordResetEmail(to, name, resetUrl);
  },

  sendFormResponseToCreator: (
    to: string,
    creatorName: string,
    formTitle: string,
    responseCount: number,
    formId: string,
  ) =>
    sendFormResponseCreatorEmail(
      to,
      creatorName,
      formTitle,
      responseCount,
      `${appUrl}/dashboard/forms/${formId}/responses`,
    ),

  sendFormResponseToRespondent: (
    to: string,
    formTitle: string,
    submitMessage: string,
  ) => sendFormResponseRespondentEmail(to, formTitle, submitMessage),
};
