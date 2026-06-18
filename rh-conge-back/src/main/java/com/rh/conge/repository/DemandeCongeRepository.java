package com.rh.conge.repository;

import com.rh.conge.entity.DemandeConge;
import com.rh.conge.entity.StatutDemande;
import com.rh.conge.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DemandeCongeRepository extends JpaRepository<DemandeConge, Long> {
    List<DemandeConge> findByUtilisateur(Utilisateur utilisateur);
    List<DemandeConge> findByStatut(StatutDemande statut);
    List<DemandeConge> findByUtilisateurAndStatut(Utilisateur utilisateur, StatutDemande statut);
    List<DemandeConge> findByStatutOrderByDateDemandeAsc(StatutDemande statut);
}