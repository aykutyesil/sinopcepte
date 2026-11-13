package com.sinopcepte.campus;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.CurrentUser;

@RestController
@RequestMapping("/api/campus/notes")
public class CampusNoteController {

    private final CampusNoteService campusNoteService;
    private final CurrentUser currentUser;

    public CampusNoteController(CampusNoteService campusNoteService, CurrentUser currentUser) {
        this.campusNoteService = campusNoteService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<CampusNoteDto> list(
        @RequestParam(name = "faculty", required = false) String faculty,
        @RequestParam(name = "department", required = false) String department,
        @RequestParam(name = "examType", required = false) String examType,
        @RequestParam(name = "q", required = false) String q,
        Authentication auth
    ) {
        AppUser user = currentUser.find(auth).orElse(null);
        return campusNoteService.listNotes(faculty, department, examType, q, user);
    }

    @PostMapping
    public ResponseEntity<CampusNoteDto> create(
        @RequestBody CampusNoteService.CreateCampusNoteCmd cmd,
        Authentication auth
    ) {
        AppUser user = currentUser.require(auth);
        return ResponseEntity.ok(campusNoteService.createNote(user, cmd));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<CampusNoteDto> like(
        @PathVariable("id") String id,
        Authentication auth
    ) {
        AppUser user = currentUser.require(auth);
        return ResponseEntity.ok(campusNoteService.toggleLike(user, id));
    }

    @PostMapping("/{id}/download")
    public ResponseEntity<CampusNoteDto> download(
        @PathVariable("id") String id
    ) {
        return ResponseEntity.ok(campusNoteService.incrementDownload(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable("id") String id,
        Authentication auth
    ) {
        AppUser user = currentUser.require(auth);
        campusNoteService.deleteNote(user, id);
        return ResponseEntity.noContent().build();
    }
}
