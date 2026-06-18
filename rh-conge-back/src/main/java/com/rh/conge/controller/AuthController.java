package com.rh.conge.controller;

import com.rh.conge.dto.LoginRequestDTO;
import com.rh.conge.entity.Utilisateur;
import com.rh.conge.entity.Role;
import com.rh.conge.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UtilisateurService utilisateurService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        Optional<Utilisateur> utilisateurOpt = utilisateurService.findByEmail(loginRequest.getEmail());
        
        if (utilisateurOpt.isPresent()) {
            Utilisateur utilisateur = utilisateurOpt.get();
            if (utilisateur.getPassword().equals(loginRequest.getPassword())) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", utilisateur.getId());
                response.put("email", utilisateur.getEmail());
                response.put("nom", utilisateur.getNom());
                response.put("prenom", utilisateur.getPrenom());
                response.put("role", utilisateur.getRole());
                response.put("soldeConge", utilisateur.getSoldeConge());
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("Email ou mot de passe incorrect");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Utilisateur utilisateur) {
        // Vérifier si l'email existe déjà
        Optional<Utilisateur> existing = utilisateurService.findByEmail(utilisateur.getEmail());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Cet email est déjà utilisé");
        }
        
        // Définir le rôle par défaut
        if (utilisateur.getRole() == null) {
            utilisateur.setRole(Role.EMPLOYEE);
        }
        
        // Définir le solde par défaut
        if (utilisateur.getSoldeConge() == null) {
            utilisateur.setSoldeConge(25);
        }
        
        Utilisateur saved = utilisateurService.save(utilisateur);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("email", saved.getEmail());
        response.put("nom", saved.getNom());
        response.put("prenom", saved.getPrenom());
        response.put("role", saved.getRole());
        
        return ResponseEntity.ok(response);
    }
}