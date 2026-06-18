package com.rh.conge.service;

import com.rh.conge.entity.DemandeConge;
import com.rh.conge.entity.Utilisateur;
import com.rh.conge.entity.StatutDemande;
import com.rh.conge.entity.TypeConge;
import com.rh.conge.repository.DemandeCongeRepository;
import com.rh.conge.repository.UtilisateurRepository;
import com.rh.conge.dto.DemandeCongeDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DemandeCongeService {
    
    @Autowired
    private DemandeCongeRepository demandeRepository;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    private DemandeCongeDTO convertToDTO(DemandeConge demande) {
        DemandeCongeDTO dto = new DemandeCongeDTO();
        dto.setId(demande.getId());
        dto.setUtilisateurId(demande.getUtilisateur().getId());
        dto.setUtilisateurNom(demande.getUtilisateur().getNom());
        dto.setUtilisateurPrenom(demande.getUtilisateur().getPrenom());
        dto.setDateDebut(demande.getDateDebut());
        dto.setDateFin(demande.getDateFin());
        dto.setTypeConge(demande.getTypeConge());
        dto.setStatut(demande.getStatut());
        dto.setCommentaire(demande.getCommentaire());
        dto.setDateDemande(demande.getDateDemande());
        dto.setDateTraitement(demande.getDateTraitement());
        if (demande.getManager() != null) {
            dto.setManagerId(demande.getManager().getId());
            dto.setManagerNom(demande.getManager().getNom());
        }
        return dto;
    }
    
    private long calculerNbJours(LocalDate debut, LocalDate fin) {
        return ChronoUnit.DAYS.between(debut, fin) + 1;
    }
    
    public DemandeCongeDTO creerDemande(Long utilisateurId, DemandeConge demande) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        demande.setUtilisateur(utilisateur);
        demande.setStatut(StatutDemande.EN_ATTENTE);
        demande.setDateDemande(LocalDateTime.now());
        
        // Vérifier solde pour congés payés
        if (demande.getTypeConge() == TypeConge.PAYE) {
            long nbJours = calculerNbJours(demande.getDateDebut(), demande.getDateFin());
            if (nbJours > utilisateur.getSoldeConge()) {
                throw new RuntimeException("Solde de congés insuffisant. Solde disponible: " + utilisateur.getSoldeConge());
            }
        }
        
        DemandeConge saved = demandeRepository.save(demande);
        return convertToDTO(saved);
    }
    
    public List<DemandeCongeDTO> getDemandesByUtilisateur(Long utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        return demandeRepository.findByUtilisateur(utilisateur)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<DemandeCongeDTO> getDemandesEnAttente() {
        return demandeRepository.findByStatutOrderByDateDemandeAsc(StatutDemande.EN_ATTENTE)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public DemandeCongeDTO traiterDemande(Long demandeId, Long managerId, StatutDemande statut) {
        DemandeConge demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        
        Utilisateur manager = utilisateurRepository.findById(managerId)
            .orElseThrow(() -> new RuntimeException("Manager non trouvé"));
        
        demande.setStatut(statut);
        demande.setManager(manager);
        demande.setDateTraitement(LocalDateTime.now());
        
        // Si approuvé et congé payé, déduire du solde
        if (statut == StatutDemande.APPROUVE && demande.getTypeConge() == TypeConge.PAYE) {
            Utilisateur utilisateur = demande.getUtilisateur();
            long nbJours = calculerNbJours(demande.getDateDebut(), demande.getDateFin());
            utilisateur.setSoldeConge(utilisateur.getSoldeConge() - (int) nbJours);
            utilisateurRepository.save(utilisateur);
        }
        
        DemandeConge saved = demandeRepository.save(demande);
        return convertToDTO(saved);
    }
}