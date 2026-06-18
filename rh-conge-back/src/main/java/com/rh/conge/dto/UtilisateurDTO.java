package com.rh.conge.dto;

import com.rh.conge.entity.Role;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UtilisateurDTO {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private Role role;
    private Integer soldeConge;
    private LocalDate dateEmbauche;
}