export function welcomeEmailHtml(name: string, appUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to FormCraft</title></head>
<body style="font-family: Inter, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #0066cc;">Welcome to FormCraft, ${name}!</h1>
  <p>Your account is ready. Start building beautiful forms in minutes.</p>
  <p><a href="${appUrl}/dashboard" style="display: inline-block; background: #0066cc; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Go to Dashboard</a></p>
  <p style="color: #64748b; font-size: 14px;">If you did not create this account, you can ignore this email.</p>
</body>
</html>`;
}

export function welcomeEmailText(name: string, appUrl: string): string {
  return `Welcome to FormCraft, ${name}!\n\nYour account is ready. Visit ${appUrl}/dashboard to get started.`;
}
