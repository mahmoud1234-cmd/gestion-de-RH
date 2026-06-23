package com.rh.conge.repository;

import com.rh.conge.entity.Salaire;
import com.rh.conge.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalaireRepository extends JpaRepository<Salaire, Long> {
    List<Salaire> findByUtilisateur(Utilisateur utilisateur);
    Optional<Salaire> findByUtilisateurAndMoisAndAnnee(Utilisateur utilisateur, Integer mois, Integer annee);
    List<Salaire> findByMoisAndAnnee(Integer mois, Integer annee);
    List<Salaire> findByEstPayeFalse();
}