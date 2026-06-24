package com.rh.conge.controller;

import com.rh.conge.entity.DemandeConge;
import com.rh.conge.entity.StatutDemande;
import com.rh.conge.dto.DemandeCongeDTO;
import com.rh.conge.service.DemandeCongeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/conges")
public class DemandeCongeController {

    @Autowired
    private DemandeCongeService demandeCongeService;

    @PostMapping("/demander/{utilisateurId}")
    public ResponseEntity<?> demanderConge(
            @PathVariable Long utilisateurId,
            @RequestBody DemandeConge demande) {
        try {
            DemandeCongeDTO nouvelleDemande = demandeCongeService.creerDemande(utilisateurId, demande);
            return ResponseEntity.ok(nouvelleDemande);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/mes-demandes/{utilisateurId}")
    public ResponseEntity<List<DemandeCongeDTO>> getMesDemandes(@PathVariable Long utilisateurId) {
        return ResponseEntity.ok(demandeCongeService.getDemandesByUtilisateur(utilisateurId));
    }

    @GetMapping("/a-traiter")
    public ResponseEntity<List<DemandeCongeDTO>> getDemandesATraiter() {
        return ResponseEntity.ok(demandeCongeService.getDemandesEnAttente());
    }

    @PutMapping("/traiter/{demandeId}")
    public ResponseEntity<?> traiterDemande(
            @PathVariable Long demandeId,
            @RequestParam Long managerId,
            @RequestParam StatutDemande statut) {
        try {
            DemandeCongeDTO demande = demandeCongeService.traiterDemande(demandeId, managerId, statut);
            return ResponseEntity.ok(demande);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
