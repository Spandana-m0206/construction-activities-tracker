const generatePasswordForNewUser = (name, password) => {
    return `
        <html>
            <head>
                <style>
                    body {
                        background-color: #f4f4f4;
                        font-family: Arial, sans-serif;
                        padding: 0;
                        margin: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        padding: 20px;
                        background: #ffffff;
                        border-radius: 12px;
                        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }
                    .header {
                        background: linear-gradient(135deg, #6e57e0, #9b51e0);
                        padding: 20px;
                        color: #ffffff;
                        font-size: 22px;
                        font-weight: bold;
                        border-top-left-radius: 12px;
                        border-top-right-radius: 12px;
                    }
                    .content {
                        padding: 20px;
                        font-size: 16px;
                        color: #333;
                        line-height: 1.6;
                    }
                    .password-box {
                        display: inline-block;
                        background: #6e57e0;
                        color: #ffffff;
                        padding: 10px 20px;
                        font-size: 18px;
                        font-weight: bold;
                        border-radius: 8px;
                        margin: 10px 0;
                    }
                    .footer {
                        margin-top: 20px;
                        padding: 15px;
                        font-size: 14px;
                        color: #777;
                        background: #f4f4f4;
                        border-bottom-left-radius: 12px;
                        border-bottom-right-radius: 12px;
                    }
                    .button {
                        display: inline-block;
                        background: #6e57e0;
                        color: #ffffff;
                        text-decoration: none;
                        padding: 12px 20px;
                        font-size: 16px;
                        font-weight: bold;
                        border-radius: 8px;
                        margin-top: 10px;
                    }
                    .button:hover {
                        background: #5438c7;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">🎉 Welcome to Maguz, ${name}! 🎉</div>
                    <div class="content">
                        <p>We are excited to have you on board! Your account has been successfully created.</p>
                        <p><strong>Your Temporary Password:</strong></p>
                        <div class="password-box">${password}</div>
                        <p>Please log in and change your password as soon as possible for security reasons.</p>
                       
                    </div>
                    <div class="footer">
                        <p>Thank you for joining us! 💜</p>
                        <p>Best Regards, <br> The Team</p>
                    </div>
                </div>
            </body>
        </html>
    `;
};


module.exports=generatePasswordForNewUser
