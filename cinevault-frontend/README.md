# CineVault — Frontend

Interface Next.js (App Router, TypeScript, Tailwind) du projet CineVault.

## Installation

```bash
npm install
cp .env.local.example .env.local
# éditer .env.local si l'API n'est pas sur localhost:8000
npm run dev
```

L'app est disponible sur http://localhost:3000 (nécessite le backend Django lancé en parallèle).

## Identité visuelle

Direction "cinéma de nuit / enseigne marquee" :
- **Palette** : noir profond (`#0B0B10`), or marquee (`#E8B34D`), néon magenta (`#FF3D81`), turquoise pellicule (`#2DD4BF`)
- **Typographies** : Bebas Neue (display, façon lettres de marquee) + Inter (texte courant)
- **Élément signature** : bandeau défilant façon enseigne de cinéma (`MarqueeTicker`)

## Structure

```
app/            routes (App Router)
components/     composants réutilisables (movies, reviews, users, layout, ui)
lib/api/        client fetch + modules par ressource
lib/types/      types TypeScript partagés avec l'API
hooks/          useAuth (contexte d'authentification JWT)
```

## Build

```bash
npm run build
npm start
```

## Tests

Tests unitaires et de composants avec Jest + React Testing Library.

```bash
npm run test          # lancer une fois
npm run test:watch    # mode watch
npm run test:coverage # avec rapport de couverture
```

Couverture actuelle : client API (headers JWT, refresh automatique, gestion des erreurs), composants de notation, pagination, carte film, et formulaire de critique (auth requise, soumission, erreurs).
