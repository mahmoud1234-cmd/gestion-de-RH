package com.rh.conge.dto;

import com.rh.conge.entity.TypeConge;
import com.rh.conge.entity.StatutDemande;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DemandeCongeDTO {
    private Long id;
    private Long utilisateurId;
    private String utilisateurNom;
    private String utilisateurPrenom;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private TypeConge typeConge;
    private StatutDemande statut;
    private String commentaire;
    private LocalDateTime dateDemande;
    private LocalDateTime dateTraitement;
    private Long managerId;
    private String managerNom;
}