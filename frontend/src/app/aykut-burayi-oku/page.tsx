"use client";

import Link from "next/link";

export default function AykutBurayiOkuPage() {
  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 selection:bg-rose-500 selection:text-white pb-24">
      {/* Üst Karşılama Barı */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#070913]/90 border-b border-slate-800/80 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition border border-slate-800"
          >
            <span>←</span>
            <span>SinopCepte Ana Sayfaya Dön</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Aykut Özel Brifingi • v2.0
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-10">
        {/* Kahraman Başlık */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-950/40 via-purple-950/30 to-slate-900 border border-rose-500/30 p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
              <span>👑</span>
              <span>Proje Kurucu Ortağı Özel Rehberi</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-display">
              👋 Selam Aykut! SinopCepte&apos;de Neler Yaptık, Şu An Neler Var &amp; Sırada Ne Var?
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Kanka seni hiçbir karmaşık kod veya teknik terimle boğmadan; sitenin şu anki gerçek gücünü, senin
              <strong className="text-white"> Admin (Tanrı Modu)</strong> yetkilerini, sıfırdan kurduğumuz 8 büyük sistemi ve sırada bizi bekleyen işleri tek tek anlattık.
            </p>
          </div>
        </section>

        {/* Bölüm 1: Eskiden Nasıldı, Şimdi Ne Oldu? */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              1. Eskiden Nasıldı, Şimdi Ne Oldu? (En Önemli Devrim)
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <span>❌</span>
                <span>Eski Durum (Vitrin Tasarımı):</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Site tek bir HTML dosyasından ibaretti. İçindeki kullanıcılar ve etkinlikler sadece senin bilgisayarında/tarayıcında (localStorage) kalıyordu. Bir telefondan masa açtığında veya check-in yaptığında başka biri bunu göremiyordu; hepsi sanaldı.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <span>✅</span>
                <span>Şimdiki Durum (Gerçek Canlı Veritabanı):</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Artık arka planda gerçek bir <strong className="text-white">PostgreSQL Veritabanı</strong> ve <strong className="text-white">Java Spring Boot Motoru</strong> çalışıyor! 46 kullanıcı, 15 mekan, menüler, fotoğraflar, check-in&apos;ler, Okeye 4 masaları ve itirafların tamamı veritabanında saklanıyor. Kim ne yaparsa yapsın herkes anında canlı görüyor!
              </p>
            </div>
          </div>
        </section>

        {/* Bölüm 2: Aykut'un Admin Yetkileri */}
        <section className="space-y-4 rounded-3xl bg-linear-to-r from-amber-950/30 via-slate-900 to-amber-950/20 border border-amber-500/40 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300">
                2. Senin Admin Hesabın &amp; &quot;Tanrı Modu&quot; Yetkilerin
              </h2>
              <p className="text-xs text-amber-200/80">Sitenin tüm ipleri senin ve Oğuzhan&apos;ın elinde.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 font-mono text-xs sm:text-sm space-y-1">
            <div className="text-slate-400">Giriş Ekranı: <Link href="/giris" className="text-cyan-400 underline">/giris</Link></div>
            <div><strong className="text-white">Kullanıcı Adın:</strong> <span className="text-amber-400 font-bold">aykut</span> (veya <span className="text-amber-400 font-bold">oskibash</span>)</div>
            <div><strong className="text-white">Şifren:</strong> <span className="text-emerald-400 font-bold">Sinop1234!</span></div>
            <div className="text-[11px] text-slate-400 pt-1">💡 Not: Sitedeki diğer 44 kullanıcının (berk, deniz, zeynep vb.) şifresi de kolayca test edebilmen için <code className="text-rose-400">Sinop1234!</code> yapıldı.</div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                <span>👁️</span>
                <span>Herkesin Her Şeyini Görme:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bir kullanıcının profiline (<code className="text-cyan-400">/u/deniz</code> vb.) girdiğinde sadece sana özel <strong>&quot;Admin Denetim Kartı&quot;</strong> açılır. Telefonunu, e-postasını, gizli check-in&apos;lerini ve açtığı masaları görürsün.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                <span>🤫</span>
                <span>Gizli İtirafların Gerçek Yazarını Görme:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Herkes itirafları &quot;Gizli Martı #104&quot; gibi görürken, senin ekranında üstte kırmızı rozetle <strong>&quot;Gerçek Yazar: @mert&quot;</strong> yazar. İstediğin itirafı tek tıkla gizleyebilir veya silebilirsin.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                <span>👑</span>
                <span>Mekanlara Patron Atama &amp; Yönetim:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                İşletmeciler &quot;Bu mekan benim&quot; dediğinde Admin Panelinden başvuruyu onaylayabilir veya istediğin mekanı istediğin üyeye devredebilirsin. Sen tüm mekanların patronusun.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                <span>🀄</span>
                <span>Okeye 4 Masalarını Yönetme:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Masa sahibi olmasan bile her masadaki oyuncuların telefon numaralarını görebilir, başvuruları onaylayıp reddedebilir ve masayı kapatabilirsin.
              </p>
            </div>
          </div>
        </section>

        {/* Bölüm 3: Tamamlanan 8 Büyük Sistem */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                3. Şu An Canlıda Çalışan 8 Büyük Sistem
              </h2>
              <p className="text-xs text-slate-400">Hepsi gerçek veritabanına bağlıdır, hemen girip deneyebilirsin:</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                num: "01",
                icon: "🔒",
                title: "Üyelik & Güvenlik Sistemi",
                desc: "Giriş yapmayan misafirler siteyi okur ama masa açamaz, itiraf yazamaz ve check-in yapamaz. Şifre göster/gizle göz ikonu mevcuttur.",
                link: "/giris",
                btn: "Girişi İncele",
              },
              {
                num: "02",
                icon: "🍸",
                title: "Mekan Profilleri & Patron Sistemi",
                desc: "Tüm mekan isimleri tıklanabilir. Açılan sayfada menü, fiyatlar, galeri, adres ve Google Haritalar konumu gelir. Patronlar menüsünü düzenleyebilir.",
                link: "/mekan/m-1",
                btn: "Örnek Mekan (Mathiday's)",
              },
              {
                num: "03",
                icon: "👤",
                title: "Tıklanabilir Kullanıcı Profilleri",
                desc: "Sitedeki tüm kullanıcı isimlerine (@berk, @deniz vb.) tıklanabilir. Rozetleri, biyografileri ve Instagram linkleri açılır.",
                link: "/u/deniz",
                btn: "Örnek Profil (@deniz)",
              },
              {
                num: "04",
                icon: "🤫",
                title: "Gizli Gece & Kampüs İtirafları",
                desc: "Sinop temalı anonim rumuzlarla (Gizli Martı, Kordon Gölgesi) itiraf yazma, mekana bağlama, alev/kahkaha tepkisi bırakma ve yorum yapma.",
                link: "/?filter=itiraf",
                btn: "İtiraflara Bak",
              },
              {
                num: "05",
                icon: "🀄",
                title: "Okeye 4. Aranıyor Masaları",
                desc: "Tarihi Cezaevi veya İskele'de masa açma, 'Gelebilir miyim?' başvurusu yapma ve onaylanınca WhatsApp köprüsünün açılması.",
                link: "/okeye4",
                btn: "Masaları Gör",
              },
              {
                num: "06",
                icon: "📍",
                title: "Swarm Check-In & Mayorluk",
                desc: "Mekanlara tek tıkla check-in yapma, mekandaki insanları görme ve en çok check-in yapan müdavimin Mayor (👑) tacını alması.",
                link: "/mekan/m-2",
                btn: "Nihavent'te Dene",
              },
              {
                num: "07",
                icon: "🔔",
                title: "Canlı Bildirim Merkezi",
                desc: "Masa başvurusu geldiğinde veya mekanına biri check-in yaptığında sağ üstteki zilden anında bildirim düşer.",
                link: "/",
                btn: "Ana Akışta Gör",
              },
              {
                num: "08",
                icon: "💊",
                title: "Otomatik Nöbetçi Eczane & Hava",
                desc: "Her sabah Sinop nöbetçi eczanesini otomatik çeken robot ve canlı Sinop derece göstergesi.",
                link: "/",
                btn: "Akışın Üstünde",
              },
            ].map((m) => (
              <div key={m.num} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{m.num}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{m.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
                <Link
                  href={m.link}
                  className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition w-full"
                >
                  <span>{m.btn}</span>
                  <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Bölüm 4: Sırada Ne Var? */}
        <section className="space-y-4 rounded-3xl bg-slate-900/40 border border-slate-800 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚧</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                4. Sırada Ne Var? (Henüz Yapmadıklarımız)
              </h2>
              <p className="text-xs text-slate-400">Yol haritasındaki sıradaki büyük hedefler:</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                icon: "🎓",
                title: "SNÜ Kampüs & Vize-Final Ders Notları Paylaşımı",
                status: "Başlanmadı (Sırada)",
                desc: "Sinop Üniversitesi öğrencilerinin bölümlerine göre çıkmış sınav sorularını ve ders notlarını PDF/görsel olarak paylaşacağı özel öğrenci odası.",
              },
              {
                icon: "🚖",
                title: "Uzak Mesafe Ortak Taksi / Masraf Paylaşımı",
                status: "Başlanmadı (Sırada)",
                desc: "Havalimanı, Otogar ve Kampüs için 'Taksiye 2 kişi arıyoruz, masrafı 4'e bölelim' canlı taksi lobisi.",
              },
              {
                icon: "📧",
                title: "Gerçek E-Posta Servisi (Şifremi Unuttum)",
                status: "Canlıya Çıkışta Takılacak",
                desc: "Şu an şifremi unuttum maili gitmiyor; canlı sunucuya geçerken gerçek bir SMTP mail sağlayıcısı (SendGrid / Mailgun) bağlanacak.",
              },
              {
                icon: "⚖️",
                title: "Resmi KVKK Metni & Domain (sinopcepte.com)",
                status: "Yayına Alma Aşamasında",
                desc: "Site şu an yerel sunucuda yayında; gerçek alan adı (domain) ve SSL sertifikası takılarak Sinop halkına açılacak.",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0b0e1e] border border-slate-800/80 flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-200">{item.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-amber-400 font-bold">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bölüm 5: Aykut'a Özel 3 Altın Kural */}
        <section className="space-y-3 rounded-2xl bg-gradient-to-r from-purple-950/30 to-rose-950/30 border border-purple-500/30 p-6">
          <div className="flex items-center gap-2 text-purple-300 font-black text-sm">
            <span>🤖</span>
            <span>Aykut&apos;a Özel: Yapay Zeka ile Geliştirme Yaparken 3 Altın Kural</span>
          </div>
          <ul className="text-xs sm:text-sm text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-white">1. Veritabanı Kuralı:</strong> Yapay zekaya bir şey yaptırırken <em>&quot;Yeni veriyi sahte diziye veya localStorage&apos;a değil, PostgreSQL ve Java backend API&apos;sine bağla&quot;</em> de. Artık tüm verilerimiz gerçek.
            </li>
            <li>
              <strong className="text-white">2. Tek Komutla Çalıştırma:</strong> Sitede yaptığın her şeyi tek komutla test edip ayağa kaldırabilirsin: <code className="bg-slate-900 px-2 py-0.5 rounded text-cyan-400 font-mono text-xs">docker compose -p sinopcepte up --build -d</code>.
            </li>
            <li>
              <strong className="text-white">3. Giriş Kontrolü:</strong> Test ederken her zaman <strong className="text-amber-300">aykut</strong> hesabınla gir ki Admin yetkilerini ve herkesin gizli verilerini ekranda görebilesin.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
