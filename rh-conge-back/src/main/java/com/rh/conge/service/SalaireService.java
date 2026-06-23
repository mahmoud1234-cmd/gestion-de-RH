package com.rh.conge.service;

import com.rh.conge.dto.SalaireDTO;
import com.rh.conge.dto.LigneSalaireDTO;
import com.rh.conge.entity.*;
import com.rh.conge.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalaireService {

    @Autowired
    private SalaireRepository salaireRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PointageRepository pointageRepository;

    @Autowired
    private DemandeCongeRepository demandeCongeRepository;

    // ========== CONSTANTES ==========
    
    private static final double TAUX_HORAIRE_EMPLOYE = 12.50;
    private static final double TAUX_HORAIRE_MANAGER = 18.50;
    private static final double MAJORATION_SUPP = 1.25;
    private static final double MAJORATION_DIMANCHE = 2.0;
    
    private static final double COTISATION_MALADIE = 0.0075;
    private static final double COTISATION_RETRAITE = 0.062;
    private static final double COTISATION_CHOMAGE = 0.024;
    private static final double COTISATION_AGIRC = 0.032;
    private static final double CSG_CRDS = 0.025;
    
    private static final double IMPOT_0 = 0.00;
    private static final double IMPOT_1 = 0.11;
    private static final double IMPOT_2 = 0.30;
    private static final double IMPOT_3 = 0.41;
    private static final double IMPOT_4 = 0.45;

    // ========== CONVERSION DTO ==========

    private SalaireDTO convertToDTO(Salaire salaire) {
        SalaireDTO dto = new SalaireDTO();
        dto.setId(salaire.getId());
        dto.setUtilisateurId(salaire.getUtilisateur().getId());
        dto.setUtilisateurNom(salaire.getUtilisateur().getNom());
        dto.setUtilisateurPrenom(salaire.getUtilisateur().getPrenom());
        dto.setUtilisateurRole(salaire.getUtilisateur().getRole().name());
        dto.setMois(salaire.getMois());
        dto.setAnnee(salaire.getAnnee());
        dto.setHeuresNormales(salaire.getHeuresNormales());
        dto.setHeuresSupplementaires(salaire.getHeuresSupplementaires());
        dto.setHeuresDimanche(salaire.getHeuresDimanche());
        dto.setHeuresAbsences(salaire.getHeuresAbsences());
        dto.setTauxHoraire(salaire.getTauxHoraire());
        dto.setTauxHoraireSupp(salaire.getTauxHoraireSupp());
        dto.setTauxHoraireDimanche(salaire.getTauxHoraireDimanche());
        dto.setSalaireBase(salaire.getSalaireBase());
        dto.setSalaireSupplementaire(salaire.getSalaireSupplementaire());
        dto.setSalaireDimanche(salaire.getSalaireDimanche());
        dto.setPrimeAnciennete(salaire.getPrimeAnciennete());
        dto.setPrimeResponsabilite(salaire.getPrimeResponsabilite());
        dto.setPrimePerformance(salaire.getPrimePerformance());
        dto.setSalaireBrut(salaire.getSalaireBrut());
        dto.setCotisationsSociales(salaire.getCotisationsSociales());
        dto.setImpots(salaire.getImpots());
        dto.setSalaireNet(salaire.getSalaireNet());
        dto.setDateCalcul(salaire.getDateCalcul().toLocalDate());
        dto.setEstPaye(salaire.isEstPaye());
        
        if (salaire.getLignes() != null) {
            dto.setLignes(salaire.getLignes().stream()
                .map(this::convertLigneToDTO)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }

    private LigneSalaireDTO convertLigneToDTO(LigneSalaire ligne) {
        LigneSalaireDTO dto = new LigneSalaireDTO();
        dto.setId(ligne.getId());
        dto.setLibelle(ligne.getLibelle());
        dto.setType(ligne.getType());
        dto.setMontant(ligne.getMontant());
        return dto;
    }

    // ========== MÉTHODES PUBLIQUES ==========

    @Transactional
    public SalaireDTO calculerSalaire(Long utilisateurId, Integer mois, Integer annee) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        var existing = salaireRepository.findByUtilisateurAndMoisAndAnnee(utilisateur, mois, annee);
        if (existing.isPresent()) {
            return convertToDTO(existing.get());
        }

        YearMonth yearMonth = YearMonth.of(annee, mois);
        LocalDate debutMois = yearMonth.atDay(1);
        LocalDate finMois = yearMonth.atEndOfMonth();

        List<Pointage> pointages = pointageRepository.findByUtilisateurAndDatePointageBetween(
            utilisateur, debutMois, finMois
        );

        HeuresCalculees heures = calculerHeures(pointages);

        double tauxHoraire = (utilisateur.getRole() == Role.MANAGER) 
            ? TAUX_HORAIRE_MANAGER 
            : TAUX_HORAIRE_EMPLOYE;

        double tauxHoraireSupp = tauxHoraire * MAJORATION_SUPP;
        double tauxHoraireDimanche = tauxHoraire * MAJORATION_DIMANCHE;

        double salaireBase = heures.heuresNormales * tauxHoraire;
        double salaireSupp = heures.heuresSupplementaires * tauxHoraireSupp;
        double salaireDimanche = heures.heuresDimanche * tauxHoraireDimanche;

        double primeAnciennete = calculerPrimeAnciennete(utilisateur);
        double primeResponsabilite = (utilisateur.getRole() == Role.MANAGER) ? 200.0 : 0.0;
        double primePerformance = calculerPrimePerformance(heures);

        double salaireBrut = salaireBase + salaireSupp + salaireDimanche 
                           + primeAnciennete + primeResponsabilite + primePerformance;

        double cotisationsSociales = salaireBrut * COTISATION_MALADIE 
                                   + salaireBrut * COTISATION_RETRAITE
                                   + salaireBrut * COTISATION_CHOMAGE
                                   + salaireBrut * COTISATION_AGIRC
                                   + salaireBrut * CSG_CRDS;

        double impots = calculerImpots(salaireBrut);

        double salaireNet = salaireBrut - cotisationsSociales - impots;

        Salaire salaire = new Salaire();
        salaire.setUtilisateur(utilisateur);
        salaire.setMois(mois);
        salaire.setAnnee(annee);
        
        salaire.setHeuresNormales(heures.heuresNormales);
        salaire.setHeuresSupplementaires(heures.heuresSupplementaires);
        salaire.setHeuresDimanche(heures.heuresDimanche);
        salaire.setHeuresAbsences(heures.heuresAbsences);
        
        salaire.setTauxHoraire(tauxHoraire);
        salaire.setTauxHoraireSupp(tauxHoraireSupp);
        salaire.setTauxHoraireDimanche(tauxHoraireDimanche);
        
        salaire.setSalaireBase(salaireBase);
        salaire.setSalaireSupplementaire(salaireSupp);
        salaire.setSalaireDimanche(salaireDimanche);
        
        salaire.setPrimeAnciennete(primeAnciennete);
        salaire.setPrimeResponsabilite(primeResponsabilite);
        salaire.setPrimePerformance(primePerformance);
        
        salaire.setSalaireBrut(salaireBrut);
        salaire.setCotisationsSociales(cotisationsSociales);
        salaire.setImpots(impots);
        salaire.setSalaireNet(salaireNet);
        salaire.setDateCalcul(LocalDateTime.now());

        salaire.setLignes(creerLignesSalaire(salaire));

        Salaire saved = salaireRepository.save(salaire);
        return convertToDTO(saved);
    }

    // ✅ AJOUTER CES MÉTHODES
    public List<SalaireDTO> getSalairesByUser(Long utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        return salaireRepository.findByUtilisateur(utilisateur)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public SalaireDTO getSalaireByUserAndMonth(Long utilisateurId, Integer mois, Integer annee) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        return salaireRepository.findByUtilisateurAndMoisAndAnnee(utilisateur, mois, annee)
            .map(this::convertToDTO)
            .orElse(null);
    }

    // ========== MÉTHODES PRIVÉES ==========

    private HeuresCalculees calculerHeures(List<Pointage> pointages) {
        double normales = 0.0;
        double supplementaires = 0.0;
        double dimanche = 0.0;
        double absences = 0.0;

        for (Pointage p : pointages) {
            if (p.getHeuresTravaillees() == null || p.getHeuresTravaillees() == 0) {
                absences += 7.0;
                continue;
            }

            LocalDate date = p.getDatePointage();
            boolean estDimanche = date.getDayOfWeek() == DayOfWeek.SUNDAY;

            double heuresJour = 7.0;
            double heuresRestantes = p.getHeuresTravaillees() - heuresJour;

            if (heuresRestantes > 0) {
                if (estDimanche) {
                    dimanche += p.getHeuresTravaillees();
                } else {
                    normales += heuresJour;
                    supplementaires += heuresRestantes;
                }
            } else {
                if (estDimanche) {
                    dimanche += p.getHeuresTravaillees();
                } else {
                    normales += p.getHeuresTravaillees();
                }
            }
        }

        HeuresCalculees result = new HeuresCalculees();
        result.heuresNormales = Math.round(normales * 10.0) / 10.0;
        result.heuresSupplementaires = Math.round(supplementaires * 10.0) / 10.0;
        result.heuresDimanche = Math.round(dimanche * 10.0) / 10.0;
        result.heuresAbsences = Math.round(absences * 10.0) / 10.0;
        
        return result;
    }

    private double calculerPrimeAnciennete(Utilisateur utilisateur) {
        if (utilisateur.getDateEmbauche() == null) return 0.0;
        
        long annees = ChronoUnit.YEARS.between(utilisateur.getDateEmbauche(), LocalDate.now());
        
        if (annees < 2) return 0.0;
        if (annees < 5) return 50.0;
        if (annees < 10) return 100.0;
        if (annees < 20) return 200.0;
        return 300.0;
    }

    private double calculerPrimePerformance(HeuresCalculees heures) {
        double heuresTotales = heures.heuresNormales + heures.heuresSupplementaires + heures.heuresDimanche;
        
        if (heuresTotales >= 160) return 150.0;
        if (heuresTotales >= 140) return 100.0;
        if (heuresTotales >= 120) return 50.0;
        return 0.0;
    }

    private double calculerImpots(double salaireBrut) {
        if (salaireBrut <= 10000) return salaireBrut * IMPOT_0;
        if (salaireBrut <= 25000) return salaireBrut * IMPOT_1;
        if (salaireBrut <= 50000) return salaireBrut * IMPOT_2;
        if (salaireBrut <= 100000) return salaireBrut * IMPOT_3;
        return salaireBrut * IMPOT_4;
    }

    private List<LigneSalaire> creerLignesSalaire(Salaire salaire) {
        List<LigneSalaire> lignes = new ArrayList<>();

        ajouterLigne(lignes, salaire, "Salaire de base", "GAIN", salaire.getSalaireBase());
        ajouterLigne(lignes, salaire, "Heures supplémentaires", "GAIN", salaire.getSalaireSupplementaire());
        ajouterLigne(lignes, salaire, "Heures dimanche", "GAIN", salaire.getSalaireDimanche());
        ajouterLigne(lignes, salaire, "Prime ancienneté", "GAIN", salaire.getPrimeAnciennete());
        if (salaire.getPrimeResponsabilite() > 0) {
            ajouterLigne(lignes, salaire, "Prime responsabilité", "GAIN", salaire.getPrimeResponsabilite());
        }
        ajouterLigne(lignes, salaire, "Prime performance", "GAIN", salaire.getPrimePerformance());

        double cotisationMaladie = salaire.getSalaireBrut() * COTISATION_MALADIE;
        double cotisationRetraite = salaire.getSalaireBrut() * COTISATION_RETRAITE;
        double cotisationChomage = salaire.getSalaireBrut() * COTISATION_CHOMAGE;
        double cotisationAgirc = salaire.getSalaireBrut() * COTISATION_AGIRC;
        double csgCrds = salaire.getSalaireBrut() * CSG_CRDS;

        ajouterLigne(lignes, salaire, "Cotisation Maladie", "COTISATION", -cotisationMaladie);
        ajouterLigne(lignes, salaire, "Cotisation Retraite", "COTISATION", -cotisationRetraite);
        ajouterLigne(lignes, salaire, "Cotisation Chômage", "COTISATION", -cotisationChomage);
        ajouterLigne(lignes, salaire, "Cotisation AGIRC", "COTISATION", -cotisationAgirc);
        ajouterLigne(lignes, salaire, "CSG/CRDS", "COTISATION", -csgCrds);

        ajouterLigne(lignes, salaire, "Impôt sur le revenu", "IMPOT", -salaire.getImpots());

        return lignes;
    }

    private void ajouterLigne(List<LigneSalaire> lignes, Salaire salaire, String libelle, String type, Double montant) {
        LigneSalaire ligne = new LigneSalaire();
        ligne.setSalaire(salaire);
        ligne.setLibelle(libelle);
        ligne.setType(type);
        ligne.setMontant(montant);
        lignes.add(ligne);
    }

    // ========== CLASSE INTERNE ==========

    private static class HeuresCalculees {
        double heuresNormales;
        double heuresSupplementaires;
        double heuresDimanche;
        double heuresAbsences;
    }
}