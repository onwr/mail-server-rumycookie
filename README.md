# Rummy Cookies Mail Server

Bu proje, Rummy Cookies e-ticaret sitesi için mail gönderme servisidir. Node.js ve Nodemailer kullanılarak geliştirilmiştir.

## Özellikler

- ✅ Sipariş oluşturulduğunda admin'e mail gönderme
- ✅ Kargoya verildiğinde müşteriye mail gönderme
- ✅ Güzel HTML email şablonları
- ✅ Gmail SMTP entegrasyonu
- ✅ RESTful API endpoints

## Kurulum

1. **Bağımlılıkları yükleyin:**

```bash
cd mail-server
npm install
```

2. **Mail server'ı başlatın:**

```bash
npm start
```

Geliştirme modu için:

```bash
npm run dev
```

## API Endpoints

### Health Check

```
GET /health
```

### Sipariş Oluşturuldu Maili

```
POST /api/send-order-created
Content-Type: application/json

{
  "orderNumber": "RUM-12345678",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "shipping": {
    "fullName": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "phone": "+90 555 123 45 67",
    "address": "Test Adres",
    "customText": "Doğum günün kutlu olsun!",
    "deliveryDate": "2024-01-15"
  },
  "items": [
    {
      "name": "Özel Kurabiye",
      "quantity": 12,
      "price": 25.00,
      "currency": "₺",
      "subtotal": 300.00
    }
  ],
  "subtotal": 300.00,
  "shippingCost": 25.00,
  "total": 325.00,
  "currency": "₺",
  "payment": {
    "method": "iban"
  }
}
```

### Kargoya Verildi Maili

```
POST /api/send-order-shipped
Content-Type: application/json

{
  "orderData": {
    "orderNumber": "RUM-12345678",
    "shipping": {
      "email": "ahmet@example.com",
      "fullName": "Ahmet Yılmaz"
    }
  },
  "shippingInfo": {
    "trackingNumber": "1234567890123456",
    "shippingCompany": "Aras Kargo",
    "trackingUrl": "https://www.araskargo.com.tr/takip/1234567890123456"
  }
}
```

### Test Maili

```
POST /api/test-email
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Email",
  "message": "Bu bir test e-postasıdır."
}
```

## Konfigürasyon

Mail server konfigürasyonu `config.js` dosyasında yapılır:

```javascript
module.exports = {
  port: 3001,
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'rumycookieinfo@gmail.com',
      pass: 'lomk hzto crnl yggc',
    },
  },
  adminEmail: 'kurkayayazilim@gmail.com',
  frontendUrl: 'http://localhost:5173',
};
```

## Email Şablonları

Email şablonları `templates/` klasöründe bulunur:

- `orderCreated.html` - Sipariş oluşturuldu maili
- `orderShipped.html` - Kargoya verildi maili

Şablonlar Handlebars template engine kullanır.

## Gmail SMTP Ayarları

Gmail SMTP kullanmak için:

1. Gmail hesabında 2FA aktif olmalı
2. App Password oluşturulmalı
3. App Password `config.js` dosyasında kullanılmalı

## Frontend Entegrasyonu

Frontend'den mail server'a istek göndermek için:

```javascript
// Sipariş oluşturuldu maili
const response = await fetch('http://localhost:3001/api/send-order-created', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(orderData),
});

// Kargoya verildi maili
const response = await fetch('http://localhost:3001/api/send-order-shipped', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderData: order,
    shippingInfo: shippingInfo,
  }),
});
```

## Hata Yönetimi

Mail gönderimi başarısız olsa bile, ana işlem (sipariş oluşturma, durum güncelleme) devam eder. Hatalar console'a loglanır.

## Güvenlik

- CORS aktif
- Input validation
- Error handling
- SMTP güvenli bağlantı

## Lisans

MIT License - Kürkaya Yazılım © 2024
