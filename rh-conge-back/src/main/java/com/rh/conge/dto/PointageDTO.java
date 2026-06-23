package com.rh.conge.dto;

import com.rh.conge.entity.TypePresence;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PointageDTO {
    private Long id;
    private Long utilisateurId;
    private String utilisateurNom;
    private String utilisateurPrenom;
    private LocalDate datePointage;
    private LocalTime heureArrivee;
    private LocalTime heureDepart;
    private TypePresence type;
    private String justification;
    private boolean present;
    private Double heuresTravaillees;
    private Double heuresSupplementaires;
    private boolean estJustifie;
}