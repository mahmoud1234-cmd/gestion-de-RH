package com.rh.conge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "pointage")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pointage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
    
    @Column(name = "date_pointage", nullable = false)
    private LocalDate datePointage;
    
    @Column(name = "heure_arrivee")
    private LocalTime heureArrivee;
    
    @Column(name = "heure_depart")
    private LocalTime heureDepart;
    
    @Column(name = "type")
    private String type = TypePresence.PRESENTIEL.name();
    
    private String justification;
    
    private boolean present = false;
    
    @Column(name = "heures_travaillees")
    private Double heuresTravaillees = 0.0;
    
    @Column(name = "heures_supplementaires")
    private Double heuresSupplementaires = 0.0;
    
    @Column(name = "est_justifie")
    private boolean estJustifie = false;
    
    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();
}