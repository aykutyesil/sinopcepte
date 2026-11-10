package com.sinopcepte.config;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.AppUserRepository;
import com.sinopcepte.auth.Role;
import com.sinopcepte.catalog.Item;
import com.sinopcepte.catalog.ItemRepository;
import com.sinopcepte.checkin.VenueCheckin;
import com.sinopcepte.checkin.VenueCheckinRepository;
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
    private static final String DEFAULT_PW_HASH = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi"; // Sinop1234!

    private final AppUserRepository users;
    private final ItemRepository items;
    private final VenueCheckinRepository checkins;
    private final Okeye4LobbyRepository lobbies;
    private final Okeye4JoinRequestRepository requests;
    private final AppNotificationRepository notifications;
    private final Clock clock;

    public SocialSeedBootstrap(AppUserRepository users, ItemRepository items,
                               VenueCheckinRepository checkins, Okeye4LobbyRepository lobbies,
                               Okeye4JoinRequestRepository requests, AppNotificationRepository notifications,
                               Clock clock) {
        this.users = users;
        this.items = items;
        this.checkins = checkins;
        this.lobbies = lobbies;
        this.requests = requests;
        this.notifications = notifications;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        OffsetDateTime now = OffsetDateTime.now(clock);

        if (users.findByUsername("burkay").isEmpty()) {
            AppUser burkay = new AppUser("burkay", DEFAULT_PW_HASH, Role.USER, now);
            burkay.setEmail("burkay@mathidays.com");
            burkay.setPhone("05325713457");
            burkay.setBadgesJson("[\"👑 Mathiday's Mayor'ı\", \"🎵 DJ & Sahne\"]");
            burkay.updateProfile("marti", "🎧 DJ & Müzik Direktörü @ Mathiday's Social. Sinop sahillerinde elektronik & chill ritimler.", "burkaybahadir", com.sinopcepte.auth.CheckinVisibility.PUBLIC, false);
            users.save(burkay);
        }

        if (users.findByUsername("aykut").isPresent()) {
            return;
        }

        log.info("SocialSeedBootstrap: 23 seed kullanıcısı ve sosyal veriler yükleniyor...");

        seedUsers(now);
        seedItems();
        seedCheckins(now);
        seedLobbies(now);
        seedNotifications(now);
    }

    private void seedUsers(OffsetDateTime now) {
        record U(String username, String email, String avatar, String bio, String ig, String phone, String badges) {}
        List<U> seedList = List.of(
                new U("aykut", "aykut@sinopcepte.com", "fener", "SinopCepte Kurucusu & Sinop Sevdalısı.", "aykutyesil", "05445721905", "[\"👑 Nihavent Mayor'ı\", \"⚡ Kurucu Üye\"]"),
                new U("deniz", "deniz.kaya@gmail.com", "marti", "Karadeniz aşığı, Sinop sokak lezzetleri ve deniz tutkunu.", "denizkaya57", "05325713457", "[\"📍 Sinoplu\", \"👑 Mekan Sahibi (Patron)\"]"),
                new U("berk", "berk.social@mathidays.com", "hamsi", "Mathiday's Social İşletmecisi. Hafta sonu DJ ve kokteyl geceleri.", "berkcan_57", "05435728899", "[\"👑 Mekan Sahibi (Patron)\", \"📍 Sinoplu\"]"),
                new U("gokce", "gokce.deniz@gmail.com", "yunus", "Karakum sahilinde gün batımı ve kahve aşığı.", "gokcedeniz57", "05331234567", "[\"🌊 Karakum Sakini\", \"☕ Kahve Müdavimi\"]"),
                new U("can", "can@cemsburger.com", "kale", "Cem's Burger Kurucusu & Gurme Burger Şefi.", "cemsburger_sinop", "05429876543", "[\"👑 Mekan Sahibi (Patron)\", \"🍔 Burger Üstadı\"]"),
                new U("selin", "selin.ak@gmail.com", "denizkabugu", "Sinop Üniversitesi öğrencisi. Kampüs ve Karakum arası mekik dokur.", "selinak57", "05353456789", "[\"🎓 Sinop Üni\", \"☕ Kahve Aşığı\"]"),
                new U("emre", "emre.taksi@sinoptaksi.com", "fener", "Sinop Merkez Gece Nöbetçi Taksi. Güvenli ve hızlı ulaşım.", "sinopgecetaksi", "05423125757", "[\"🚕 Merkez Taksi\", \"🌙 Gece Vardiyası\"]"),
                new U("zeynep", "zeynep.sinop@gmail.com", "yelkenli", "Tarihi Cezaevi ve kale surları fotoğrafçısı.", "zeynep.lens", "05367890123", "[\"📸 Şehir Fotoğrafçısı\", \"📍 Sinoplu\"]"),
                new U("mert", "mert.demir@gmail.com", "marti", "Akşamları okey ve masa tenisi turnuvaları.", "mertdemir_57", "05451239876", "[\"🎲 Okey Üstadı\", \"☕ Çay Tiryakisi\"]"),
                new U("melis", "melis.gunes@gmail.com", "hamsi", "Sinop yarımadasında bisiklet turları ve doğa yürüyüşleri.", "melisgunes", "05374561230", "[\"🚴 Yarımada Gezgini\", \"🌿 Doğa Dostu\"]"),
                new U("bugra", "bugra.okey@gmail.com", "kale", "Tarihi Cezaevi Çay Bahçesi müdavimi. 101 ve Düz Okey aranır.", "bugraokey57", "05417894561", "[\"🏆 101 Şampiyonu\", \"📍 Sinoplu\"]"),
                new U("ozlem", "ozlem.k@gmail.com", "yunus", "Kitap, kahve ve Sinop kütüphanesi sessizliği.", "ozlemkitap", "05389632587", "[\"📚 Kitap Kurdu\", \"☕ Tarihi Kahve Müdavimi\"]"),
                new U("baris", "baris.tarih@gmail.com", "denizkabugu", "Sinop Tarihi Cezaevi rehberi ve yerel tarih araştırmacısı.", "baristarih", "05463217894", "[\"🏛 Tarih Rehberi\", \"📍 Sinoplu\"]"),
                new U("ceren", "ceren.deniz@gmail.com", "yelkenli", "Yelken sporu ve rüzgar sörfü tutkunu. Sinop Karadeniz Yelken Kulübü.", "cerenyelken", "05391472583", "[\"⛵ Lisanslı Yelkenci\", \"🌊 Rüzgar Tutkunu\"]"),
                new U("tolga", "tolga.taksi@gmail.com", "fener", "7/24 Sinop Otogar - Havalimanı - Merkez Taksi.", "tolgataksimerkez", "05325719988", "[\"🚕 Hızlı Taksi\", \"📍 Otogar\"]"),
                new U("yasemin", "yasemin.sanat@gmail.com", "marti", "Sinop Sanat Atölyesi eğitmeni, seramik ve resim meraklısı.", "yaseminsanat", "05448529631", "[\"🎨 Sanatçı\", \"📍 Sinoplu\"]"),
                new U("serkan", "serkan.tekel@gmail.com", "kale", "Sinop İskele Gece Tekel & Şarküteri.", "iskeletekel57", "05412587412", "[\"🍺 Gece Açık\", \"🛵 Hızlı Paket\"]"),
                new U("gamze", "gamze.lezzet@gmail.com", "hamsi", "Sinop mantısı, nokul ve yerel lezzet avcısı.", "gamzelezzetleri", "05336547891", "[\"🥟 Mantı Gurmesi\", \"📍 Sinoplu\"]"),
                new U("koray", "koray.muzik@gmail.com", "yunus", "Akustik gitarist, Sinop sahil canlı müzik geceleri.", "koraymuzik57", "05421478523", "[\"🎸 Canlı Müzik\", \"🎙 Akustik\"]"),
                new U("didem", "didem.veteriner@gmail.com", "denizkabugu", "Sinop sokak canları gönüllüsü ve veteriner teknikeri.", "didempati57", "05349874563", "[\"🐾 Hayvansever\", \"📍 Sinoplu\"]"),
                new U("onur", "onur.balik@gmail.com", "yelkenli", "Sinop Balıkçı Barınağı oltacısı. Palamut, çinekop, levrek takibi.", "onurbalik57", "05453698521", "[\"🎣 Kıyı Balıkçısı\", \"🐟 Taze Balık\"]"),
                new U("tugce", "tugce.yoga@gmail.com", "fener", "Akliman ve Hamsilos doğa yogası eğitmeni.", "tugceyoga", "05317418529", "[\"🧘 Doğa Yogası\", \"🌲 Hamsilos Dostu\"]"),
                new U("ali", "ali.sinop@gmail.com", "marti", "Hafta sonu halı saha ve tavla arkadaşı arayan esnaf.", "aliesnaf57", "05439517532", "[\"⚽ Halı Saha Kaptanı\", \"🎲 Tavla Ustası\"]")
        );

        for (U u : seedList) {
            AppUser user = new AppUser(u.username(), DEFAULT_PW_HASH, Role.USER, now);
            user.setEmail(u.email());
            user.setPhone(u.phone());
            user.setBadgesJson(u.badges());
            user.updateProfile(u.avatar(), u.bio(), u.ig(), com.sinopcepte.auth.CheckinVisibility.PUBLIC, false);
            users.save(user);
        }
    }

    private void seedItems() {
        items.findById("m-1").ifPresent(item -> {
            item.setOwnerHandle("berk");
            item.setPhotosJson("[\"https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80\"]");
            item.setMenuJson("[{\"category\":\"Kokteyl\",\"name\":\"Sinop Sunset Signature\",\"price\":\"220 ₺\",\"desc\":\"Nar ekşisi, votka, nane ve taze limon ferahlığı\"},{\"category\":\"Kokteyl\",\"name\":\"Black Sea Mule\",\"price\":\"210 ₺\",\"desc\":\"Zencefil gazozu, rom ve taze böğürtlen\"},{\"category\":\"Atıştırmalık\",\"name\":\"Truffle Parmigiano Fries\",\"price\":\"130 ₺\",\"desc\":\"Trüf yağı ve parmesanlı çıtır patates sepeti\"},{\"category\":\"Atıştırmalık\",\"name\":\"Mini Burger Trio\",\"price\":\"240 ₺\",\"desc\":\"3 adet gurme mini burger ve trüflü dip sos\"}]");
            items.save(item);
        });

        items.findById("m-2").ifPresent(item -> {
            item.setOwnerHandle("aykut");
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
                new AppNotification("n-1", "aykut", "claim", "Mekan Sahipliğiniz Onaylandı! 👑", "\"Nihavent Restaurant Pub\" mekanının onaylı patronu oldunuz. Menü ve etkinlikleri güncelleyebilirsiniz.", "1 saat önce", false, "/mekan/m-2", "Mekanı Yönet", now.minusHours(1)),
                new AppNotification("n-2", "bugra", "okeye4_request", "Yeni Masa Başvurusu Geldi!", "@mert \"Akşam Cezaevi Çay Bahçesinde Düz Okey\" masanıza katılmak istiyor.", "15 dk önce", false, "/okeye4", "Başvuruyu Gör", now.minusMinutes(15)),
                new AppNotification("n-3", "gokce", "checkin", "Arkadaşın Mathiday's Social'da! 📍", "@selin az önce Mathiday's Social mekanına check-in yaptı.", "35 dk önce", true, "/mekan/m-1", "Kimler Orada?", now.minusMinutes(35)),
                new AppNotification("n-4", null, "live_event", "Canlı Maç Yayını Bu Akşam! ⚽", "Galatasaray - Amed SK karşılaşması dev ekranda Nihavent Pub'da canlı yayında.", "Bugün", false, "/mekan/m-2", "Detayları Gör", now.minusHours(3))
        ));
    }
}
