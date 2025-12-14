Telefon Doğrulama Projesi
=======================================

Klasör yapısı:
- docker-compose.yml
- db/
  - init.sql
-api/
  - Dockerfile
  - package.json
-fronted/
  - Dockerfile
  - image.png
  - index.html
  - list.html
  - ngnix.conf
  - style.css

Çalıştırma Adımları (özet):
1. Bu klasörde bir terminal açın.
2. docker compose up -d komutunu çalıştırın.
3. docker ps ile konteynerlerin çalıştığını doğrulayın.
4. Tarayıcıdan http://localhost adresine giderek web arayüzüne erişin.
5. Uygun kurallara uyan telefon numaraları sisteme kaydedilir.
6. Uymayan kurallar kaydedilmez.
7. Kayıtlı numaralar tekrardan kaydedilmez.
8. Yetkili Girişi ile kaydedilen veriler gözükür.

Not: Server.js içinde yetkili bilgileri vardır.

api
1. /api/phone/validate : numaranın 6 haneli olması istenir uymazsa
verilen hata mesajları numara eksik yada 6 haneli olmalıdır.
2./api/registration : numaranın kurallara uyup uymadığına bakarız.
uygunsa "Telefon numarası geçerli, kayıt başarıyla oluşturuldu.",
eğer uymazsa "Geçersiz telefon numarası. Lütfen yeni bir numara deneyin.",
mesajı verilir.
3.'/api/phone/count : kurala uyan kaç tane telefon numarası vardır.
