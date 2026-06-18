package com.rh.conge.service;

import com.rh.conge.entity.Utilisateur;
import com.rh.conge.entity.Role;
import com.rh.conge.repository.UtilisateurRepository;
import com.rh.conge.dto.UtilisateurDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UtilisateurService {
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    private UtilisateurDTO convertToDTO(Utilisateur utilisateur) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(utilisateur.getId());
        dto.setEmail(utilisateur.getEmail());
        dto.setNom(utilisateur.getNom());
        dto.setPrenom(utilisateur.getPrenom());
        dto.setRole(utilisateur.getRole());
        dto.setSoldeConge(utilisateur.getSoldeConge());
        dto.setDateEmbauche(utilisateur.getDateEmbauche());
        return dto;
    }
    
    public List<UtilisateurDTO> getAllUtilisateurs() {
        return utilisateurRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public Optional<Utilisateur> findByEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }
    
    public UtilisateurDTO getUtilisateurById(Long id) {
        return utilisateurRepository.findById(id)
            .map(this::convertToDTO)
            .orElse(null);
    }
    
    public Utilisateur save(Utilisateur utilisateur) {
        return utilisateurRepository.save(utilisateur);
    }
}