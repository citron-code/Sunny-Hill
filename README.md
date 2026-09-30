# Sunny Hill

2. sınıf öğrencileri için İngilizce RPG oyunu. Unit 1: *What is a family?*

Çocuk Sunny Hill köyünde dolaşıyor, karakterlerle konuşuyor, görev alıyor ve
her görevde bir yıldız kazanıyor. Oyun, velilere hafta sonu gönderilmek üzere
hazırlandı; telefonda, tablette ve bilgisayarda çalışıyor.

## Oynamak

Çevrimiçi oynamak için: **https://citron-code.github.io/Sunny-Hill/** (velilere bu link gönderilebilir;
iPhone dahil her cihazda tarayıcıda açılır).

`sunny-hill.html` tek başına oyunun kendisi. İnternet, kurulum veya başka dosya
gerekmez; çift tıklayıp tarayıcıda açmak yeterli. Velilere yalnızca bu dosya
gönderilir.

- Bilgisayar: ok tuşları veya WASD ile yürünür, Boşluk / Enter ile konuşulur.
- Telefon / tablet: sol alttaki joystick ile yürünür (az itince yavaş, çok itince hızlı);
  sağ alttaki sarı düğme yakındaki karakterle konuşur ya da eşyayı alır / koyar. Düğmenin
  üzerinde ne yapacağı İngilizce yazar (Talk, Take, Put, Give, Open, Look). Joystick
  başparmağın dokunduğu yere gelir; iki el aynı anda kullanılabilir. Gidilecek yere ya da bir
  karaktere dokunarak yürümek de çalışır.
- Oyun açıldığı cihazı kendisi anlar (telefon, tablet, bilgisayar); veli ekranında yazar.
  Dokunmatik ekranlı bir bilgisayarda ekrana ilk dokunuşta joystick ve düğme belirir.
- İlerleme aynı cihazda, aynı tarayıcıda kaydedilir.

Oyun açılınca köyün üzerinde ana menü gelir: kayıtlı oyun varsa **Continue** (çocuğun adı,
yıldızları ve bulduğu sürprizlerle), her zaman **New Game**. New Game kayıtlı ilerlemeyi silmeden
önce sorar. Oyun sırasında ⚙️ menüsünden ses, konuşma hızı, 3D/2D, kıyafetler, bilgi ekranı ve
**Main menu** (oyunu kaydedip ana menüye döner) seçilebilir.

## Karakterler

Karakterler büyük parlak gözlü, yuvarlak kafalı low-poly figürler. Göz, yanak ve ağız kafanın
üzerine çizilmiş küçük bir resim; göz kırpma, gülümseme ve konuşma bu resmin değişmesiyle olur.
Dururken nefes alırlar, göz kırparlar, etrafa bakar, başlarını eğer, zıplar ya da gerinirler.
Yürürken kolları ve saçları sallanır. Konuşma penceresindeki resim de canlıdır; konuşan karakterin
ağzı konuşma süresince oynar.

Çocuk karakterini oluştururken 8 saç stili (dikenli, kısa, kıvırcık, küt, at kuyruğu, iki yandan
toplu, uzun, örgülü), 6 saç rengi, 6 kıyafet (tişört, çizgili tişört, kapüşonlu, tulum, elbise,
etek), 6 kıyafet rengi ve 5 ten rengi arasından seçer. Seçilen her şeyin İngilizce adı sesli
okunur. Eski kayıtlar kendiliğinden yeni seçeneklere çevrilir.

## Görünüm: 3D ve 2D

Köy low-poly 3D olarak çizilir. Oyuncunun önüne giren ağaç ve binalar yarı saydam olur.
Oyun menüsündeki **View** anahtarıyla veya ana menüdeki 🧊 3D düğmesiyle sade 2D görünüme geçilebilir; seçim kaydedilir.

- Tarayıcıda WebGL yoksa oyun kendiliğinden 2D açılır.
- Cihaz 3D için yavaşsa oyun önce çözünürlüğü düşürür, yine yetmezse 2D'ye geçer.

## Gizli sürprizler

Köyde 8 gizli sürpriz var; bulmak isteğe bağlı, menüde ve sertifikada "Secrets x / 8" olarak sayılır:
bankta uyuyan kedi, çeşmede gökkuşağı, meydandan göle giden renkli müzik taşları, göldeki
ördek ailesi, nilüfer yaprağındaki kurbağa, tarladaki korkuluk, çiçek çayırındaki tavşan ve
ormandaki patikanın sonunda bir hazine sandığı. Konuşan hayvanların cümleleri `GAME_CONTENT.secrets`
içindedir. Haritada ayrıca yel değirmeni, piknik örtüsü, uçurtma ve elma bahçesi var.

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
Görevler, Mini oyunlar, Arayüz, Ses, Kayıt, Ana döngü; 3D Çizim bölümü Çizim'in
hemen ardından gelir. Bütün görseller kodla çiziliyor: 3D görünüm dosyanın içinde
yazılmış küçük bir WebGL çizicisiyle, 2D yedek görünüm Canvas 2D ile. Ses
tarayıcının Web Speech ve Web Audio API'leriyle üretiliyor.

Değişiklikleri doğrulamak için headless Chrome ile çalışan bir test sürücüsü var
(Node 22+ ve Chrome gerekir, npm paketi yok). Oyunu velinin açtığı gibi
`file://` üzerinden açar:

```bash
node tools/drive.mjs tools/recipes/full.mjs       # 8 görevi baştan sona oynar, sertifikayı ve yenileme sonrası kaydı kontrol eder
node tools/drive.mjs tools/recipes/mobile.mjs     # ana menü → veli ekranı → karakter → oyun; her mini oyun 375x667 dikey / 667x375 yatay
node tools/drive.mjs tools/recipes/menus.mjs      # ana menü (ilk açılış / kayıtlı oyun), oyun menüsü, New Game sorusu; masaüstü, telefon, yatay telefon
node tools/drive.mjs tools/recipes/nospeech.mjs   # sesli okuma desteği olmayan tarayıcıda oyunun takılmadığını kontrol eder
node tools/drive.mjs tools/recipes/nostorage.mjs  # localStorage kapalıyken oyunun çökmediğini kontrol eder
node tools/drive.mjs tools/recipes/quest1.mjs     # yalnızca Görev 1
node tools/drive.mjs tools/recipes/perf.mjs       # kare başına çizim süresi (üst sınır; headless yazılımla çizer)
node tools/drive.mjs tools/recipes/voices.mjs     # hangi karaktere hangi ses düştü, sesler gerçekten konuşuyor mu
node tools/drive.mjs tools/recipes/nowebgl.mjs    # WebGL olmayan tarayıcı: oyun 2D açılıp baştan sona oynanıyor mu
node tools/drive.mjs tools/recipes/switchview.mjs # menüden 3D ↔ 2D geçişi ve seçimin kaydı
node tools/drive.mjs tools/recipes/look3d.mjs     # köyün birkaç yerinden 3D ekran görüntüsü
node tools/drive.mjs tools/recipes/scenes3d.mjs   # her görevin sahnesi 3D
node tools/drive.mjs tools/recipes/gallery3d.mjs  # bütün karakter, hayvan ve bina modelleri yakından
node tools/drive.mjs tools/recipes/people3d.mjs   # karakterler yakından: her saç stili ve kıyafet, yüz resimleri, yürüme ve boşta durma kareleri
node tools/drive.mjs tools/recipes/people2d.mjs   # aynı karakterler 2D yedek görünümde
node tools/drive.mjs tools/recipes/characters.mjs # karakter oluşturma gerçek tıklamalarla; konuşma penceresindeki resmin canlı olduğunu kontrol eder
node tools/drive.mjs tools/recipes/touch.mjs      # telefon / tablet / bilgisayar algılama; joystick ve eylem düğmesi gerçek dokunuşlarla, iki başparmakla
node tools/drive.mjs tools/recipes/walk3d.mjs     # at, keçi, kuzu ve Sparky'nin yürüyüş adımları yandan; Sparky'nin oyuncuya uzaklığı
node tools/drive.mjs tools/recipes/restart.mjs    # baştan başlama gerçek tıklamalarla: Menu → Main menu → New Game, diyalog açıkken, sertifikadaki Play again; 3 ekran boyutunda
node tools/drive.mjs tools/recipes/restart-inplace.mjs  # yarım kalmış karışık bir oyunu sıfırlayıp Görev 1'i yeniden oynar; yatay telefonda bütün butonlara erişim
node tools/drive.mjs tools/recipes/photo.mjs      # aile fotoğrafı (küçük, kalabalık, yalnız çocuklar) 3D ve 2D: arka sıradakiler görünüyor mu
node tools/drive.mjs tools/recipes/eggs.mjs       # 8 gizli sürprizi bir çocuk gibi bulur, sayacı kontrol eder
node tools/drive.mjs tools/recipes/map3d.mjs      # köyün tamamı yukarıdan (3D; OVERVIEW2D=1 ile 2D harita da)
node tools/drive.mjs tools/recipes/overview.mjs   # köyün tamamının resmi (2D harita)
```

Sürücü Chrome'u yazılımsal WebGL ile çalıştırır: 3D görüntü alınır ama yavaştır, bu yüzden
buradan ölçülen kare süreleri bir şey ifade etmez. Gerçek ekran kartıyla ölçmek için:

```bash
GL=gpu node tools/drive.mjs tools/recipes/fps3d.mjs
```

Tam oynanış testlerini 3D'de gerçek zamana yakın çalıştırmak için küçük bir pencere kullanın:

```bash
VIEW=640x400 node tools/drive.mjs tools/recipes/full.mjs
```

Edge ile denemek için (gerçek İngilizce seslerle):

```bash
CHROME="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" node tools/drive.mjs tools/recipes/full.mjs
```

Ekran görüntüleri `tools/shots/` klasörüne yazılır (git'e girmez). Sürücü,
oyunun içindeki `window.SH` geliştirici kancasını kullanır.

---

ELT / Batuhan Özçönke
