package com.rh.conge.dto;

import lombok.Data;

@Data
public class LigneSalaireDTO {
    private Long id;
    private String libelle;
    private String type;
    private Double montant;
}