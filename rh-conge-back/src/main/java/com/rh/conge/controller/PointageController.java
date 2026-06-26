package com.rh.conge.controller;

import com.rh.conge.dto.PointageDTO;
import com.rh.conge.entity.TypePresence;
import com.rh.conge.service.PointageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/pointage")
public class PointageController {

    @Autowired
    private PointageService pointageService;

    // ✅ MODIFIÉ : Ajout du paramètre date
    @PostMapping("/arrivee/{utilisateurId}")
    public ResponseEntity<PointageDTO> enregistrerArrivee(
        @PathVariable Long utilisateurId,
        @RequestParam(required = false) @DateTimeFormat(pattern = "HH:mm") LocalTime heure,
        @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date,
        @RequestParam(required = false) String type
    ) {
        LocalDate datePointage = date != null ? date : LocalDate.now();
        TypePresence typePresence = TypePresence.PRESENTIEL;
        if (type != null && !type.isBlank()) {
            try {
                typePresence = TypePresence.valueOf(type);
            } catch (IllegalArgumentException ignored) {}
        }
        return ResponseEntity.ok(pointageService.enregistrerArrivee(utilisateurId, heure, datePointage, typePresence));
    }

    @PutMapping("/depart/{utilisateurId}")
    public ResponseEntity<PointageDTO> enregistrerDepart(
        @PathVariable Long utilisateurId,
        @RequestParam(required = false) @DateTimeFormat(pattern = "HH:mm") LocalTime heure
    ) {
        return ResponseEntity.ok(pointageService.enregistrerDepart(utilisateurId, heure));
    }

    @GetMapping("/user/{utilisateurId}")
    public ResponseEntity<List<PointageDTO>> getPointagesByUser(@PathVariable Long utilisateurId) {
        return ResponseEntity.ok(pointageService.getPointagesByUser(utilisateurId));
    }

    @GetMapping("/user/{utilisateurId}/period")
    public ResponseEntity<List<PointageDTO>> getPointagesByUserAndDateRange(
        @PathVariable Long utilisateurId,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate debut,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fin
    ) {
        return ResponseEntity.ok(pointageService.getPointagesByUserAndDateRange(utilisateurId, debut, fin));
    }

    @GetMapping("/date")
    public ResponseEntity<List<PointageDTO>> getPointagesByDate(
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date
    ) {
        return ResponseEntity.ok(pointageService.getPointagesByDate(date));
    }

    @PutMapping("/{pointageId}/type")
    public ResponseEntity<PointageDTO> updateTypePresence(
        @PathVariable Long pointageId,
        @RequestParam TypePresence type,
        @RequestParam(required = false) String justification
    ) {
        return ResponseEntity.ok(pointageService.updateTypePresence(pointageId, type, justification));
    }

    @GetMapping("/user/{utilisateurId}/heures-mois")
    public ResponseEntity<Double> getHeuresTravailleesMois(
        @PathVariable Long utilisateurId,
        @RequestParam int mois,
        @RequestParam int annee
    ) {
        return ResponseEntity.ok(pointageService.getHeuresTravailleesMois(utilisateurId, mois, annee));
    }
}
