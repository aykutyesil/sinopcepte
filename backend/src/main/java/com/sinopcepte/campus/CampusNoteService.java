package com.sinopcepte.campus;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sinopcepte.auth.AppUser;
import jakarta.annotation.PostConstruct;

@Service
public class CampusNoteService {

    public record CreateCampusNoteCmd(
        String faculty,
        String department,
        String courseCode,
        String courseName,
        String term,
        String examType,
        String title,
        String description,
        String fileUrl,
        String fileName,
        String fileSize
    ) {}

    private final CampusNoteRepository noteRepo;
    private final CampusNoteLikeRepository likeRepo;

    public CampusNoteService(CampusNoteRepository noteRepo, CampusNoteLikeRepository likeRepo) {
        this.noteRepo = noteRepo;
        this.likeRepo = likeRepo;
    }

    @Transactional(readOnly = true)
    public List<CampusNoteDto> listNotes(String faculty, String department, String examType, String q, AppUser user) {
        String cleanFaculty = (faculty != null && !faculty.isBlank()) ? faculty.trim().toLowerCase() : null;
        String cleanDepartment = (department != null && !department.isBlank()) ? department.trim().toLowerCase() : null;
        String cleanExamType = (examType != null && !examType.isBlank() && !examType.equalsIgnoreCase("all")) ? examType.trim().toLowerCase() : null;
        String cleanQ = (q != null && !q.isBlank()) ? q.trim().toLowerCase() : null;

        List<CampusNote> notes = noteRepo.searchNotes(cleanFaculty, cleanDepartment, cleanExamType, cleanQ);

        Set<String> likedNoteIds = Collections.emptySet();
        if (user != null) {
            likedNoteIds = new HashSet<>();
            for (CampusNote n : notes) {
                if (likeRepo.existsByNoteIdAndUserHandle(n.getId(), user.getUsername())) {
                    likedNoteIds.add(n.getId());
                }
            }
        }

        final Set<String> finalLiked = likedNoteIds;
        return notes.stream()
            .map(n -> CampusNoteDto.fromEntity(n, finalLiked.contains(n.getId())))
            .toList();
    }

    @Transactional
    public CampusNoteDto createNote(AppUser user, CreateCampusNoteCmd cmd) {
        if (cmd.title() == null || cmd.title().isBlank()) {
            throw new IllegalArgumentException("Ders notu başlığı zorunludur.");
        }
        if (cmd.courseCode() == null || cmd.courseCode().isBlank()) {
            throw new IllegalArgumentException("Ders kodu zorunludur.");
        }

        String id = "cn-" + UUID.randomUUID().toString().substring(0, 8);
        String avatar = user.getAvatar() != null ? user.getAvatar() : "student";
        String name = user.getUsername();

        CampusNote note = new CampusNote(
            id,
            user.getUsername(),
            name,
            avatar,
            cmd.faculty() != null ? cmd.faculty() : "Mühendislik ve Mimarlık Fakültesi",
            cmd.department() != null ? cmd.department() : "Bilgisayar Mühendisliği",
            cmd.courseCode().toUpperCase().trim(),
            cmd.courseName() != null ? cmd.courseName().trim() : cmd.courseCode().toUpperCase(),
            cmd.term() != null ? cmd.term() : "Güz",
            cmd.examType() != null ? cmd.examType() : "Vize",
            cmd.title().trim(),
            cmd.description() != null ? cmd.description().trim() : "",
            cmd.fileUrl() != null && !cmd.fileUrl().isBlank() ? cmd.fileUrl().trim() : "https://drive.google.com",
            cmd.fileName() != null && !cmd.fileName().isBlank() ? cmd.fileName().trim() : "DersNotu.pdf",
            cmd.fileSize() != null && !cmd.fileSize().isBlank() ? cmd.fileSize().trim() : "2.1 MB"
        );

        CampusNote saved = noteRepo.save(note);
        return CampusNoteDto.fromEntity(saved, false);
    }

    @Transactional
    public CampusNoteDto toggleLike(AppUser user, String noteId) {
        CampusNote note = noteRepo.findById(noteId)
            .orElseThrow(() -> new IllegalArgumentException("Ders notu bulunamadı: " + noteId));

        boolean alreadyLiked = likeRepo.existsByNoteIdAndUserHandle(noteId, user.getUsername());
        if (alreadyLiked) {
            likeRepo.deleteByNoteIdAndUserHandle(noteId, user.getUsername());
            note.setLikeCount(Math.max(0, note.getLikeCount() - 1));
        } else {
            likeRepo.save(new CampusNoteLike(noteId, user.getUsername()));
            note.setLikeCount(note.getLikeCount() + 1);
        }

        CampusNote updated = noteRepo.save(note);
        return CampusNoteDto.fromEntity(updated, !alreadyLiked);
    }

    @Transactional
    public CampusNoteDto incrementDownload(String noteId) {
        CampusNote note = noteRepo.findById(noteId)
            .orElseThrow(() -> new IllegalArgumentException("Ders notu bulunamadı: " + noteId));
        note.setDownloadCount(note.getDownloadCount() + 1);
        CampusNote updated = noteRepo.save(note);
        return CampusNoteDto.fromEntity(updated, false);
    }

    @Transactional
    public void deleteNote(AppUser user, String noteId) {
        CampusNote note = noteRepo.findById(noteId)
            .orElseThrow(() -> new IllegalArgumentException("Ders notu bulunamadı: " + noteId));

        boolean isAdmin = user.getRole() == com.sinopcepte.auth.Role.ADMIN;
        boolean isAuthor = note.getAuthorHandle().equalsIgnoreCase(user.getUsername());

        if (!isAdmin && !isAuthor) {
            throw new org.springframework.security.access.AccessDeniedException("Bu ders notunu silme yetkiniz yok.");
        }

        noteRepo.delete(note);
    }

    @PostConstruct
    public void initSeeds() {
        if (noteRepo.count() > 0) return;

        List<CampusNote> seeds = List.of(
            new CampusNote(
                "cn-seed-1",
                "berk",
                "Berk Çetin",
                "laptop",
                "Mühendislik ve Mimarlık Fakültesi",
                "Bilgisayar Mühendisliği",
                "BLM101",
                "Algoritmalar ve Programlama I",
                "Güz",
                "Vize",
                "2023-2024 Vize Çıkmış Soruları & Çözümleri",
                "C dili döngüler, pointerlar ve matris sorularının el yazısı detaylı çözümleri. Final için de çok faydalı.",
                "https://drive.google.com/file/d/example1/view",
                "BLM101_2024_Vize_Cozumleri.pdf",
                "3.4 MB"
            ),
            new CampusNote(
                "cn-seed-2",
                "deniz",
                "Deniz Yılmaz",
                "marti",
                "Mühendislik ve Mimarlık Fakültesi",
                "Bilgisayar Mühendisliği",
                "BLM203",
                "Veri Yapıları",
                "Bahar",
                "Final",
                "Ağaçlar, AVL & Graf Algoritmaları Özet Notu",
                "Ders slaytlarından ve hocanın tahtaya yazdığı kritik konulardan derlenmiş vize-final tam özet.",
                "https://drive.google.com/file/d/example2/view",
                "Veri_Yapilari_Final_Ozet.pdf",
                "5.1 MB"
            ),
            new CampusNote(
                "cn-seed-3",
                "zeynep",
                "Zeynep Kaya",
                "flower",
                "Eğitim Fakültesi",
                "Sınıf Öğretmenliği",
                "EGT105",
                "Gelişim Psikolojisi",
                "Güz",
                "Ders Notu",
                "Piaget, Vygotsky & Erikson Kuramları Tablosu",
                "Vizede çıkan 4 büyük sorunun karşılaştırmalı gelişim kuramları tablosu ve pratik hap bilgiler.",
                "https://drive.google.com/file/d/example3/view",
                "Gelisim_Psikolojisi_Hap_Bilgiler.pdf",
                "1.8 MB"
            ),
            new CampusNote(
                "cn-seed-4",
                "aykut",
                "Aykut Şen",
                "crown",
                "Mühendislik ve Mimarlık Fakültesi",
                "Nükleer Enerji Mühendisliği",
                "NUK301",
                "Radyasyon Fiziği",
                "Güz",
                "Vize",
                "Son 3 Yılın Vize ve Çözümlü Problem Seti",
                "Nükleer reaktör kinetiği ve radyasyon koruma vize çıkmış sorularının adım adım çözümleri.",
                "https://drive.google.com/file/d/example4/view",
                "Nukleer_Fizik_Cikmis_Problemler.pdf",
                "4.7 MB"
            ),
            new CampusNote(
                "cn-seed-5",
                "mehmet",
                "Mehmet Demir",
                "guitar",
                "Fen-Edebiyat Fakültesi",
                "Tarih",
                "TAR201",
                "Osmanlı Müesseseleri ve Medeniyeti Tarihi",
                "Güz",
                "Final",
                "Klasik Dönem Osmanlı Teşkilatı Ders Özeti",
                "Divan-ı Hümayun, timar sistemi ve eyalet yönetimi üzerine kapsamlı final hazırlık notları.",
                "https://drive.google.com/file/d/example5/view",
                "Osmanli_Tarihi_Final_Notu.pdf",
                "2.9 MB"
            ),
            new CampusNote(
                "cn-seed-6",
                "elif",
                "Elif Demir",
                "sparkles",
                "Sağlık Bilimleri Fakültesi",
                "Hemşirelik",
                "HEM201",
                "Dahiliye Hemşireliği",
                "Güz",
                "Büt",
                "Kardiyovasküler & Solunum Sistemi Vaka Çalışmaları",
                "Bütünleme sınavına girenler için vaka analizleri ve kritik soru tipleri.",
                "https://drive.google.com/file/d/example6/view",
                "Dahiliye_Hemsireligi_Vaka_Notlari.pdf",
                "3.8 MB"
            )
        );

        seeds.get(0).setLikeCount(14);
        seeds.get(0).setDownloadCount(68);

        seeds.get(1).setLikeCount(21);
        seeds.get(1).setDownloadCount(112);

        seeds.get(2).setLikeCount(9);
        seeds.get(2).setDownloadCount(45);

        seeds.get(3).setLikeCount(18);
        seeds.get(3).setDownloadCount(87);

        seeds.get(4).setLikeCount(6);
        seeds.get(4).setDownloadCount(32);

        seeds.get(5).setLikeCount(11);
        seeds.get(5).setDownloadCount(54);

        noteRepo.saveAll(seeds);
    }
}
