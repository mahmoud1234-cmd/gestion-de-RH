package com.rh.conge.repository;

import com.rh.conge.entity.Pointage;
import com.rh.conge.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PointageRepository extends JpaRepository<Pointage, Long> {
    
    List<Pointage> findByUtilisateur(Utilisateur utilisateur);
    
    List<Pointage> findByUtilisateurAndDatePointageBetween(
        Utilisateur utilisateur, 
        LocalDate dateDebut, 
        LocalDate dateFin
    );
    
    Optional<Pointage> findByUtilisateurAndDatePointage(
        Utilisateur utilisateur, 
        LocalDate date
    );
    
    List<Pointage> findByDatePointage(LocalDate date);
    
    List<Pointage> findByPresent(boolean present);
    
    @Query("SELECT p FROM Pointage p WHERE p.utilisateur.id = :userId AND p.datePointage = :date")
    Optional<Pointage> findByUtilisateurIdAndDate(Long userId, LocalDate date);
    
    @Query("SELECT COUNT(p) FROM Pointage p WHERE p.present = true AND p.datePointage BETWEEN :debut AND :fin")
    Long countPresentBetween(LocalDate debut, LocalDate fin);
    
    @Query("SELECT p.utilisateur, COUNT(p) FROM Pointage p WHERE p.datePointage BETWEEN :debut AND :fin GROUP BY p.utilisateur")
    List<Object[]> countPresencesByUser(LocalDate debut, LocalDate fin);
    
}