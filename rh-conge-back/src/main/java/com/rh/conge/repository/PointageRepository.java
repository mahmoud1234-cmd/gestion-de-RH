package com.rh.conge.repository;

import com.rh.conge.entity.Pointage;
import com.rh.conge.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PointageRepository extends JpaRepository<Pointage, Long> {
    
    List<Pointage> findByUtilisateur(Utilisateur utilisateur);

    List<Pointage> findByUtilisateurId(Long utilisateurId);
    
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

    @Query(value = """
        SELECT p.id, p.utilisateur_id, u.nom, u.prenom, p.date_pointage,
               p.heure_arrivee, p.heure_depart, p.type, p.justification,
               p.present, p.heures_travaillees, p.heures_supplementaires, p.est_justifie
        FROM pointage p
        JOIN utilisateur u ON u.id = p.utilisateur_id
        WHERE p.utilisateur_id = :userId
        ORDER BY p.date_pointage DESC
        """, nativeQuery = true)
    List<Object[]> findPointageRowsByUtilisateurId(@Param("userId") Long userId);

    @Query(value = """
        SELECT p.id, p.utilisateur_id, u.nom, u.prenom, p.date_pointage,
               p.heure_arrivee, p.heure_depart, p.type, p.justification,
               p.present, p.heures_travaillees, p.heures_supplementaires, p.est_justifie
        FROM pointage p
        JOIN utilisateur u ON u.id = p.utilisateur_id
        WHERE p.utilisateur_id = :userId
          AND p.date_pointage BETWEEN :debut AND :fin
        ORDER BY p.date_pointage DESC
        """, nativeQuery = true)
    List<Object[]> findPointageRowsByUtilisateurIdAndPeriod(
        @Param("userId") Long userId,
        @Param("debut") LocalDate debut,
        @Param("fin") LocalDate fin
    );

    @Query(value = """
        SELECT p.id, p.utilisateur_id, u.nom, u.prenom, p.date_pointage,
               p.heure_arrivee, p.heure_depart, p.type, p.justification,
               p.present, p.heures_travaillees, p.heures_supplementaires, p.est_justifie
        FROM pointage p
        JOIN utilisateur u ON u.id = p.utilisateur_id
        WHERE p.date_pointage = :date
        ORDER BY p.date_pointage DESC
        """, nativeQuery = true)
    List<Object[]> findPointageRowsByDate(@Param("date") LocalDate date);

    @Modifying
    @Query(value = """
        UPDATE pointage
        SET type = 'PRESENTIEL'
        WHERE utilisateur_id = :userId
          AND (
            type IS NULL
            OR CAST(type AS TEXT) NOT IN (
              'PRESENTIEL','TELE_TRAVAIL','CONGE','ABSENCE','FORMATION',
              'MISSION','RTT','MALADIE','CONGES_PAYES','CONGES_SANS_SOLDE'
            )
          )
        """, nativeQuery = true)
    int repairInvalidTypesForUser(@Param("userId") Long userId);
    
}