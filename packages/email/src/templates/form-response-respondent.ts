export function formResponseRespondentEmailHtml(
  formTitle: string,
  submitMessage: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Response received</title></head>
<body style="font-family: Inter, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1>Thank you!</h1>
  <p>Your response to <strong>${formTitle}</strong> has been received.</p>
  <p>${submitMessage}</p>
</body>
</html>`;
}

export function formResponseRespondentEmailText(
  formTitle: string,
  submitMessage: string,
): string {
  return `Thank you! Your response to "${formTitle}" has been received.\n\n${submitMessage}`;
}
