import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | SinopCepte",
  description: "6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca SinopCepte Kişisel Verilerin İşlenmesi Aydınlatma Metni.",
};

export default function KvkkPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              ⚖️ Resmi Metin · Sürüm 1.0 (2026)
            </span>
            <Link
              href="/"
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white">
            SinopCepte Kişisel Verilerin Korunması ve İşlenmesi Aydınlatma Metni
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            6698 Sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) Madde 10 Kapsamında Bilgilendirme
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Bölüm 1 */}
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-rose-500 font-mono text-sm">01.</span> Veri Sorumlusu
            </h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla
              <strong className="text-slate-900 dark:text-white"> SinopCepte Topluluk ve Şehir Platformu </strong>
              (Bundan böyle “<strong>sinopcepte.com</strong>” veya “<strong>Platform</strong>” olarak anılacaktır) tarafından aşağıda açıklanan kapsamda işlenecektir.
            </p>
          </section>

          {/* Bölüm 2 */}
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-rose-500 font-mono text-sm">02.</span> İşlenen Kişisel Verileriniz
            </h2>
            <p className="mb-3">Platformumuz kapsamında aşağıdaki kişisel verileriniz işlenmektedir:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm marker:text-rose-500">
              <li>
                <strong className="text-slate-900 dark:text-white">Kimlik & Hesap Bilgileri:</strong> Rumuz (kullanıcı adı), ad-soyad (tercihe bağlı), e-posta adresi, profil fotoğrafı, biyografi.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">İşlem & Güvenlik Verileri:</strong> Şifrelenmiş parola hash&apos;leri (BCrypt standardında, açık şifreler asla saklanmaz), oturum token&apos;ları, IP adresi, son giriş zamanı.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">Topluluk & Etkileşim Verileri:</strong> Kampüs ders notu paylaşımları, Sinop mekanlarında yapılan 2 saatlik geçici check-in&apos;ler, ortak taksi lobisi katılım kayıtları, yorumlar ve beğeniler.
              </li>
            </ul>
          </section>

          {/* Bölüm 3 */}
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-rose-500 font-mono text-sm">03.</span> Kişisel Verilerin İşlenme Amaçları
            </h2>
            <p className="mb-2">Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm marker:text-rose-500">
              <li>Kullanıcı hesabının oluşturulması, kimlik doğrulama ve şifre sıfırlama hizmetinin sunulması,</li>
              <li>SNÜ öğrencileri arasında ders notu ve vize-final hazırlık materyallerinin paylaşılabilmesi,</li>
              <li>Havalimanı, Otogar ve Kampüs güzergahlarında masraf paylaşımı ve ortak taksi lobilerinin organize edilmesi,</li>
              <li>Mekan check-in özelliğiyle canlı şehir hareketliliğinin sağlanması (check-in kayıtları 2 saat sonra sistemden otomatik silinir),</li>
              <li>Sistem güvenliğinin temini, kötüye kullanım ve spam içeriklerin engellenmesi.</li>
            </ul>
          </section>

          {/* Bölüm 4 */}
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-rose-500 font-mono text-sm">04.</span> Kişisel Verilerin Aktarılması
            </h2>
            <p>
              Kişisel verileriniz hiçbir surette üçüncü şahıslarla reklam veya ticari kazanç amacıyla paylaşılmaz ve satılmaz.
              Yalnızca yasal zorunluluk halinde yetkili kamu kurum ve kuruluşları (Cumhuriyet Başsavcılıkları, Mahkemeler vb.) ile kanuni talep sınırları dahilinde paylaşılabilir.
            </p>
          </section>

          {/* Bölüm 5 */}
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-rose-500 font-mono text-sm">05.</span> Veri Güvenliği ve Saklama Süresi
            </h2>
            <p>
              Verileriniz TLS/SSL protokolüyle şifrelenmiş kanallar üzerinden aktarılır. Kullanıcı şifreleri tek yönlü BCrypt algoritması ile kriptolanarak veritabanında muhafaza edilir.
              Mekan check-in verileri gizlilik prensibi gereği en fazla 2 saat saklanır; süre dolduğunda veya kullanıcı yeni bir mekanda check-in yaptığında eski kayıt derhal kalıcı olarak temizlenir.
            </p>
          </section>

          {/* Bölüm 6 */}
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-rose-500 font-mono text-sm">06.</span> İlgili Kişinin Hakları (KVKK Madde 11)
            </h2>
            <p className="mb-2">
              KVKK&apos;nın 11. maddesi uyarınca veri sahipleri;
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm marker:text-rose-500">
              <li>Kişisel verilerinin işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>Kişisel verilerin düzeltilmesini veya silinmesini / yok edilmesini talep etme,</li>
              <li>Hesabını ve Platformdaki tüm hareketlerini dilediği an tamamen silme hakkına sahiptir.</li>
            </ul>
          </section>

          {/* Bölüm 7 */}
          <section className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              📬 İletişim ve Veri Sahibi Başvurusu
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              KVKK kapsamındaki tüm talep, başvuru ve sorularınız için bizimle{" "}
              <strong className="text-rose-600 dark:text-rose-400">kvkk@sinopcepte.com</strong> veya{" "}
              <strong className="text-rose-600 dark:text-rose-400">destek@sinopcepte.com</strong> üzerinden iletişime geçebilirsiniz.
              Talepleriniz en geç 30 gün içinde sonuçlandırılır.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link
            href="/kayit"
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
          >
            ← Kayıt Ekranına Dön
          </Link>
          <span className="text-xs text-slate-400">© 2026 sinopcepte.com · Tüm Hakları Saklıdır</span>
        </div>
      </div>
    </div>
  );
}
