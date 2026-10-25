# Yakın Live ✦

[![Netlify Status](https://api.netlify.com/api/v1/badges/a041e228-9400-4c00-9d05-b42bf07c0fb6/deploy-status)](https://app.netlify.com/projects/yakinlivesohbet/deploys)
Canlı yayınlar, interaktif sohbet ve hediyeleşme platformu.

## 🌐 Canlı İnternet Yayını

Uygulama anında dünya çapında yayındadır:
- **Canlı Önizleme Linki**: [https://ais-pre-362ilidwuw4rcyut7txwq2-529491772304.europe-west2.run.app](https://ais-pre-362ilidwuw4rcyut7txwq2-529491772304.europe-west2.run.app)
- **Geliştirici URL**: [https://ais-dev-362ilidwuw4rcyut7txwq2-529491772304.europe-west2.run.app](https://ais-dev-362ilidwuw4rcyut7txwq2-529491772304.europe-west2.run.app)

---

## 📦 Projeyi ZIP Olarak İndirme

Tüm kaynak kodlarını içeren temiz `.zip` arşivi doğrudan uygulamanın içinden veya aşağıdaki adresten indirilebilir:
- **ZIP İndirme Linki**: `/yakin-live.zip`

---

## 🐙 GitHub Bağlantısı (GitHub'a Yükleme Adımları)

Projeyi kendi GitHub hesabınıza yüklemek için terminalinizde sırasıyla şu komutları çalıştırın:

```bash
# 1. Git deposunu başlatın (zaten başlatılmışsa devam edin)
git init

# 2. Tüm dosyaları ekleyin ve ilk commit'i oluşturun
git add .
git commit -m "feat: Yakın Live v1.0.0 ilk sürüm"

# 3. Ana dal adını main yapın
git branch -M main

# 4. Kendi GitHub deponuzun linkini ekleyin:
# (GitHub'da 'yakin-live' adında yeni boş bir repo oluşturup linkini yazın)
git remote add origin https://github.com/<KULLANICI_ADINIZ>/yakin-live.git

# 5. GitHub'a gönderin
git push -u origin main
```

---

## 📱 Android APK Oluşturma & Telefona Yükleme

Yakın Live'ı telefonda native uygulama olarak çalıştırmak için **iki yöntem** mevcuttur:

### Yöntem 1: Anında Yükleme (PWA / WebAPK - En Kolay ve Hızlı)
1. Telefonunuzun tarayıcısından (Chrome veya Safari) **Canlı Linki** açın:
   `https://ais-pre-362ilidwuw4rcyut7txwq2-529491772304.europe-west2.run.app`
2. Uygulama açıldığında ekrandaki **"📲 Telefona Yükle / APK"** butonuna basın veya tarayıcının sağ üst menüsünden (üç nokta) **"Ana Ekrana Ekle / Uygulamayı Yükle"** seçeneğini seçin.
3. Uygulama telefonunuza tıpkı bir APK gibi kurulur, ana ekranınıza simgesi gelir ve tarayıcı çubuğu olmadan tam ekran çalışır!

### Yöntem 2: Capacitor ile Standalone .APK Derleme
1. Proje dizininde derleme yapın:
   ```bash
   npm run build
   ```
2. Capacitor Android modülünü kurun:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap add android
   npx cap sync
   ```
3. Android Studio ile açıp APK çıktısını alın:
   ```bash
   npx cap open android
   # Android Studio açıldığında: Build > Build Bundle(s) / APK(s) > Build APK(s)
   ```
   Oluşan `app-debug.apk` dosyasını telefonunuza yükleyip kurabilirsiniz!

---

## 🛠️ Yerel Geliştirme (Localhost)

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Üretim derlemesi
npm run build
```
