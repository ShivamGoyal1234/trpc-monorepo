export function formResponseCreatorEmailHtml(
  creatorName: string,
  formTitle: string,
  responseCount: number,
  dashboardUrl: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New form response</title></head>
<body style="font-family: Inter, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1>New response received</h1>
  <p>Hi ${creatorName},</p>
  <p>Someone just submitted a response to <strong>${formTitle}</strong>.</p>
  <p>Your form now has <strong>${responseCount}</strong> total response${responseCount === 1 ? "" : "s"}.</p>
  <p><a href="${dashboardUrl}" style="display: inline-block; background: #0066cc; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View Responses</a></p>
</body>
</html>`;
}

export function formResponseCreatorEmailText(
  creatorName: string,
  formTitle: string,
  responseCount: number,
  dashboardUrl: string,
): string {
  return `Hi ${creatorName},\n\nNew response on "${formTitle}". Total responses: ${responseCount}.\n\nView: ${dashboardUrl}`;
}
