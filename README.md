# 🏢 Gestion des Congés RH

Plateforme de gestion des congés et des ressources humaines développée avec **Angular 19** (frontend) et **Spring Boot** (backend), déployée sur **Vercel** et **Railway**.

## 🌐 Liens

- **Frontend (Vercel)** : https://rh-conge-front-diu6mydtn-mahmoud1234-cmds-projects.vercel.app
- **Backend (Railway)** : https://gestion-de-rh-production.up.railway.app

---

## ✨ Fonctionnalités

- 🔐 Authentification avec reCAPTCHA
- 📅 Demande et gestion des congés
- 👥 Gestion des employés
- 📊 Tableau de bord Manager / Employé
- 💰 Gestion des salaires
- 🕐 Pointage des présences

---

## 🚀 Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Angular 19, Bootstrap 5, ngx-toastr |
| Backend | Spring Boot, JPA/Hibernate |
| Base de données | PostgreSQL |
| Déploiement frontend | Vercel |
| Déploiement backend | Railway |

---

## 🔑 Comptes de démonstration

> Les comptes suivants existent déjà dans la base de données. Aucune inscription n'est nécessaire.

### 👑 Managers

| Email | Mot de passe | Nom | Prénom |
|-------|-------------|-----|--------|
| manager1@rh.com | manager123 | Martin | Sophie |
| manager2@rh.com | manager456 | Bernard | Luc |
| manager3@rh.com | manager789 | Dubois | Claire |
| manager4@rh.com | manager000 | Moreau | Thomas |

### 👤 Employés

| Email | Mot de passe | Nom | Prénom |
|-------|-------------|-----|--------|
| mahmoudhasnaoui223@gmail.com | _(voir admin)_ | Hasnaoui | Mahmoud |
| employee1@rh.com | emp123 | Dupont | Jean |
| employee2@rh.com | emp456 | Petit | Marie |
| employee3@rh.com | emp789 | Roux | Pierre |
| employee4@rh.com | emp000 | Leroy | Emma |

---

## 🛠️ Lancer en local

### Backend
```bash
cd rh-conge-back
cp .env.example .env
# Configurer PostgreSQL dans .env
./mvnw spring-boot:run
```

### Frontend
```bash
cd rh-conge-front
npm install --legacy-peer-deps
npm start
```

L'app sera disponible sur `http://localhost:4200`.
