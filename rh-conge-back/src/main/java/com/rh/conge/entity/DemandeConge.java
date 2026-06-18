package com.rh.conge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "demande_conge")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemandeConge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
    
    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;
    
    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type_conge", nullable = false)
    private TypeConge typeConge;
    
    @Enumerated(EnumType.STRING)
    private StatutDemande statut = StatutDemande.EN_ATTENTE;
    
    private String commentaire;
    
    @Column(name = "date_demande")
    private LocalDateTime dateDemande = LocalDateTime.now();
    
    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;
    
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Utilisateur manager;
}