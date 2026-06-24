package com.rh.conge.controller;

import com.rh.conge.dto.SalaireDTO;
import com.rh.conge.entity.Salaire;
import com.rh.conge.service.SalaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/salaire")
public class SalaireController {

    @Autowired
    private SalaireService salaireService;

    @PostMapping("/calculer/{utilisateurId}")
    public ResponseEntity<SalaireDTO> calculerSalaire(
        @PathVariable Long utilisateurId,
        @RequestParam Integer mois,
        @RequestParam Integer annee
    ) {
        return ResponseEntity.ok(salaireService.calculerSalaire(utilisateurId, mois, annee));
    }

    @GetMapping("/user/{utilisateurId}")
    public ResponseEntity<List<SalaireDTO>> getSalairesByUser(@PathVariable Long utilisateurId) {
        return ResponseEntity.ok(salaireService.getSalairesByUser(utilisateurId));
    }

    @GetMapping("/user/{utilisateurId}/month")
    public ResponseEntity<SalaireDTO> getSalaireByMonth(
        @PathVariable Long utilisateurId,
        @RequestParam Integer mois,
        @RequestParam Integer annee
    ) {
        SalaireDTO salaire = salaireService.getSalaireByUserAndMonth(utilisateurId, mois, annee);
        return salaire != null ? ResponseEntity.ok(salaire) : ResponseEntity.notFound().build();
    }
}
