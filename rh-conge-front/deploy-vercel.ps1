#!/bin/bash

# Windows PowerShell equivalent: deploy-vercel.ps1
# Script de déploiement pour Vercel (Windows)
# Usage: ./deploy-vercel.ps1 ou juste double-cliquer

Write-Host "🚀 RH Conge - Déploiement Vercel" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Vérifier si on est à la racine du repo
if (-not (Test-Path "pom.xml") -or -not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Assurez-vous d'être à la racine du projet" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 ÉTAPE 1: Frontend" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

Set-Location rh-conge-front

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Building Angular app..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 ÉTAPE 2: Backend Java" -ForegroundColor Cyan
Write-Host "======================="  -ForegroundColor Cyan

Set-Location ../rh-conge-back

Write-Host "Building Spring Boot app..." -ForegroundColor Yellow
mvn clean package

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Tous les builds sont réussis!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Poussez le code sur GitHub"
Write-Host "   git add ."
Write-Host "   git commit -m 'deploy: configuration for Vercel'"
Write-Host "   git push origin main"
Write-Host ""
Write-Host "2. Sur Vercel:"
Write-Host "   - Importez rh-conge-front depuis GitHub"
Write-Host "   - Configurez les variables d'environnement"
Write-Host "   - Déploiement automatique ✓"
Write-Host ""
Write-Host "3. Sur Railway (ou Render/Fly):"
Write-Host "   - Déployez rh-conge-back depuis GitHub"
Write-Host "   - Configurez PostgreSQL et les variables d'env"
Write-Host "   - Mettre à jour BACKEND_URL sur Vercel"
Write-Host ""
