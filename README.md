# Sunny Hill

2. sınıf öğrencileri için İngilizce RPG oyunu. Unit 1: *What is a family?*

Çocuk Sunny Hill köyünde dolaşıyor, karakterlerle konuşuyor, görev alıyor ve
her görevde bir yıldız kazanıyor. Oyun, velilere hafta sonu gönderilmek üzere
hazırlandı; telefonda, tablette ve bilgisayarda çalışıyor.

## Oynamak

`sunny-hill.html` tek başına oyunun kendisi. İnternet, kurulum veya başka dosya
gerekmez; çift tıklayıp tarayıcıda açmak yeterli. Velilere yalnızca bu dosya
gönderilir.

- Bilgisayar: ok tuşları veya WASD ile yürünür, Boşluk / Enter ile konuşulur.
- Telefon / tablet: gidilecek yere dokunulur; bir karaktere dokununca yanına
  gidip konuşmaya başlar.
- İlerleme aynı cihazda, aynı tarayıcıda kaydedilir.

## Sesler

Oyun, cihazın kendi İngilizce seslerini kullanır ve her karaktere mümkünse ayrı bir ses verir
(çocuklara çocuk sesi, annelere kadın sesi, Captain Bob'a erkek sesi). İngilizce ses yoksa
Türkçe sesle okumaz; metin ekranda kalır ve veliye Chrome veya Edge ile açması söylenir.

- **Microsoft Edge** (internet açıkken): 40'tan fazla doğal İngilizce ses, çocuk sesleri dahil. En iyi sonuç.
- **Google Chrome** (internet açıkken): 3 İngilizce ses; çocuklar kadın sesinin inceltilmiş hâliyle konuşur.
- **iPhone / iPad (Safari)** ve **Android**: cihazın yüklü İngilizce sesleri.
- Türkçe Windows'ta internetsiz İngilizce ses isteniyorsa: Ayarlar › Zaman ve dil › Konuşma › Ses ekle › English (United States).

Veli ekranında hangi seslerin bulunduğu yazar; "Dinle" butonu birkaç karakteri sırayla konuşturur.

## Metinleri değiştirmek

Oyundaki bütün İngilizce metinler dosyanın başındaki `GAME_CONTENT` nesnesinde.
Kod bilmeden oradaki tırnak içindeki cümleler değiştirilebilir. `{name}` yazan
yere çocuğun adı gelir.

## Geliştirici notları

Dosya içindeki bölümler: Ayarlar, İçerik, Çizim, Oyuncu, Harita, NPC'ler,
Görevler, Mini oyunlar, Arayüz, Ses, Kayıt, Ana döngü. Bütün görseller Canvas 2D
ile kodla çiziliyor; ses tarayıcının Web Speech ve Web Audio API'leriyle
üretiliyor.

Değişiklikleri doğrulamak için headless Chrome ile çalışan bir test sürücüsü var
(Node 22+ ve Chrome gerekir, npm paketi yok). Oyunu velinin açtığı gibi
`file://` üzerinden açar:

```bash
node tools/drive.mjs tools/recipes/full.mjs       # 8 görevi baştan sona oynar, sertifikayı ve yenileme sonrası kaydı kontrol eder
node tools/drive.mjs tools/recipes/mobile.mjs     # veli ekranı → karakter → oyun; her mini oyun 375x667 dikey / 667x375 yatay
node tools/drive.mjs tools/recipes/nospeech.mjs   # sesli okuma desteği olmayan tarayıcıda oyunun takılmadığını kontrol eder
node tools/drive.mjs tools/recipes/nostorage.mjs  # localStorage kapalıyken oyunun çökmediğini kontrol eder
node tools/drive.mjs tools/recipes/quest1.mjs     # yalnızca Görev 1
node tools/drive.mjs tools/recipes/perf.mjs       # kare başına çizim süresi (üst sınır; headless yazılımla çizer)
node tools/drive.mjs tools/recipes/voices.mjs     # hangi karaktere hangi ses düştü, sesler gerçekten konuşuyor mu
```

Sürücü varsayılan olarak Chrome'u kullanır. Edge ile denemek için (gerçek İngilizce seslerle):

```bash
CHROME="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" node tools/drive.mjs tools/recipes/full.mjs
node tools/drive.mjs tools/recipes/overview.mjs   # köyün tamamının resmi
```

Ekran görüntüleri `tools/shots/` klasörüne yazılır (git'e girmez). Sürücü,
oyunun içindeki `window.SH` geliştirici kancasını kullanır.

---

ELT / Batuhan Özçönke
