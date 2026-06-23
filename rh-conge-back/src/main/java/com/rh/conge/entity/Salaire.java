package com.rh.conge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "salaire")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Salaire {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
    
    @Column(name = "mois", nullable = false)
    private Integer mois;
    
    @Column(name = "annee", nullable = false)
    private Integer annee;
    
    // Heures travaillées
    @Column(name = "heures_normales")
    private Double heuresNormales = 0.0;
    
    @Column(name = "heures_supplementaires")
    private Double heuresSupplementaires = 0.0;
    
    @Column(name = "heures_dimanche")
    private Double heuresDimanche = 0.0;
    
    @Column(name = "heures_absences")
    private Double heuresAbsences = 0.0;
    
    // Taux horaires
    @Column(name = "taux_horaire")
    private Double tauxHoraire = 0.0;
    
    @Column(name = "taux_horaire_supp")
    private Double tauxHoraireSupp = 0.0;
    
    @Column(name = "taux_horaire_dimanche")
    private Double tauxHoraireDimanche = 0.0;
    
    // Salaires
    @Column(name = "salaire_base")
    private Double salaireBase = 0.0;
    
    @Column(name = "salaire_supplementaire")
    private Double salaireSupplementaire = 0.0;
    
    @Column(name = "salaire_dimanche")
    private Double salaireDimanche = 0.0;
    
    // Primes
    @Column(name = "prime_anciennete")
    private Double primeAnciennete = 0.0;
    
    @Column(name = "prime_responsabilite")
    private Double primeResponsabilite = 0.0;
    
    @Column(name = "prime_performance")
    private Double primePerformance = 0.0;
    
    // Totaux
    @Column(name = "salaire_brut")
    private Double salaireBrut = 0.0;
    
    @Column(name = "cotisations_sociales")
    private Double cotisationsSociales = 0.0;
    
    @Column(name = "impots")
    private Double impots = 0.0;
    
    @Column(name = "salaire_net")
    private Double salaireNet = 0.0;
    
    @Column(name = "date_calcul")
    private LocalDateTime dateCalcul = LocalDateTime.now();
    
    @Column(name = "est_paye")
    private boolean estPaye = false;
    
    @OneToMany(mappedBy = "salaire", cascade = CascadeType.ALL)
    private List<LigneSalaire> lignes = new ArrayList<>();
}