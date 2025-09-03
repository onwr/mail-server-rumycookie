// Mail Server Test Script
const fetch = require('node-fetch');

const MAIL_SERVER_URL = 'http://localhost:3001';

// Test data
const testOrderData = {
  orderNumber: 'RUM-TEST123',
  status: 'pending',
  createdAt: new Date().toISOString(),
  shipping: {
    fullName: 'Test Müşteri',
    email: 'test@example.com',
    phone: '+90 555 123 45 67',
    address: 'Test Adres, Test Mahallesi, Test Şehir',
    customText: 'Test yazı - Doğum günün kutlu olsun!',
    deliveryDate: '2024-12-25',
  },
  items: [
    {
      name: 'Özel Kurabiye',
      quantity: 12,
      price: 25.0,
      currency: '₺',
      subtotal: 300.0,
    },
    {
      name: 'Çikolatalı Kurabiye',
      quantity: 6,
      price: 30.0,
      currency: '₺',
      subtotal: 180.0,
    },
  ],
  subtotal: 480.0,
  shippingCost: 25.0,
  total: 505.0,
  currency: '₺',
  payment: {
    method: 'iban',
  },
};

const testShippingInfo = {
  trackingNumber: 'TEST123456789',
  shippingCompany: 'Test Kargo',
  trackingUrl: 'https://www.testkargo.com.tr/takip/TEST123456789',
};

// Test functions
async function testHealthCheck() {
  console.log('🔍 Health Check testi...');
  try {
    const response = await fetch(`${MAIL_SERVER_URL}/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data);
    return true;
  } catch (error) {
    console.error('❌ Health Check hatası:', error.message);
    return false;
  }
}

async function testOrderCreatedEmail() {
  console.log('📧 Sipariş oluşturuldu maili testi...');
  try {
    const response = await fetch(`${MAIL_SERVER_URL}/api/send-order-created`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Sipariş oluşturuldu maili gönderildi:', data.messageId);
      return true;
    } else {
      console.error('❌ Sipariş oluşturuldu maili hatası:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Sipariş oluşturuldu maili hatası:', error.message);
    return false;
  }
}

async function testOrderShippedEmail() {
  console.log('🚚 Kargoya verildi maili testi...');
  try {
    const response = await fetch(`${MAIL_SERVER_URL}/api/send-order-shipped`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderData: testOrderData,
        shippingInfo: testShippingInfo,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Kargoya verildi maili gönderildi:', data.messageId);
      return true;
    } else {
      console.error('❌ Kargoya verildi maili hatası:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Kargoya verildi maili hatası:', error.message);
    return false;
  }
}

async function testCustomEmail() {
  console.log('📨 Özel test maili...');
  try {
    const response = await fetch(`${MAIL_SERVER_URL}/api/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'kurkayayazilim@gmail.com',
        subject: 'Mail Server Test - Rummy Cookies',
        message: 'Mail server başarıyla çalışıyor! 🎉',
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Test maili gönderildi:', data.messageId);
      return true;
    } else {
      console.error('❌ Test maili hatası:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Test maili hatası:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Rummy Cookies Mail Server Test Başlıyor...\n');

  const results = {
    healthCheck: await testHealthCheck(),
    orderCreated: await testOrderCreatedEmail(),
    orderShipped: await testOrderShippedEmail(),
    customEmail: await testCustomEmail(),
  };

  console.log('\n📊 Test Sonuçları:');
  console.log('==================');
  console.log(`Health Check: ${results.healthCheck ? '✅' : '❌'}`);
  console.log(`Sipariş Oluşturuldu: ${results.orderCreated ? '✅' : '❌'}`);
  console.log(`Kargoya Verildi: ${results.orderShipped ? '✅' : '❌'}`);
  console.log(`Test Maili: ${results.customEmail ? '✅' : '❌'}`);

  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(
    `\n🎯 Başarı Oranı: ${successCount}/${totalTests} (${Math.round((successCount / totalTests) * 100)}%)`
  );

  if (successCount === totalTests) {
    console.log('🎉 Tüm testler başarılı! Mail server hazır.');
  } else {
    console.log('⚠️ Bazı testler başarısız. Lütfen konfigürasyonu kontrol edin.');
  }
}

// Run tests
runTests().catch(console.error);
