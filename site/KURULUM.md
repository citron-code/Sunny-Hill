# Oyun sitesi: kurulum rehberi

Bu klasör, oyunlarınızı tek adreste toplayan siteyi içerir. Sitede neler olduğu:

- **Giriş sayfası:** çocuk kullanıcı adını yazar, 4 rakamlı şifresini büyük tuşlara dokunarak girer. Cihaz girişi bir yıl hatırlar.
- **Oyunlar sayfası:** Sunny Hill ve Pocket Quest kartları ile çocuğun ilerlemesi (ör. "Bölüm 6 · 8 yıldız · dün").
- **Bulut kaydı:** oyunlar kaydı yine cihazda tutar, site bunu buluta gönderir. Çocuk başka cihazdan girince kaldığı yerden devam eder. İnternet yokken oynanan kısım, internet gelince gönderilir.
- **Eski kayıtlar:** eski GitHub adresinde oynanmış bir kayıt, o cihazda ilk girişte "Get my old save" düğmesiyle hesaba taşınır.
- **Öğretmen sayfası** (`/ogretmen`): hesap açma, yazdırılabilir giriş kartları, veli mesajı, yeni şifre, kilit açma, yedekten geri yükleme, sınıf değiştirme, silme.
- **Yedekler:** her kayıt oynandıkça saatte bir, ayrıca başka bir kayıt üzerine yazılmadan önce yedeklenir. Her oyun için son 12 yedek kalır.

Site Cloudflare'in ücretsiz planında çalışır; kredi kartı gerekmez. Ücretsiz plan, günde yaklaşık 350 saatlik oyuna (bütün çocuklar toplam) yeter. Bu sınır aşılırsa Cloudflare'in aylık 5 dolarlık planına geçmek yeterli olur.

Sitenin adresi Cloudflare'in workers.dev alanındadır (`https://oyun.citrobit.workers.dev`). pages.dev adresleri Kasım 2025'ten beri Türkiye'de erişime kapalı olduğu için site oraya konmadı.

## İlk kurulum (bir kez)

**1. GitHub'da yayınlayın.** Claude'a "yayınla" deyin. Eski adresteki kayıtları taşıyan küçük sayfa (`tasi.html`) böylece yayına girer.

**2. Cloudflare hesabı açın.** https://dash.cloudflare.com/sign-up adresinde e-posta ve şifreyle kaydolun, gelen e-postadaki bağlantıyla hesabı doğrulayın.

**3. Kurulumu çalıştırın.** PowerShell'i açın ve şu iki komutu sırayla çalıştırın:

```powershell
cd "C:\Users\user\Desktop\Citrobit\site"
```

```powershell
node kur.mjs
```

Kurulum sırasında:

- Tarayıcı açılır. Cloudflare hesabınızla girip **Allow** düğmesine basın, sonra PowerShell'e dönün.
- Cloudflare bir workers.dev adı sorarsa önce `y`, sonra `citrobit` yazıp Enter'a basın. Bu soru yalnızca ilk seferde gelir.
- Öğretmen şifresini iki kez yazın. Şifre en az 8 karakter olmalı ve yazarken görünmez. Bu şifreyi yalnızca siz bilin.
- Birkaç dakika sonra site adresi ekrana yazılır (`https://oyun.citrobit.workers.dev`).

**4. Kurulumun dosyalarda yaptığı küçük değişikliği yayınlayın.** Claude'a tekrar "yayınla" deyin. Kurulum, veritabanının kimliğini ve sitenin adresini iki dosyaya yazar; bunların GitHub'a gitmesi gerekir.

**5. Deneyin.**

1. `…/ogretmen` adresini açın ve öğretmen şifrenizle girin.
2. **Hesap aç** sekmesinde sınıfı (ör. `2-A`) yazın, öğrencileri her satıra bir "Ad Soyad" olacak şekilde yapıştırın, sonra **Önizle** ve **Hesapları aç**'a basın.
3. **Kartlar** sekmesinden kartları yazdırın ya da her kartın **Veli mesajını kopyala** düğmesiyle mesajı WhatsApp'a yapıştırın.

Önce kendinize bir deneme hesabı açıp telefonunuzdan girmenizi öneririm.

## Bilmeniz gerekenler

- **Şifreler bir kez gösterilir.** Sitede şifrenin kendisi değil, yalnızca geri çevrilemeyen bir özeti saklanır. Bu yüzden kartları hesap açar açmaz yazdırın ya da kopyalayın. Kart kaybolursa öğrenci listesinden **Yeni şifre**'ye basın: eski şifre çalışmaz, oyun kayıtları silinmez.
- **Çocukların adları siteye gitmez.** Adlar yalnızca öğretmen sayfasını açtığınız tarayıcıda durur. **Adlar** sekmesinden listeyi indirip ara sıra yedekleyin; başka bir bilgisayarda aynı sekmeden yükleyebilirsiniz.
- **Kilit:** çocuk 5 kez yanlış şifre girerse hesap 15 dakika kilitlenir. Kilidi listede **Kilidi aç** düğmesiyle hemen açabilirsiniz.
- **"Kaydım gitti" derse:** öğrenci listesinde **Yedekler**'e, sonra uygun tarihteki yedeğin **Geri yükle** düğmesine basın.
- **Yıl sonu:** hesapları listeden silin. Silinen hesabın kayıtları ve yedekleri de kalıcı olarak silinir.
- **Gizlilik sayfası** (`/gizlilik`): içindeki `[OKUL ADI]` yerine okulun adı yazılmalı. Claude'a okulun adını söylemeniz yeterli. Metni okul yönetimiyle bir kez gözden geçirmenizi öneririm.

## Güncelleme

Oyunlarda bir şey değişip GitHub'da yayınlandığında site kendiliğinden güncellenmez. Claude'a "yayınla" demeniz yeterli: Claude birleştirmeyi yapar, ardından siteyi de günceller. Kendiniz güncellemek isterseniz:

```powershell
node yayinla.mjs
```

Pocket Quest'i kendi deposunda yayınladıktan sonra da aynı komutu çalıştırın.

Öğretmen şifresini değiştirmek için:

```powershell
node kur.mjs --sifre
```

## Sorun olursa

- `node kur.mjs` komutunu yeniden çalıştırmak güvenlidir. Var olan hiçbir şeyi silmez ve çocuk şifrelerinin bağlı olduğu gizli değeri (PEPPER) değiştirmez.
- Sitenin durumunu görmek için `…/api/health` adresini açın. `"ok":true` yazıyorsa her şey yolundadır.
- İleride kendi alan adınızı (ör. citrobit.com, yılda yaklaşık 10 dolar) alırsanız Claude siteyi ona bağlar. Çocuklar yeni adreste bir kez yeniden giriş yapar; kayıtlar bulutta olduğu için kaybolmaz. Öğretmen sayfasındaki adları **Adlar** sekmesinden indirip yeni adreste aynı sekmeden yüklersiniz.
