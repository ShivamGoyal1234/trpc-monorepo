export function passwordResetEmailHtml(
  name: string,
  resetUrl: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset your password</title></head>
<body style="font-family: Inter, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1>Reset your password</h1>
  <p>Hi ${name},</p>
  <p>We received a request to reset your FormCraft password. Click the button below to choose a new password. This link expires in 1 hour.</p>
  <p><a href="${resetUrl}" style="display: inline-block; background: #0066cc; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Reset Password</a></p>
  <p style="color: #64748b; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
</body>
</html>`;
}

export function passwordResetEmailText(name: string, resetUrl: string): string {
  return `Hi ${name},\n\nReset your FormCraft password: ${resetUrl}\n\nThis link expires in 1 hour.`;
}
