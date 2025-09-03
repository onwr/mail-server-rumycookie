// Mail Server Configuration
module.exports = {
  port: process.env.PORT || 3001,

  // Gmail SMTP Configuration
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'rumycookieinfo@gmail.com',
      pass: 'lomk hzto crnl yggc',
    },
  },

  // Admin Email
  adminEmail: 'kurkayayazilim@gmail.com',

  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
