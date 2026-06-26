package com.rh.conge.repository;

import com.rh.conge.entity.Salaire;
import com.rh.conge.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalaireRepository extends JpaRepository<Salaire, Long> {
    List<Salaire> findByUtilisateur(Utilisateur utilisateur);
    Optional<Salaire> findByUtilisateurAndMoisAndAnnee(Utilisateur utilisateur, Integer mois, Integer annee);
    List<Salaire> findByMoisAndAnnee(Integer mois, Integer annee);
    List<Salaire> findByEstPayeFalse();

    @Modifying(clearAutomatically = true)
    @Query(value = """
        DELETE FROM ligne_salaire
        WHERE salaire_id IN (
            SELECT id FROM salaire
            WHERE utilisateur_id = :userId AND mois = :mois AND annee = :annee
        )
        """, nativeQuery = true)
    void deleteLignesByUtilisateurMoisAnnee(
        @Param("userId") Long userId,
        @Param("mois") Integer mois,
        @Param("annee") Integer annee
    );

    @Modifying(clearAutomatically = true)
    @Query(value = """
        DELETE FROM salaire
        WHERE utilisateur_id = :userId AND mois = :mois AND annee = :annee
        """, nativeQuery = true)
    void deleteByUtilisateurMoisAnnee(
        @Param("userId") Long userId,
        @Param("mois") Integer mois,
        @Param("annee") Integer annee
    );
}