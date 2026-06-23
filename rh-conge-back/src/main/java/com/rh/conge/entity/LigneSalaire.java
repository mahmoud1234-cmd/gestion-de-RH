package com.rh.conge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "ligne_salaire")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LigneSalaire {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "salaire_id")
    private Salaire salaire;
    
    @Column(name = "libelle")
    private String libelle;
    
    @Column(name = "type")
    private String type; // GAIN, DEDUCTION, COTISATION, IMPOT
    
    @Column(name = "montant")
    private Double montant = 0.0;
    
    @Column(name = "taux")
    private Double taux = 0.0;
}