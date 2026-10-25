import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Github, X, Check, Copy, ExternalLink, Box, Sparkles, Terminal } from 'lucide-react';

interface ExportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const ExportDownloadModal: React.FC<ExportDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'zip' | 'github' | 'apk'>('zip');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
    } else {
      alert('Telefonunuzun tarayıcı menüsünden (⋮) "Ana Ekrana Ekle / Uygulamayı Yükle" seçeneğini kullanarak uygulamayı doğrudan telefonunuza kurabilirsiniz!');
    }
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    setDownloadStatus('Dosya hazırlanıyor...');
    try {
      // 1. Fetch file directly as blob
      const res = await fetch('/api/download-zip');
      if (!res.ok) throw new Error('Sunucudan indirme yanıt vermedi');
      const blob = await res.blob();

      // 2. Trigger native blob download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'yakin-live.zip';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        link.remove();
      }, 2000);

      setDownloadStatus('İndirme başlatıldı! ✓');
      setTimeout(() => setDownloadStatus(null), 3500);
    } catch (err) {
      console.warn('Blob indirme uyarısı, alternatif yöntem deneniyor:', err);
      // Fallback: direct window navigation
      window.location.href = '/yakin-live.zip';
      setDownloadStatus('Yedek indirme tetiklendi!');
      setTimeout(() => setDownloadStatus(null), 3000);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareFile = async () => {
    try {
      setDownloading(true);
      setDownloadStatus('Dosya paylaşım için hazırlanıyor...');
      const res = await fetch('/api/download-zip');
      const blob = await res.blob();
      const file = new File([blob], 'yakin-live.zip', { type: 'application/zip' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Yakın Live Kaynak Kodları',
          text: 'Yakın Live canlı yayın uygulaması kaynak kodları (.zip)',
          files: [file],
        });
        setDownloadStatus('Paylaşıldı! ✓');
      } else {
        // Fallback to normal download
        handleDownloadZip();
      }
    } catch {
      handleDownloadZip();
    } finally {
      setDownloading(false);
      setTimeout(() => setDownloadStatus(null), 3000);
    }
  };

  const gitCommands = [
    'git init',
    'git add .',
    'git commit -m "feat: Yakın Live tam sürüm"',
    'git branch -M main',
    'git remote add origin https://github.com/<KULLANICI_ADINIZ>/yakin-live.git',
    'git push -u origin main',
  ];

  const capacitorCommands = [
    'npm run build',
    'npm install @capacitor/core @capacitor/cli @capacitor/android',
    'npx cap add android',
    'npx cap sync',
    'npx cap open android',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#161124] border border-[#3b2b52] rounded-2xl shadow-2xl p-5 text-white my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d2243]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-pink-400" />
            <h3 className="font-extrabold text-base">İndirme, GitHub & Mobil Paket</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#241c38] hover:bg-[#32274d] text-gray-400 hover:text-white transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1.5 mt-4 p-1 rounded-xl bg-[#1d162c] border border-[#36264d]">
          <button
            onClick={() => setActiveTab('zip')}
            className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'zip'
                ? 'bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] text-white shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>ZIP İndir</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'github'
                ? 'bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] text-white shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] text-white shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>APK / Mobil</span>
          </button>
        </div>

        {/* TAB 1: ZIP DOWNLOAD */}
        {activeTab === 'zip' && (
          <div className="mt-4 space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#27193d] to-[#1a1329] border border-[#443360] text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 mx-auto flex items-center justify-center text-2xl shadow-xl shadow-pink-500/25 mb-3">
                📦
              </div>
              <h4 className="text-base font-black text-white">Yakın Live Tam Kaynak Kodu</h4>
              <p className="text-xs text-purple-200 mt-1 max-w-sm mx-auto">
                Tüm bileşenler, stiller, testler ve mobil yapılandırma dosyalarını içeren temiz `.zip` arşivi (~1.3 MB).
              </p>

              {downloadStatus && (
                <div className="mt-3 py-1.5 px-3 rounded-lg bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs font-bold animate-pulse">
                  {downloadStatus}
                </div>
              )}

              {/* Main Download Button */}
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={downloading}
                className="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] text-white font-extrabold text-sm shadow-lg shadow-pink-500/30 hover:brightness-110 active:scale-98 transition-all"
              >
                <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                <span>{downloading ? 'Hazırlanıyor...' : '📥 yakin-live.zip İndir'}</span>
              </button>

              {/* Mobile Native Share Button */}
              <button
                type="button"
                onClick={handleShareFile}
                disabled={downloading}
                className="mt-2 inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-[#231a38] hover:bg-[#2e234a] border border-purple-500/30 text-purple-200 hover:text-white font-bold text-xs transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                <span>📲 Telefonda Paylaş (Drive / WhatsApp / Dosyalar)</span>
              </button>

              {/* Direct fallback link */}
              <div className="mt-2.5 flex items-center justify-center gap-2 text-[11px]">
                <span className="text-gray-400">İndirme başlamazsa:</span>
                <a
                  href="/api/download-zip"
                  download="yakin-live.zip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 font-bold underline inline-flex items-center gap-0.5"
                >
                  <span>Doğrudan Yedek Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#1b1429] border border-[#35274d] text-xs space-y-1.5 text-purple-200">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Nasıl Kullanılır?</span>
              </p>
              <p>1. İndirilen ZIP dosyasını telefonunuzda Dosyalar / İndirilenler klasöründe açın.</p>
              <p>2. Bilgisayarınızda veya sunucunuzda <code className="bg-black/50 px-1 py-0.5 rounded text-pink-300">npm install</code> ve <code className="bg-black/50 px-1 py-0.5 rounded text-pink-300">npm run dev</code> komutuyla anında çalıştırabilirsiniz.</p>
            </div>
          </div>
        )}

        {/* TAB 2: GITHUB */}
        {activeTab === 'github' && (
          <div className="mt-4 space-y-3">
            <div className="p-3 rounded-xl bg-[#1b1429] border border-[#35274d]">
              <p className="text-xs text-purple-200 font-medium">
                GitHub hesabınızda yeni bir repo (örneğin <strong className="text-white">yakin-live</strong>) oluşturduktan sonra aşağıdaki komutları terminalinizde çalıştırın:
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0f0c18] border border-[#2d2243] font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-400 pb-1 border-b border-white/10">
                <span className="flex items-center gap-1 text-pink-400">
                  <Terminal className="w-3.5 h-3.5" />
                  Terminal Komutları
                </span>
                <button
                  onClick={() => copyToClipboard(gitCommands.join('\n'), 99)}
                  className="hover:text-white flex items-center gap-1 text-purple-300"
                >
                  {copiedIndex === 99 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Tümünü Kopyala</span>
                </button>
              </div>

              {gitCommands.map((cmd, i) => (
                <div key={i} className="flex items-center justify-between group py-0.5">
                  <span className="text-pink-300 select-all">$ {cmd}</span>
                  <button
                    onClick={() => copyToClipboard(cmd, i)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-white text-gray-400 transition-opacity"
                    title="Kopyala"
                  >
                    {copiedIndex === i ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: APK & PWA */}
        {activeTab === 'apk' && (
          <div className="mt-4 space-y-3">
            {/* Instant PWA Install option */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-[#1e172e] border border-emerald-500/40">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Yöntem 1: Anında Telefona Yükle (WebAPK / PWA)</span>
                  </h5>
                  <p className="text-[11px] text-purple-200 mt-1">
                    Google Chrome veya Safari üzerinden ana ekrana tam ekran uygulama olarak eklenir.
                  </p>
                </div>
              </div>

              <button
                onClick={handleInstallPWA}
                className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>📲 Uygulamayı Telefona Yükle (APK Gibi Kur)</span>
              </button>
            </div>

            {/* Standalone APK build with Capacitor */}
            <div className="p-3.5 rounded-xl bg-[#1b1429] border border-[#35274d]">
              <h5 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Box className="w-4 h-4 text-amber-400" />
                <span>Yöntem 2: Capacitor ile Standalone .APK Derleme</span>
              </h5>
              <p className="text-[11px] text-purple-200 mt-1">
                Projeyi indirdikten sonra Android Studio ile bağımsız `.apk` dosyası oluşturabilirsiniz:
              </p>

              <div className="mt-2 p-2 rounded-lg bg-[#0e0b17] border border-white/10 font-mono text-[11px] text-pink-300 space-y-1">
                {capacitorCommands.map((c, i) => (
                  <div key={i}>$ {c}</div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                Android Studio açıldığında: <strong className="text-white">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> seçeneği ile telefonunuza yükleyebileceğiniz <code className="text-pink-300">.apk</code> dosyasını alabilirsiniz.
              </p>
            </div>
          </div>
        )}

        {/* Live publication notice */}
        <div className="mt-4 pt-3 border-t border-[#291f3c] flex items-center justify-between text-[11px] text-purple-300">
          <span>Canlı Yayın Durumu:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            İnternette Yayında (Aktif)
          </span>
        </div>
      </div>
    </div>
  );
};
