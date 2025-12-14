const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'phone_db'
});

function validatePhone(phone) {
   
    if (!/^\d{6}$/.test(phone)) return { isValid: false, error: "Format hatası: 6 haneli rakam olmalı." };
    
    const digits = phone.split('').map(Number);
    
    const hasNonZero = digits.some(d => d !== 0);
    
    const sumFirst = digits[0] + digits[1] + digits[2];
    const sumLast = digits[3] + digits[4] + digits[5];
    
    const sumOdd = digits[0] + digits[2] + digits[4]; 
    const sumEven = digits[1] + digits[3] + digits[5]; 

    const rules = {
        hasNonZeroDigit: hasNonZero,
        sumFirstEqualsLast: sumFirst === sumLast,
        sumOddEqualsEven: sumOdd === sumEven
    };

    const isValid = rules.hasNonZeroDigit && rules.sumFirstEqualsLast && rules.sumOddEqualsEven;
    return { isValid, rules, number: phone };
}

app.post('/api/phone/validate', (req, res) => {
    const { number } = req.body;
    if (!number) return res.status(400).send({ message: "Numara eksik" });
    
    const result = validatePhone(number);
    if (!/^\d{6}$/.test(number)) return res.status(400).send({ message: "6 haneli rakam olmalı" });

    res.json(result);
});

app.post('/api/registration', (req, res) => {
   const name = req.body.name ? req.body.name.trim() : '';      
    const email = req.body.email ? req.body.email.trim() : '';  
    const phone = req.body.phone ? req.body.phone.trim() : '';

    const ADMIN_NAME = 'sevval';
    const ADMIN_EMAIL = 'sevval@example.com';
    const ADMIN_PHONE = '456456'; 
    
    if (name === ADMIN_NAME && email === ADMIN_EMAIL && phone === ADMIN_PHONE) {
         if (!validatePhone(phone).isValid) {
             return res.status(401).json({ status: "denied", message: "Yönetici telefon numarasının formatı geçersiz." });
         }
        return res.json({ 
            status: "admin_success", 
            message: "Yönetici olarak giriş başarılı. Yönlendiriliyorsunuz...",
            token: "simple-auth-token" 
        });
    }

    if (!name || !email || !phone) {
        return res.status(400).json({ status: "denied", message: "Lütfen tüm alanları doldurun." });
    }
    
    const validation = validatePhone(phone);
    
    if (!validation.isValid) {
        return res.status(422).json({
            status: "denied",
            message: "Geçersiz telefon numarası. Lütfen yeni bir numara deneyin.",
            isValid: false
        });
    }

    const query = 'INSERT INTO registrations (name, email, phone) VALUES (?, ?, ?)';
    db.query(query, [name, email, phone], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ status: "denied", message: "Bu numara zaten kayıtlı." });
            }
            console.error("DB Kayıt Hatası:", err);
            return res.status(500).json({ error: "Sunucu hatası: Kayıt yapılamadı." });
        }
        res.status(201).json({
            status: "accepted",
            message: "Telefon numarası geçerli, kayıt başarıyla oluşturuldu.",
            data: { id: result.insertId, name, email, phone }
        });
    });
});

app.get('/api/phone/count', (req, res) => {
    let count = 0;
    for (let i = 0; i <= 999999; i++) {
        let s = i.toString().padStart(6, '0');
        if (validatePhone(s).isValid) {
            count++;
        }
    }
    res.json({ totalValidNumbers: count });
});

app.get('/api/registrations', (req, res) => {
const query = 'SELECT id, name, email, phone, created_at FROM registrations ORDER BY id DESC LIMIT 10';    
    db.query(query, (err, results) => {
        if (err) {
            console.error("DB Listeleme Hatası:", err);
            return res.status(500).json({ error: "Sunucu hatası: Kayıtlar getirilemedi." });
        }
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`API çalışıyor: Port ${PORT}`);
});
