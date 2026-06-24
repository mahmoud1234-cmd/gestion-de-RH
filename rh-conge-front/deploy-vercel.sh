#!/bin/bash

# Script de déploiement pour Vercel
# Usage: ./deploy-vercel.sh

echo "🚀 RH Conge - Déploiement Vercel"
echo "================================"

# Vérifier si on est à la racine du repo
if [ ! -f "pom.xml" ] || [ ! -f "package.json" ]; then
    echo "❌ Erreur: Assurez-vous d'être à la racine du projet"
    exit 1
fi

echo ""
echo "📦 ÉTAPE 1: Frontend"
echo "==================="
cd rh-conge-front

echo "Installing dependencies..."
npm install

echo "Building Angular app..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo ""
echo "📦 ÉTAPE 2: Backend Java"
echo "======================="
cd ../rh-conge-back

echo "Building Spring Boot app..."
mvn clean package

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

echo ""
echo "✅ Tous les builds sont réussis!"
echo ""
echo "Prochaines étapes:"
echo "1. Poussez le code sur GitHub"
echo "   git add ."
echo "   git commit -m 'deploy: configuration for Vercel'"
echo "   git push origin main"
echo ""
echo "2. Sur Vercel:"
echo "   - Importez rh-conge-front depuis GitHub"
echo "   - Configurez les variables d'environnement"
echo "   - Déploiement automatique ✓"
echo ""
echo "3. Sur Railway (ou Render/Fly):"
echo "   - Déployez rh-conge-back depuis GitHub"
echo "   - Configurez PostgreSQL et les variables d'env"
echo "   - Mettre à jour BACKEND_URL sur Vercel"
echo ""
