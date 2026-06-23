package com.rh.conge.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class SalaireDTO {
    private Long id;
    private Long utilisateurId;
    private String utilisateurNom;
    private String utilisateurPrenom;
    private String utilisateurRole;
    private Integer mois;
    private Integer annee;
    private Double heuresNormales;
    private Double heuresSupplementaires;
    private Double heuresDimanche;
    private Double heuresAbsences;
    private Double tauxHoraire;
    private Double tauxHoraireSupp;
    private Double tauxHoraireDimanche;
    private Double salaireBase;
    private Double salaireSupplementaire;
    private Double salaireDimanche;
    private Double primeAnciennete;
    private Double primeResponsabilite;
    private Double primePerformance;
    private Double salaireBrut;
    private Double cotisationsSociales;
    private Double impots;
    private Double salaireNet;
    private LocalDate dateCalcul;
    private boolean estPaye;
    private List<LigneSalaireDTO> lignes;
}