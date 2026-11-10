package com.sinopcepte.config;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.AppUserRepository;
import com.sinopcepte.auth.Role;
import com.sinopcepte.catalog.ItemRepository;
import com.sinopcepte.checkin.VenueCheckin;
import com.sinopcepte.checkin.VenueCheckinRepository;
import com.sinopcepte.confession.Confession;
import com.sinopcepte.confession.ConfessionComment;
import com.sinopcepte.confession.ConfessionCommentRepository;
import com.sinopcepte.confession.ConfessionRepository;
import com.sinopcepte.notification.AppNotification;
import com.sinopcepte.notification.AppNotificationRepository;
import com.sinopcepte.okeye4.Okeye4JoinRequest;
import com.sinopcepte.okeye4.Okeye4JoinRequestRepository;
import com.sinopcepte.okeye4.Okeye4Lobby;
import com.sinopcepte.okeye4.Okeye4LobbyRepository;

@Component
@Order(100) // AdminBootstrap'tan sonra çalışır
public class SocialSeedBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SocialSeedBootstrap.class);
    public static final String STANDARD_PASSWORD = "Sinop1234!";

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final ItemRepository items;
    private final VenueCheckinRepository checkins;
    private final Okeye4LobbyRepository lobbies;
    private final Okeye4JoinRequestRepository requests;
    private final AppNotificationRepository notifications;
    private final ConfessionRepository confessions;
    private final ConfessionCommentRepository comments;
    private final Clock clock;

    public SocialSeedBootstrap(AppUserRepository users, PasswordEncoder passwordEncoder, ItemRepository items,
                               VenueCheckinRepository checkins, Okeye4LobbyRepository lobbies,
                               Okeye4JoinRequestRepository requests, AppNotificationRepository notifications,
                               ConfessionRepository confessions, ConfessionCommentRepository comments,
                               Clock clock) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.items = items;
        this.checkins = checkins;
        this.lobbies = lobbies;
        this.requests = requests;
        this.notifications = notifications;
        this.confessions = confessions;
        this.comments = comments;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        OffsetDateTime now = OffsetDateTime.now(clock);

        log.info("SocialSeedBootstrap: Kullanıcı parolaları ve seed verileri kontrol ediliyor...");

        // 1. Veritabanındaki tüm mevcut kullanıcıların (Sistem ADMIN'leri hariç) parolasını doğrula / güncelle
        for (AppUser u : users.findAll()) {
            boolean isSystemAdmin = u.getRole() == Role.ADMIN && !u.getUsername().equals("aykut") && !u.getUsername().equals("oskibash");
            if (u.getUsername().equals("admin") || u.getUsername().equals("test-admin") || isSystemAdmin) {
                continue;
            }
            if (!passwordEncoder.matches(STANDARD_PASSWORD, u.getPasswordHash())) {
                u.setPasswordHash(passwordEncoder.encode(STANDARD_PASSWORD));
                users.save(u);
                log.info("SocialSeedBootstrap: '{}' kullanıcısının parolası '{}' olarak güncellendi.", u.getUsername(), STANDARD_PASSWORD);
            }
        }

        // 2. Eksik olan tüm kullanıcıları tohumla
        seedUsers(now);
        seedItems();
        if (checkins.count() == 0) seedCheckins(now);
        if (lobbies.count() == 0) seedLobbies(now);
        if (notifications.count() == 0) seedNotifications(now);
        if (confessions.count() == 0) seedConfessions(now);
    }

    private void seedUsers(OffsetDateTime now) {
        record U(String username, String email, String avatar, String bio, String ig, String phone, String badges, Role role) {}
        List<U> seedList = List.of(
                // Grup A (Mevcut & Mekan Patronları & Aktif Sosyal Kullanıcılar)
                new U("aykut", "aykut@sinopcepte.com", "fener", "SinopCepte Kurucusu & Sistem Yöneticisi.", "aykutyesil", "05445721905", "[\"🛡️ Sistem Yöneticisi (Admin)\", \"⚡ Kurucu\"]", Role.ADMIN),
                new U("deniz", "deniz.kaya@gmail.com", "marti", "Karadeniz aşığı, Sinop sokak lezzetleri ve deniz tutkunu.", "denizkaya57", "05325713457", "[\"📍 Sinoplu\", \"👑 Mekan Sahibi (Patron)\"]", Role.USER),
                new U("berk", "berk.social@mathidays.com", "hamsi", "Mathiday's Social İşletmecisi. Hafta sonu DJ ve kokteyl geceleri.", "berkcan_57", "05435728899", "[\"👑 Mekan Sahibi (Patron)\", \"📍 Sinoplu\"]", Role.USER),
                new U("burkay", "burkay@mathidays.com", "marti", "🎧 DJ & Müzik Direktörü @ Mathiday's Social. Sinop sahillerinde elektronik & chill ritimler.", "burkaybahadir", "05325713457", "[\"👑 Mathiday's Mayor'ı\", \"🎵 DJ & Sahne\"]", Role.USER),
                new U("can", "can@cemsburger.com", "kale", "Cem's Burger Kurucusu & Gurme Burger Şefi.", "cemsburger_sinop", "05429876543", "[\"👑 Mekan Sahibi (Patron)\", \"🍔 Burger Üstadı\"]", Role.USER),
                new U("gokce", "gokce.deniz@gmail.com", "yunus", "Karakum sahilinde gün batımı ve kahve aşığı.", "gokcedeniz57", "05331234567", "[\"🌊 Karakum Sakini\", \"☕ Kahve Müdavimi\"]", Role.USER),
                new U("selin", "selin.ak@gmail.com", "denizkabugu", "Sinop Üniversitesi öğrencisi. Kampüs ve Karakum arası mekik dokur.", "selinak57", "05353456789", "[\"🎓 Sinop Üni\", \"☕ Kahve Aşığı\"]", Role.USER),
                new U("emre", "emre.taksi@sinoptaksi.com", "fener", "Sinop Merkez Gece Nöbetçi Taksi. Güvenli ve hızlı ulaşım.", "sinopgecetaksi", "05423125757", "[\"🚕 Merkez Taksi\", \"🌙 Gece Vardiyası\"]", Role.USER),
                new U("zeynep", "zeynep.sinop@gmail.com", "yelkenli", "Tarihi Cezaevi ve kale surları fotoğrafçısı.", "zeynep.lens", "05367890123", "[\"📸 Şehir Fotoğrafçısı\", \"📍 Sinoplu\"]", Role.USER),
                new U("mert", "mert.demir@gmail.com", "marti", "Akşamları okey ve masa tenisi turnuvaları.", "mertdemir_57", "05451239876", "[\"🎲 Okey Üstadı\", \"☕ Çay Tiryakisi\"]", Role.USER),
                new U("melis", "melis.gunes@gmail.com", "hamsi", "Sinop yarımadasında bisiklet turları ve doğa yürüyüşleri.", "melisgunes", "05374561230", "[\"🚴 Yarımada Gezgini\", \"🌿 Doğa Dostu\"]", Role.USER),
                new U("bugra", "bugra.okey@gmail.com", "kale", "Tarihi Cezaevi Çay Bahçesi müdavimi. 101 ve Düz Okey aranır.", "bugraokey57", "05417894561", "[\"🏆 101 Şampiyonu\", \"📍 Sinoplu\"]", Role.USER),
                new U("ozlem", "ozlem.k@gmail.com", "yunus", "Kitap, kahve ve Sinop kütüphanesi sessizliği.", "ozlemkitap", "05389632587", "[\"📚 Kitap Kurdu\", \"☕ Tarihi Kahve Müdavimi\"]", Role.USER),
                new U("baris", "baris.tarih@gmail.com", "denizkabugu", "Sinop Tarihi Cezaevi rehberi ve yerel tarih araştırmacısı.", "baristarih", "05463217894", "[\"🏛 Tarih Rehberi\", \"📍 Sinoplu\"]", Role.USER),
                new U("ceren", "ceren.deniz@gmail.com", "yelkenli", "Yelken sporu ve rüzgar sörfü tutkunu. Sinop Karadeniz Yelken Kulübü.", "cerenyelken", "05391472583", "[\"⛵ Lisanslı Yelkenci\", \"🌊 Rüzgar Tutkunu\"]", Role.USER),
                new U("tolga", "tolga.taksi@gmail.com", "fener", "7/24 Sinop Otogar - Havalimanı - Merkez Taksi.", "tolgataksimerkez", "05325719988", "[\"🚕 Hızlı Taksi\", \"📍 Otogar\"]", Role.USER),
                new U("yasemin", "yasemin.sanat@gmail.com", "marti", "Sinop Sanat Atölyesi eğitmeni, seramik ve resim meraklısı.", "yaseminsanat", "05448529631", "[\"🎨 Sanatçı\", \"📍 Sinoplu\"]", Role.USER),
                new U("serkan", "serkan.tekel@gmail.com", "kale", "Sinop İskele Gece Tekel & Şarküteri.", "iskeletekel57", "05412587412", "[\"🍺 Gece Açık\", \"🛵 Hızlı Paket\"]", Role.USER),
                new U("gamze", "gamze.lezzet@gmail.com", "hamsi", "Sinop mantısı, nokul ve yerel lezzet avcısı.", "gamzelezzetleri", "05336547891", "[\"🥟 Mantı Gurmesi\", \"📍 Sinoplu\"]", Role.USER),
                new U("koray", "koray.muzik@gmail.com", "yunus", "Akustik gitarist, Sinop sahil canlı müzik geceleri.", "koraymuzik57", "05421478523", "[\"🎸 Canlı Müzik\", \"🎙 Akustik\"]", Role.USER),
                new U("didem", "didem.veteriner@gmail.com", "denizkabugu", "Sinop sokak canları gönüllüsü ve veteriner teknikeri.", "didempati57", "05349874563", "[\"🐾 Hayvansever\", \"📍 Sinoplu\"]", Role.USER),
                new U("onur", "onur.balik@gmail.com", "yelkenli", "Sinop Balıkçı Barınağı oltacısı. Palamut, çinekop, levrek takibi.", "onurbalik57", "05453698521", "[\"🎣 Kıyı Balıkçısı\", \"🐟 Taze Balık\"]", Role.USER),
                new U("tugce", "tugce.yoga@gmail.com", "fener", "Akliman ve Hamsilos doğa yogası eğitmeni.", "tugceyoga", "05317418529", "[\"🧘 Doğa Yogası\", \"🌲 Hamsilos Dostu\"]", Role.USER),
                new U("ali", "ali.sinop@gmail.com", "marti", "Hafta sonu halı saha ve tavla arkadaşı arayan esnaf.", "aliesnaf57", "05439517532", "[\"⚽ Halı Saha Kaptanı\", \"🎲 Tavla Ustası\"]", Role.USER),

                // Grup B (Eski/İlave Liste Kullanıcıları)
                new U("serhat_snk", "serhat.snk@gmail.com", "balik", "Sinop Üniversitesi • 101 Okey & Tavla Sever.", "serhatsnk", "05325781122", "[\"🀄 Okey Ustası\", \"🎓 SNÜ Öğrenci\"]", Role.USER),
                new U("deniz_57", "deniz57@gmail.com", "fener", "Kordon sevdalısı, canlı maç & rock müzik tutkunu.", "deniz57", "05425706543", "[\"⚽ Maç Müdavimi\", \"🍺 Nihavent Müdavimi\"]", Role.USER),
                new U("kaan_rock", "kaan.rock@gmail.com", "fener", "Gitarist & Akustik Müzik Tutkunu. Canlı sahne gecelerinde masadayız.", "kaanrock", "05555723322", "[\"🎸 Sahne Arkadaşı\", \"🍔 Cem's Burger Mayor'ı\"]", Role.USER),
                new U("zeynep_snu", "zeynep.snu@gmail.com", "marti", "SNÜ Eğitim Fakültesi • Kitap, deniz havası ve kahve sohbetleri.", "zeynepsnu", "05335713344", "[\"☕ Kahve Yoldaşı\", \"🌊 Deniz Aşığı\"]", Role.USER),
                new U("melis_57", "melis57@gmail.com", "hamsi", "Yarımada bisiklet turu ve Hamsilos kamp aşığı.", "melis57", "05425742257", "[\"🚴 Yarımada Gezgini\", \"🌲 Kampçı\"]", Role.USER),
                new U("emre_kordon", "emre.kordon@gmail.com", "marti", "Kordon boyu yürüyüşleri ve akşam kahveleri.", "emrekordon", "05423125700", "[\"🌊 Kordon Sakini\", \"📍 Sinoplu\"]", Role.USER),
                new U("ece_akustik", "ece.akustik@gmail.com", "yunus", "Vokal & Yan Flüt • Sinop sahnelerinde canlı performans.", "eceakustik", "05305731100", "[\"🎵 Müzisyen\", \"🎙 Vokal\"]", Role.USER),
                new U("mert_57", "mert57@gmail.com", "kale", "Tavla ve satranç tutkunu esnaf.", "mert57", "05451239800", "[\"🎲 Tavla Ustası\", \"📍 Sinoplu\"]", Role.USER),
                new U("selin_snu", "selin.snu@gmail.com", "denizkabugu", "SNÜ Mühendislik • Karakum sahilinde ders çalışma seansları.", "selinsnu", "05353456700", "[\"🎓 SNÜ Öğrenci\", \"☕ Kahve Sever\"]", Role.USER),
                new U("caner_57", "caner57@gmail.com", "fener", "Sinop basketbol ve spor kulübü taraftarı.", "caner57", "05417894500", "[\"🏀 Basketbolcu\", \"📍 Sinoplu\"]", Role.USER),
                new U("buse_sinop", "buse.sinop@gmail.com", "marti", "Fotoğrafçılık, Sinop gün batımları ve kedi sever.", "busesinop", "05389632500", "[\"📸 Fotoğrafçı\", \"🐱 Hayvansever\"]", Role.USER),
                new U("ali_57", "ali57@gmail.com", "hamsi", "Sinop mantısı ustası, aile işletmecisi.", "aliusta57", "05439517500", "[\"🥟 Mantı Ustası\", \"📍 Sinoplu\"]", Role.USER),
                new U("tugce_k", "tugce.k@gmail.com", "denizkabugu", "Pilates ve doğa yürüyüşü eğitmeni.", "tugcek", "05317418500", "[\"🧘 Doğa Yogası\", \"🌿 Doğa Dostu\"]", Role.USER),
                new U("hakan_57", "hakan57@gmail.com", "fener", "Sinop balık hali müdavimi ve amatör kaptan.", "hakan57", "05448529600", "[\"⛵ Amatör Kaptan\", \"🐟 Balıkçı\"]", Role.USER),
                new U("eren_snu", "eren.snu@gmail.com", "kale", "SNÜ Fen Edebiyat • Kampüs okey turnuvaları kaptanı.", "erensnu", "05335738857", "[\"🏆 Okey Kaptanı\", \"🎓 SNÜ\"]", Role.USER),
                new U("pelin_57", "pelin57@gmail.com", "yelkenli", "Karadeniz sörf ve yelken gönüllüsü.", "pelin57", "05391472500", "[\"⛵ Lisanslı Yelkenci\", \"🌊 Deniz Tutkunu\"]", Role.USER),
                new U("gokhan_57", "gokhan57@gmail.com", "marti", "Gece sürüşleri ve Sinop yarımadası manzaraları.", "gokhan57", "05453698500", "[\"🏎️ Gece Sürüşü\", \"📍 Sinoplu\"]", Role.USER),
                new U("onur_57", "onur57@gmail.com", "hamsi", "Sinop lakerdası ve tütsülenmiş balık meraklısı.", "onur57", "05421478500", "[\"🐟 Balık Gurmesi\", \"📍 Sinoplu\"]", Role.USER),
                new U("eda_57", "eda57@gmail.com", "yunus", "Deniz kıyısında suluboya ve manzara resimleri.", "edasanat", "05349874500", "[\"🎨 Ressam\", \"📍 Sinoplu\"]", Role.USER),
                new U("tolga_57", "tolga57@gmail.com", "fener", "Sinop kalesi ve surlar tarihi araştırmacısı.", "tolga57", "05325719900", "[\"🏛 Tarih Meraklısı\", \"📍 Sinoplu\"]", Role.USER),
                new U("oskibash", "oguzvokal@gmail.com", "marti", "SinopCepte Baş Mimarı & Sistem Yöneticisi.", "oskibash", "05355778912", "[\"🛡️ Sistem Yöneticisi (Admin)\", \"⚡ Kurucu\"]", Role.ADMIN)
        );

        for (U u : seedList) {
            users.findByUsername(u.username()).ifPresentOrElse(
                    existing -> {
                        existing.setRole(u.role());
                        existing.setBadgesJson(u.badges());
                        existing.setEmail(u.email());
                        existing.setPhone(u.phone());
                        existing.updateProfile(u.avatar(), u.bio(), u.ig(), com.sinopcepte.auth.CheckinVisibility.PUBLIC, false);
                        if (!passwordEncoder.matches(STANDARD_PASSWORD, existing.getPasswordHash())) {
                            existing.setPasswordHash(passwordEncoder.encode(STANDARD_PASSWORD));
                        }
                        users.save(existing);
                        log.info("SocialSeedBootstrap: '{}' güncellendi (Rol: {}).", existing.getUsername(), existing.getRole());
                    },
                    () -> {
                        AppUser user = new AppUser(u.username(), passwordEncoder.encode(STANDARD_PASSWORD), u.role(), now);
                        user.setEmail(u.email());
                        user.setPhone(u.phone());
                        user.setBadgesJson(u.badges());
                        user.updateProfile(u.avatar(), u.bio(), u.ig(), com.sinopcepte.auth.CheckinVisibility.PUBLIC, false);
                        users.save(user);
                        log.info("SocialSeedBootstrap: Yeni kullanıcı eklendi: {} (Rol: {})", user.getUsername(), user.getRole());
                    }
            );
        }
    }

    private void seedItems() {
        items.findAll().forEach(item -> {
            if ("aykut".equals(item.getOwnerHandle()) || "oskibash".equals(item.getOwnerHandle())) {
                item.setOwnerHandle("deniz");
                items.save(item);
            }
        });

        items.findById("m-1").ifPresent(item -> {
            item.setOwnerHandle("berk");
            item.setPhotosJson("[\"https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80\"]");
            item.setMenuJson("[{\"category\":\"Kokteyl\",\"name\":\"Sinop Sunset Signature\",\"price\":\"220 ₺\",\"desc\":\"Nar ekşisi, votka, nane ve taze limon ferahlığı\"},{\"category\":\"Kokteyl\",\"name\":\"Black Sea Mule\",\"price\":\"210 ₺\",\"desc\":\"Zencefil gazozu, rom ve taze böğürtlen\"},{\"category\":\"Atıştırmalık\",\"name\":\"Truffle Parmigiano Fries\",\"price\":\"130 ₺\",\"desc\":\"Trüf yağı ve parmesanlı çıtır patates sepeti\"},{\"category\":\"Atıştırmalık\",\"name\":\"Mini Burger Trio\",\"price\":\"240 ₺\",\"desc\":\"3 adet gurme mini burger ve trüflü dip sos\"}]");
            items.save(item);
        });

        items.findById("m-2").ifPresent(item -> {
            item.setOwnerHandle("deniz");
            item.setPhotosJson("[\"https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80\"]");
            item.setMenuJson("[{\"category\":\"Fıçı Bira\",\"name\":\"Efes Pilsen Özel Seri (50cl)\",\"price\":\"110 ₺\",\"desc\":\"Taze soğuk fıçı bira\"},{\"category\":\"Fıçı Bira\",\"name\":\"Tuborg Gold Fıçı (50cl)\",\"price\":\"110 ₺\",\"desc\":\"%100 malt arpa lezzeti\"},{\"category\":\"Pub Tabakları\",\"name\":\"Dev Karışık Pub Sepeti\",\"price\":\"260 ₺\",\"desc\":\"Sosis, nugget, çıtır soğan halkası, patates\"},{\"category\":\"Ana Yemek\",\"name\":\"Nihavent Gurme Köfte\",\"price\":\"240 ₺\",\"desc\":\"Özel baharatlı ızgara köfte, pilav ve köz biber\"}]");
            items.save(item);
        });

        items.findById("m-3").ifPresent(item -> {
            item.setOwnerHandle("can");
            item.setPhotosJson("[\"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80\"]");
            item.setMenuJson("[{\"category\":\"Burger\",\"name\":\"Cem's Smoked Bacon Burger\",\"price\":\"240 ₺\",\"desc\":\"180g dana köfte, füme et, eritilmiş cheddar ve barbekü sos\"},{\"category\":\"Burger\",\"name\":\"Sinop Mantı Burger\",\"price\":\"220 ₺\",\"desc\":\"Özel yoğurtlu sos ve sumaklı tereyağ sosu ile çıtır gurme burger\"},{\"category\":\"Patates & Yan Ürün\",\"name\":\"Cheddar Jalapeno Fries\",\"price\":\"120 ₺\",\"desc\":\"Sıcak cheddar sos ve acı jalapeno dilimleri\"}]");
            items.save(item);
        });
    }

    private void seedCheckins(OffsetDateTime now) {
        checkins.saveAll(List.of(
                new VenueCheckin("c-1", "m-1", "gokce", "Gökçe", "yunus", "Kokteyller harika, müzik tam kıvamında 🍸", "keyifli", now.minusMinutes(15)),
                new VenueCheckin("c-2", "m-1", "selin", "Selin", "denizkabugu", "Hafta sonu yorgunluğunu atmaya geldik ✨", "harika", now.minusMinutes(35)),
                new VenueCheckin("c-3", "m-2", "mert", "Mert", "marti", "Dev ekranda maç başladı, atmosfer bomba! ⚽", "heyecanlı", now.minusMinutes(20)),
                new VenueCheckin("c-4", "m-2", "bugra", "Buğra", "kale", "Fıçı biralar buz gibi 🍻", "mutlu", now.minusMinutes(50)),
                new VenueCheckin("c-5", "m-3", "zeynep", "Zeynep", "yelkenli", "Bacon burger efsane ötesi 🍔", "aç", now.minusMinutes(10)),
                new VenueCheckin("c-6", "m-3", "ali", "Ali", "marti", "Patates sepeti sıcacık geldi 👍", "keyifli", now.minusHours(1))
        ));
    }

    private void seedLobbies(OffsetDateTime now) {
        lobbies.saveAll(List.of(
                new Okeye4Lobby("l-1", "okey", "Akşam Cezaevi Çay Bahçesinde Düz Okey", "Tarihi Cezaevi Çay Bahçesi", "Merkez", 3, 4, "20:00", "2 saat sonra", "bugra", "Buğra", "kale", 98, "🏆 101 Şampiyonu", "05417894561", "905417894561", "Taş çalmayan, seriye hızlı basan bir dost arıyoruz. Çaylar kaybedenden!", "OPEN", now.minusMinutes(40)),
                new Okeye4Lobby("l-2", "tavla", "İskele Meydanında Tavla Kapışması", "İskele Meydanı Çay Evi", "Merkez", 1, 2, "19:30", "1 saat sonra", "ali", "Ali", "marti", 92, "🎲 Tavla Ustası", "05439517532", "905439517532", "Mars etmek serbest, kapı almak şart. İddiasına çayına maç!", "OPEN", now.minusMinutes(25)),
                new Okeye4Lobby("l-3", "101", "Öğrenci Evi Konsepti 101 Yüzbir Masası", "Kampüs Kafe", "Merkez", 2, 4, "21:00", "3 saat sonra", "selin", "Selin", "denizkabugu", 95, "🎓 Sinop Üni", "05353456789", "905353456789", "Ceza puanı düşük, neşeli oyun arkadaşlarını bekliyoruz :)", "OPEN", now.minusMinutes(10))
        ));

        requests.saveAll(List.of(
                new Okeye4JoinRequest("req-1", "l-1", "mert", "Mert", "marti", 96, "05451239876", "Düz okeyde iddialıyım, 10 dakikaya cezaevi önündeyim!", "PENDING", now.minusMinutes(15)),
                new Okeye4JoinRequest("req-2", "l-3", "gokce", "Gökçe", "yunus", 94, "05331234567", "Arkadaşımla 2 kişiyiz, masayı 4'leyebiliriz!", "PENDING", now.minusMinutes(5))
        ));
    }

    private void seedNotifications(OffsetDateTime now) {
        notifications.saveAll(List.of(
                new AppNotification("n-1", "deniz", "claim", "Mekan Sahipliğiniz Onaylandı! 👑", "\"Nihavent Restaurant Pub\" mekanının onaylı patronu oldunuz. Menü ve etkinlikleri güncelleyebilirsiniz.", "1 saat önce", false, "/mekan/m-2", "Mekanı Yönet", now.minusHours(1)),
                new AppNotification("n-2", "bugra", "okeye4_request", "Yeni Masa Başvurusu Geldi!", "@mert \"Akşam Cezaevi Çay Bahçesinde Düz Okey\" masanıza katılmak istiyor.", "15 dk önce", false, "/okeye4", "Başvuruyu Gör", now.minusMinutes(15)),
                new AppNotification("n-3", "gokce", "checkin", "Arkadaşın Mathiday's Social'da! 📍", "@selin az önce Mathiday's Social mekanına check-in yaptı.", "35 dk önce", true, "/mekan/m-1", "Kimler Orada?", now.minusMinutes(35)),
                new AppNotification("n-4", null, "live_event", "Canlı Maç Yayını Bu Akşam! ⚽", "Galatasaray - Amed SK karşılaşması dev ekranda Nihavent Pub'da canlı yayında.", "Bugün", false, "/mekan/m-2", "Detayları Gör", now.minusHours(3))
        ));
    }

    private void seedConfessions(OffsetDateTime now) {
        if (confessions.count() > 0) return;

        Confession c1 = new Confession(
                "cnf-1", "selin", "Gizli Martı #104", "marti",
                "m-1", "Mathiday's Social", "gece",
                "Dün gece Mathiday's terasında DJ kabininin hemen arkasındaki masada oturan ve sürekli göz göze geldiğimiz kahve gözlü çocuk... Yanına gelecektim ama arkadaş grubun çok kalabalıktı. Bir dahaki sefere lütfen sen gel!",
                now.minusHours(2)
        );
        c1.setFireCount(18); c1.setLaughCount(5); c1.setShockCount(2); c1.setHeartCount(34);

        Confession c2 = new Confession(
                "cnf-2", "deniz", "Kordon Gölgesi #57", "fener",
                "m-2", "Nihavent Restaurant Pub", "mekan",
                "Nihavent'te dev ekranda maç izlerken gol sevinciyle hiç tanımadığım yan masadaki amcaya sarılıp 20 saniye zıpladım. Ayrılırken bana bir duble bira ısmarladı. Sinop insanının samimiyeti şaka mı?",
                now.minusHours(4)
        );
        c2.setFireCount(42); c2.setLaughCount(68); c2.setShockCount(1); c2.setHeartCount(29);

        Confession c3 = new Confession(
                "cnf-3", "mert", "Cezaevi Firarisi #73", "kale",
                "1", "Tarihi Cezaevi Çay Bahçesi", "gece",
                "Cezaevi çay bahçesinde okey oynarken solumdaki çocuğun taş çaldığını gördüm ama çayına oynadığımız için ses etmedim. Sonuç: 3 el sonra ben de çaldım ve hesabı onlara kilitledik. Pişman değilim.",
                now.minusHours(6)
        );
        c3.setFireCount(25); c3.setLaughCount(89); c3.setShockCount(12); c3.setHeartCount(8);

        Confession c4 = new Confession(
                "cnf-4", "zeynep", "Karakum Rüzgarı #19", "denizkabugu",
                null, "SNÜ Kampüs", "kampus",
                "Eğitim Fakültesi kütüphanesinde 3 aydır aynı masada sessizce tez yazan beyefendi; her kahve almaya kalktığında not defterime gizlice resmini karalıyorum. Çizim defterim senin portrelerinle doldu haberin yok.",
                now.minusHours(8)
        );
        c4.setFireCount(14); c4.setLaughCount(12); c4.setShockCount(21); c4.setHeartCount(76);

        Confession c5 = new Confession(
                "cnf-5", "can", "Ada Boğazı Gezgini #61", "yunus",
                "m-3", "Cem's Burger", "mekan",
                "Cem's Burger'de diyette olduğumu söyleyip sadece sade salata söyleyen sevgilim, tuvalete gittiğim sırada dev hamburgerimin yarısını ve trüflü patateslerimin tamamını yemiş. Masaya döndüğümde ağzında barbekü sosuyla suçsuz suçsuz bakıyordu.",
                now.minusHours(12)
        );
        c5.setFireCount(11); c5.setLaughCount(112); c5.setShockCount(8); c5.setHeartCount(45);

        Confession c6 = new Confession(
                "cnf-6", "gokce", "Hamsilos Fısıltısı #33", "yelkenli",
                null, "Karakum & Sahil Yolu", "ask",
                "Dün gece 02:00 sularında Karakum sahilinde arabada son ses Duman dinleyip ağlayan arkadaş... Plakandan kim olduğunu biliyorum ama aramızda sır. Bazen Sinop'un rüzgarı bile insanın içindeki yangını söndürmüyor, geçecek merak etme.",
                now.minusHours(16)
        );
        c6.setFireCount(31); c6.setLaughCount(4); c6.setShockCount(9); c6.setHeartCount(93);

        confessions.saveAll(List.of(c1, c2, c3, c4, c5, c6));

        ConfessionComment cm1 = new ConfessionComment("cmt-1", "cnf-1", "mert", "Hamsi Dedektifi #28", "hamsi", true, "Dün akşam DJ arkasındaki masa bendim ama sevgilimleydim umarım ben değilimdir 😂", now.minusMinutes(90));
        ConfessionComment cm2 = new ConfessionComment("cmt-2", "cnf-1", "aykut", "Aykut Yeşil", "fener", false, "Sinop küçük yer, akşama kokusu çıkar 👀", now.minusMinutes(60));
        ConfessionComment cm3 = new ConfessionComment("cmt-3", "cnf-2", "bugra", "İskele Bekçisi #42", "yelkenli", true, "O amca muhtemelen Mithat amcadır, her gole aynı tarifeyi uygular kral adamdır!", now.minusHours(3));
        ConfessionComment cm4 = new ConfessionComment("cmt-4", "cnf-4", "gokce", "Gökçe", "yunus", false, "Lütfen defteri bitirmeden bir kahve ısmarla artık, aşk cesaret ister!", now.minusHours(5));

        comments.saveAll(List.of(cm1, cm2, cm3, cm4));
    }
}
