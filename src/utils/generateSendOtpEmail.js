const generateOTPEmailForResetPassword = (name, OTP) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .content {
      text-align: center;
      font-size: 16px;
      margin-bottom: 20px;
    }
    .otp-code {
      font-size: 28px;
      font-weight: bold;
      color: #4CAF50;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #888888;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Reset Your Password</div>
    <div class="content">
      <p>Dear ${name},</p>
      <p>We received a request to reset your password. Use the following code to proceed:</p>
      <div class="otp-code">${OTP}</div>
      <p>If you did not request a password reset, please ignore this email or contact support immediately.</p>
    </div>
    <div class="footer">&copy; 2025 Your Company Name. All rights reserved.</div>
  </div>
</body>
</html>

`
}

module.exports = generateOTPEmailForResetPassword