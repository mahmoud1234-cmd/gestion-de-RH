package com.rh.conge.service;

import com.rh.conge.dto.PointageDTO;
import com.rh.conge.entity.Pointage;
import com.rh.conge.entity.Utilisateur;
import com.rh.conge.entity.TypePresence;
import com.rh.conge.repository.PointageRepository;
import com.rh.conge.repository.UtilisateurRepository;
import com.rh.conge.util.PointageRowMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PointageService {

    @Autowired
    private PointageRepository pointageRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    private PointageDTO convertToDTO(Pointage pointage) {
        PointageDTO dto = new PointageDTO();
        dto.setId(pointage.getId());
        dto.setUtilisateurId(pointage.getUtilisateur().getId());
        dto.setUtilisateurNom(pointage.getUtilisateur().getNom());
        dto.setUtilisateurPrenom(pointage.getUtilisateur().getPrenom());
        dto.setDatePointage(pointage.getDatePointage());
        dto.setHeureArrivee(pointage.getHeureArrivee());
        dto.setHeureDepart(pointage.getHeureDepart());
        dto.setType(PointageRowMapper.resolveType(pointage.getType()));
        dto.setJustification(pointage.getJustification());
        dto.setPresent(pointage.isPresent());
        dto.setHeuresTravaillees(pointage.getHeuresTravaillees());
        dto.setHeuresSupplementaires(pointage.getHeuresSupplementaires());
        dto.setEstJustifie(pointage.isEstJustifie());
        return dto;
    }

    public PointageDTO enregistrerArrivee(Long utilisateurId, LocalTime heure, LocalDate date, TypePresence type) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        var existing = pointageRepository.findByUtilisateurIdAndDate(utilisateurId, date);
        if (existing.isPresent()) {
            throw new RuntimeException("Vous avez déjà pointé le " + date);
        }

        Pointage pointage = new Pointage();
        pointage.setUtilisateur(utilisateur);
        pointage.setDatePointage(date);
        pointage.setHeureArrivee(heure != null ? heure : LocalTime.now());
        pointage.setType(type != null ? type.name() : TypePresence.PRESENTIEL.name());
        pointage.setPresent(true);

        Pointage saved = pointageRepository.save(pointage);
        return convertToDTO(saved);
    }

    public PointageDTO enregistrerArrivee(Long utilisateurId, LocalTime heure, LocalDate date) {
        return enregistrerArrivee(utilisateurId, heure, date, TypePresence.PRESENTIEL);
    }

    public PointageDTO enregistrerArrivee(Long utilisateurId, LocalTime heure) {
        return enregistrerArrivee(utilisateurId, heure, LocalDate.now(), TypePresence.PRESENTIEL);
    }

    public PointageDTO enregistrerDepart(Long utilisateurId, LocalTime heure) {
        utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        LocalDate aujourdhui = LocalDate.now();

        Pointage pointage = pointageRepository
            .findByUtilisateurIdAndDate(utilisateurId, aujourdhui)
            .orElseThrow(() -> new RuntimeException("Aucun pointage trouvé pour aujourd'hui"));

        if (pointage.getHeureDepart() != null) {
            throw new RuntimeException("Vous avez déjà enregistré votre départ");
        }

        LocalTime heureDepart = heure != null ? heure : LocalTime.now();
        pointage.setHeureDepart(heureDepart);

        Duration duration = Duration.between(
            pointage.getHeureArrivee(),
            heureDepart
        );
        double heures = duration.toMinutes() / 60.0;
        pointage.setHeuresTravaillees(heures);

        if (heures > 8) {
            pointage.setHeuresSupplementaires(heures - 8);
        }

        Pointage saved = pointageRepository.save(pointage);
        return convertToDTO(saved);
    }

    @Transactional
    public List<PointageDTO> getPointagesByUser(Long utilisateurId) {
        utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        pointageRepository.repairInvalidTypesForUser(utilisateurId);

        return pointageRepository.findPointageRowsByUtilisateurId(utilisateurId)
            .stream()
            .map(PointageRowMapper::toDtoWithUser)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PointageDTO> getPointagesByUserAndDateRange(
        Long utilisateurId,
        LocalDate debut,
        LocalDate fin
    ) {
        utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return pointageRepository.findPointageRowsByUtilisateurIdAndPeriod(utilisateurId, debut, fin)
            .stream()
            .map(PointageRowMapper::toDtoWithUser)
            .collect(Collectors.toList());
    }

    public PointageDTO updateTypePresence(Long pointageId, TypePresence type, String justification) {
        Pointage pointage = pointageRepository.findById(pointageId)
            .orElseThrow(() -> new RuntimeException("Pointage non trouvé"));

        pointage.setType(type.name());
        pointage.setJustification(justification);
        pointage.setEstJustifie(true);

        Pointage saved = pointageRepository.save(pointage);
        return convertToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PointageDTO> getPointagesByDate(LocalDate date) {
        return pointageRepository.findPointageRowsByDate(date)
            .stream()
            .map(PointageRowMapper::toDtoWithUser)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public double getHeuresTravailleesMois(Long utilisateurId, int mois, int annee) {
        LocalDate debut = LocalDate.of(annee, mois, 1);
        LocalDate fin = debut.withDayOfMonth(debut.lengthOfMonth());

        utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return pointageRepository.findPointageRowsByUtilisateurIdAndPeriod(utilisateurId, debut, fin)
            .stream()
            .mapToDouble(row -> PointageRowMapper.asDouble(row[10]))
            .sum();
    }

    @Transactional
    public int repairPointagesForUser(Long utilisateurId) {
        utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return pointageRepository.repairInvalidTypesForUser(utilisateurId);
    }
}
