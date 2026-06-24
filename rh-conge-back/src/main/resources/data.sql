-- Insertion des comptes de démonstration (si non existants)

INSERT INTO utilisateur (email, password, nom, prenom, role, solde_conge)
SELECT 'mahmoudhasnaoui223@gmail.com', 'Mahmoud2003@', 'Hasnaoui', 'Mahmoud', 'EMPLOYEE', 25
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE email = 'mahmoudhasnaoui223@gmail.com');

INSERT INTO utilisateur (email, password, nom, prenom, role, solde_conge)
SELECT 'manager1@rh.com', 'manager123', 'Martin', 'Sophie', 'MANAGER', 30
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE email = 'manager1@rh.com');

INSERT INTO utilisateur (email, password, nom, prenom, role, solde_conge)
SELECT 'manager2@rh.com', 'manager456', 'Bernard', 'Luc', 'MANAGER', 30
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE email = 'manager2@rh.com');

INSERT INTO utilisateur (email, password, nom, prenom, role, solde_conge)
SELECT 'manager3@rh.com', 'manager789', 'Dubois', 'Claire', 'MANAGER', 30
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE email = 'manager3@rh.com');

INSERT INTO utilisateur (email, password, nom, prenom, role, solde_conge)
SELECT 'manager4@rh.com', 'manager000', 'Moreau', 'Thomas', 'MANAGER', 30
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE email = 'manager4@rh.com');

INSERT INTO utilisateur (email, password, nom, prenom, role, solde_conge)
SELECT 'employee1@rh.com', 'emp123', 'Dupont', 'Jean', 'EMPLOYEE', 25
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE email = 'employee1@rh.com');

INSERT INTO utilisateur (email, password, nom, prenom, role, solde_conge)
SELECT 'employee2@rh.com', 'emp456', 'Petit', 'Marie', 'EMPLOYEE', 25
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE email = 'employee2@rh.com');

INSERT INTO utilisateur (email, password, nom, prenom, role, solde_conge)
SELECT 'employee3@rh.com', 'emp789', 'Roux', 'Pierre', 'EMPLOYEE', 25
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE email = 'employee3@rh.com');

INSERT INTO utilisateur (email, password, nom, prenom, role, solde_conge)
SELECT 'employee4@rh.com', 'emp000', 'Leroy', 'Emma', 'EMPLOYEE', 25
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE email = 'employee4@rh.com');
