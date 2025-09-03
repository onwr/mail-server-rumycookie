const express = require('express');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const config = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Nodemailer transporter
const transporter = nodemailer.createTransport(config.smtp);

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Configuration Error:', error);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

// Helper function to load and compile HTML templates
const loadTemplate = (templateName) => {
  const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  return handlebars.compile(templateSource);
};

// Helper function to format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper function to get status text
const getStatusText = (status) => {
  const statusMap = {
    pending: 'Beklemede',
    confirmed: 'Onaylandı',
    preparing: 'Hazırlanıyor',
    shipped: 'Kargoya Verildi',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
  };
  return statusMap[status] || status;
};

// Helper function to get payment method text
const getPaymentMethodText = (method) => {
  const methodMap = {
    iban: 'IBAN/Havale',
    paytr: 'Kredi Kartı (PayTR)',
  };
  return methodMap[method] || method;
};

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Mail server is running',
    timestamp: new Date().toISOString(),
  });
});

// Send order created email to admin
app.post('/api/send-order-created', async (req, res) => {
  try {
    const orderData = req.body;

    // Validate required fields
    if (!orderData.orderNumber || (!orderData.customerEmail && !orderData.userEmail)) {
      return res.status(400).json({
        error: 'Missing required fields: orderNumber, customerEmail or userEmail',
      });
    }

    // Load and compile template
    const template = loadTemplate('orderCreated');

    // Prepare template data
    const templateData = {
      orderNumber: orderData.orderNumber,
      status: getStatusText(orderData.status),
      orderDate: formatDate(orderData.createdAt),
      customerName: orderData.shipping?.fullName || 'Bilinmiyor',
      customerEmail: orderData.shipping?.email || orderData.userEmail || orderData.customerEmail,
      customerPhone: orderData.shipping?.phone || 'Bilinmiyor',
      customerAddress: orderData.shipping?.address || 'Bilinmiyor',
      customText: orderData.shipping?.customText || '',
      deliveryDate: orderData.shipping?.deliveryDate
        ? new Date(orderData.shipping.deliveryDate).toLocaleDateString('tr-TR')
        : '',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      shippingCost: orderData.shippingCost || 0,
      total: orderData.total || 0,
      currency: orderData.currency || '₺',
      shippingText:
        orderData.shippingCost === 0
          ? 'Ücretsiz Kargo'
          : `${orderData.shippingCost}${orderData.currency || '₺'}`,
      paymentMethod: getPaymentMethodText(orderData.payment?.method),
      notes: orderData.shipping?.notes || '',
    };

    // Generate HTML content
    const htmlContent = template(templateData);

    // Email options
    const mailOptions = {
      from: `"Rumy Cookies" <${config.smtp.auth.user}>`,
      to: config.adminEmail,
      subject: `🍪 Yeni Sipariş: ${orderData.orderNumber} - Rummy Cookies`,
      html: htmlContent,
      text: `Yeni sipariş alındı!\n\nSipariş No: ${orderData.orderNumber}\nMüşteri: ${templateData.customerName}\nE-posta: ${templateData.customerEmail}\nToplam: ${templateData.total}${templateData.currency}`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Order created email sent to admin:', info.messageId);

    res.json({
      success: true,
      message: 'Order created email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Error sending order created email:', error);
    res.status(500).json({
      error: 'Failed to send order created email',
      details: error.message,
    });
  }
});

// Send order shipped email to customer
app.post('/api/send-order-shipped', async (req, res) => {
  try {
    const { orderData, shippingInfo } = req.body;

    // Validate required fields
    if (
      !orderData.orderNumber ||
      (!orderData.shipping?.email && !orderData.customerEmail && !orderData.userEmail) ||
      !shippingInfo.trackingNumber ||
      !shippingInfo.shippingCompany
    ) {
      return res.status(400).json({
        error:
          'Missing required fields: orderNumber, customerEmail, trackingNumber, shippingCompany',
      });
    }

    // Load and compile template
    const template = loadTemplate('orderShipped');

    // Prepare template data
    const templateData = {
      orderNumber: orderData.orderNumber,
      orderDate: formatDate(orderData.createdAt),
      shippingDate: formatDate(new Date()),
      customerName: orderData.shipping?.fullName || orderData.customer || 'Bilinmiyor',
      customerPhone: orderData.shipping?.phone || orderData.phone || 'Bilinmiyor',
      customerAddress: orderData.shipping?.address || orderData.address || 'Bilinmiyor',
      deliveryDate: orderData.shipping?.deliveryDate
        ? new Date(orderData.shipping.deliveryDate).toLocaleDateString('tr-TR')
        : '',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      shippingCost: orderData.shippingCost || 0,
      total: orderData.total || 0,
      currency: orderData.currency || '₺',
      shippingText:
        orderData.shippingCost === 0
          ? 'Ücretsiz Kargo'
          : `${orderData.shippingCost}${orderData.currency || '₺'}`,
      customText: orderData.shipping?.customText || '',
      trackingNumber: shippingInfo.trackingNumber,
      shippingCompany: shippingInfo.shippingCompany,
      trackingUrl: shippingInfo.trackingUrl || '',
    };

    // Generate HTML content
    const htmlContent = template(templateData);

    // Email options
    const customerEmail =
      orderData.shipping?.email || orderData.customerEmail || orderData.userEmail;
    const mailOptions = {
      from: `"Rumy Cookies" <${config.smtp.auth.user}>`,
      to: customerEmail,
      subject: `🚚 Siparişiniz Kargoya Verildi: ${orderData.orderNumber} - Rummy Cookies`,
      html: htmlContent,
      text: `Siparişiniz kargoya verildi!\n\nSipariş No: ${orderData.orderNumber}\nKargo Firması: ${shippingInfo.shippingCompany}\nTakip No: ${shippingInfo.trackingNumber}`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Order shipped email sent to customer:', info.messageId);

    res.json({
      success: true,
      message: 'Order shipped email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Error sending order shipped email:', error);
    res.status(500).json({
      error: 'Failed to send order shipped email',
      details: error.message,
    });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    const mailOptions = {
      from: `"Rummy Cookies" <${config.smtp.auth.user}>`,
      to: to || config.adminEmail,
      subject: subject || 'Test Email - Rummy Cookies Mail Server',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b5755c;">🍪 Rummy Cookies Mail Server Test</h2>
          <p>Bu bir test e-postasıdır.</p>
          <p><strong>Mesaj:</strong> ${message || 'Mail server başarıyla çalışıyor!'}</p>
          <p><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    res.status(500).json({
      error: 'Failed to send test email',
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /api/send-order-created',
      'POST /api/send-order-shipped',
      'POST /api/test-email',
    ],
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Mail server is running on port ${PORT}`);
  console.log(`📧 SMTP User: ${config.smtp.auth.user}`);
  console.log(`👤 Admin Email: ${config.adminEmail}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
