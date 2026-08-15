# 🎬 CineVault

Plateforme de critiques et recommandations de films. Les utilisateurs explorent un catalogue synchronisé depuis TMDB, notent et commentent des films, créent des listes personnalisées, suivent d'autres utilisateurs et reçoivent des recommandations personnalisées calculées de façon asynchrone.

![CI](https://github.com/<ton-username>/cinevault/actions/workflows/ci.yml/badge.svg)
![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django)
![DRF](https://img.shields.io/badge/DRF-3.15-red)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Utilisation](#utilisation)
- [API — endpoints principaux](#api--endpoints-principaux)
- [Moteur de recommandation](#moteur-de-recommandation)
- [Tests](#tests)
- [Intégration continue](#intégration-continue)
- [Déploiement](#déploiement)
- [Structure du projet](#structure-du-projet)
- [Roadmap](#roadmap)

---

## Fonctionnalités

- 🔐 **Authentification JWT** (inscription, connexion, refresh token)
- 🎞️ **Catalogue de films** synchronisé automatiquement depuis l'API TMDB (tâche Celery périodique)
- ⭐ **Critiques et notation** (1 à 10) avec contrainte d'unicité par utilisateur/film
- 📋 **Listes personnalisées** (watchlists) publiques ou privées
- 👥 **Système de suivi** entre utilisateurs + fil d'activité
- 🤖 **Recommandations personnalisées** : filtrage collaboratif basé sur les notes, avec fallback par genres pour les nouveaux comptes (cold start)
- 🔍 **Recherche et filtres** avancés (genre, année, note moyenne)
- ⚙️ **Traitement asynchrone** via Celery + Redis (synchro catalogue, recalcul des recommandations)

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Django 5 + Django REST Framework |
| Frontend | Next.js 14 (TypeScript) |
| Base de données | PostgreSQL 16 |
| Cache / broker | Redis |
| Tâches asynchrones | Celery + Celery Beat |
| Stockage fichiers | MinIO (S3-compatible) |
| Authentification | JWT (SimpleJWT) |
| Source de données films | [TMDB API](https://www.themoviedb.org/documentation/api) |
| Conteneurisation | Docker / Docker Compose |
| Tests | Pytest + pytest-django |

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Next.js    │◄────►│  Django/DRF  │◄────►│ PostgreSQL  │
│  (frontend) │ REST │  (API)       │      │             │
└─────────────┘      └──────┬───────┘      └─────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              ┌─────▼─────┐    ┌──────▼──────┐
              │   Redis   │    │    MinIO    │
              │ (broker)  │    │  (fichiers) │
              └─────┬─────┘    └─────────────┘
                    │
          ┌─────────┴──────────┐
          │                    │
   ┌──────▼──────┐     ┌───────▼──────┐
   │Celery Worker│     │ Celery Beat  │
   │(tâches async)│    │ (scheduler)  │
   └─────────────┘     └──────────────┘
```

## Installation

### Prérequis

- Docker et Docker Compose
- Une clé API TMDB gratuite ([obtenir une clé](https://www.themoviedb.org/settings/api))

### Étapes

```bash
# 1. Cloner le repo
git clone https://github.com/<ton-username>/cinevault.git
cd cinevault

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env et renseigner TMDB_API_KEY

# 3. Lancer les conteneurs
docker compose up --build

# 4. Appliquer les migrations (si non fait automatiquement)
docker compose exec backend python manage.py migrate

# 5. Créer un superutilisateur
docker compose exec backend python manage.py createsuperuser

# 6. Lancer la première synchronisation du catalogue
docker compose exec backend python manage.py shell -c \
  "from apps.movies.tasks import sync_genres, sync_popular_movies; sync_genres(); sync_popular_movies()"
```

L'application est ensuite disponible sur :

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000/api |
| Admin Django | http://localhost:8000/admin |
| Console MinIO | http://localhost:9001 |

## Variables d'environnement

Voir `.env.example` pour la liste complète. Les plus importantes :

```env
TMDB_API_KEY=          # obligatoire, clé API TMDB
SECRET_KEY=            # clé secrète Django, à changer en prod
DEBUG=True              # False en production
POSTGRES_DB=cinevault
POSTGRES_USER=cinevault
POSTGRES_PASSWORD=cinevault
REDIS_URL=redis://redis:6379/0
CORS_ORIGINS=http://localhost:3000
```

## Utilisation

1. Créer un compte via `/register`
2. Parcourir le catalogue, filtrer par genre ou note
3. Noter et critiquer un film (une seule critique par film et par utilisateur)
4. Créer une watchlist et y ajouter des films
5. Suivre d'autres utilisateurs pour voir leur activité dans le fil
6. Consulter `/recommendations` : après 3 critiques minimum, l'algorithme bascule automatiquement du mode "découverte par genre" au mode "filtrage collaboratif"

## API — endpoints principaux

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Inscription | Non |
| `POST` | `/api/auth/token/` | Connexion (JWT) | Non |
| `POST` | `/api/auth/token/refresh/` | Rafraîchir le token | Non |
| `GET` | `/api/movies/` | Liste des films (filtres, recherche) | Non |
| `GET` | `/api/movies/{id}/` | Détail d'un film | Non |
| `GET` | `/api/reviews/?movie={id}` | Critiques d'un film | Non |
| `POST` | `/api/reviews/` | Créer une critique | Oui |
| `PATCH` | `/api/reviews/{id}/` | Modifier sa critique | Oui (propriétaire) |
| `GET` | `/api/watchlists/` | Listes publiques + les siennes | Optionnel |
| `POST` | `/api/watchlists/` | Créer une liste | Oui |
| `POST` | `/api/watchlists/{id}/movies/` | Ajouter un film à une liste | Oui (propriétaire) |
| `GET` | `/api/recommendations/` | Recommandations personnalisées | Oui |
| `GET` | `/api/users/{id}/` | Profil public | Non |
| `POST` | `/api/users/{id}/follow/` | Suivre / ne plus suivre | Oui |

Documentation interactive disponible via **drf-spectacular** ou **Swagger UI** (à ajouter si besoin) sur `/api/schema/swagger-ui/`.

## Moteur de recommandation

Le système applique deux stratégies selon l'historique de l'utilisateur :

- **Cold start (< 3 critiques)** : recommandation par affinité de genres, basée sur les films notés ≥ 7 par l'utilisateur.
- **Filtrage collaboratif (≥ 3 critiques)** : identification des utilisateurs aux notations similaires sur les films en commun, puis recommandation de leurs coups de cœur non encore vus.

Le recalcul est effectué chaque nuit via Celery Beat, pour ne jamais bloquer l'API en temps réel. Chaque recommandation est accompagnée d'une raison explicite (`reason`) affichée à l'utilisateur, pour la transparence de l'algorithme.

## Tests

```bash
docker compose exec backend pytest
docker compose exec backend pytest --cov=apps        # avec couverture
```

Couverture fonctionnelle :
- Authentification et permissions (accès refusé si non connecté, modification refusée si non propriétaire)
- Validation métier (note hors plage, critique en double)
- Logique du moteur de recommandation (cold start vs filtrage collaboratif, non-duplication au recalcul)
- Édition de profil (bio, avatar, genres favoris) et isolation entre utilisateurs

### Frontend

```bash
cd cinevault-frontend
npm run test:coverage
```

Tests Jest + React Testing Library : client API (headers JWT, refresh automatique sur 401, gestion des erreurs), composants de notation et pagination, carte film, formulaire de critique (garde d'authentification, soumission, erreurs de validation affichées).

## Intégration continue

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) se déclenche sur chaque push et pull request vers `main`, avec trois jobs indépendants :

| Job | Contenu |
|---|---|
| `backend` | Postgres de service, vérification des migrations manquantes, `check` Django, suite pytest avec couverture |
| `frontend` | Vérification TypeScript (`tsc --noEmit`), lint (`next lint`), tests Jest avec couverture, build de production |
| `docker-build` | Build des deux images Docker (backend + frontend) pour valider les Dockerfiles, exécuté après succès des deux jobs précédents |

Le rapport de couverture backend est publié comme artefact téléchargeable sur chaque run.

## Déploiement

Le projet est prêt pour un déploiement gratuit sur trois plateformes complémentaires : le backend sur **Railway** ou **Render**, le frontend sur **Vercel**. Une fois en place, toute nouvelle version poussée sur `main` se déploie automatiquement (les trois plateformes détectent les push GitHub nativement, sans configuration CI supplémentaire).

### Backend — Railway

1. Créer un compte sur [railway.app](https://railway.app) et importer le repo GitHub.
2. Railway détecte `railway.json` à la racine de `cinevault-backend` et construit l'image via `docker/Dockerfile`.
3. Ajouter deux plugins depuis le tableau de bord Railway : **PostgreSQL** et **Redis**. Railway injecte automatiquement `DATABASE_URL` et `REDIS_URL` dans le service.
4. Renseigner les variables d'environnement restantes (voir `.env.production.example`) : `DJANGO_SETTINGS_MODULE=config.settings.prod`, `SECRET_KEY`, `TMDB_API_KEY`, `CORS_ORIGINS`, `CSRF_TRUSTED_ORIGINS` (avec l'URL Vercel une fois connue).
5. Railway assigne un domaine `*.up.railway.app` — `prod.py` l'ajoute automatiquement à `ALLOWED_HOSTS` via la variable `RAILWAY_PUBLIC_DOMAIN`.
6. Optionnel : dupliquer le service avec la commande `celery -A config worker -l info` (puis `celery -A config beat -l info`) pour activer la synchro TMDB et le recalcul automatique des recommandations. Sans ces workers, l'appli fonctionne normalement — le bouton "Actualiser" de la page recommandations déclenche un recalcul synchrone.

### Backend — Render (alternative)

Le fichier `render.yaml` à la racine du repo décrit un blueprint complet (API + workers Celery + PostgreSQL + Redis).

1. Sur [render.com](https://render.com), choisir **New > Blueprint** et pointer vers le repo.
2. Render lit `render.yaml` et propose de créer les services décrits. Les variables marquées `sync: false` (`TMDB_API_KEY`, `CORS_ORIGINS`, `CSRF_TRUSTED_ORIGINS`) sont à renseigner manuellement dans le tableau de bord.
3. `SECRET_KEY` est généré automatiquement (`generateValue: true`), `DATABASE_URL` et `REDIS_URL` sont liés automatiquement aux services `cinevault-db` et `cinevault-redis`.
4. Le domaine `*.onrender.com` est ajouté automatiquement à `ALLOWED_HOSTS` via `RENDER_EXTERNAL_HOSTNAME`.

> Les services `worker` (Celery) ne sont pas disponibles sur le plan gratuit de Render. Pour une démo, le service `web` seul suffit — les recommandations peuvent être recalculées manuellement via `POST /api/recommendations/refresh/`, déjà exposé par le frontend.

### Frontend — Vercel

1. Sur [vercel.com](https://vercel.com), importer le repo GitHub et sélectionner `cinevault-frontend` comme racine du projet (*Root Directory*).
2. Vercel détecte Next.js automatiquement (`vercel.json` ne fait que confirmer la configuration).
3. Ajouter la variable d'environnement `NEXT_PUBLIC_API_URL` pointant vers l'URL du backend déployé, par exemple `https://cinevault-backend.up.railway.app/api`.
4. Redéployer une fois le backend en ligne si le premier build a eu lieu avant (les pages qui interrogent l'API à la construction retombent silencieusement sur une liste vide en cas d'échec réseau, donc le build ne casse jamais — mais autant avoir les vraies données).
5. Une fois déployé, mettre à jour `CORS_ORIGINS` et `CSRF_TRUSTED_ORIGINS` côté backend avec l'URL Vercel finale.

### Après le premier déploiement

```bash
# Créer un compte admin sur l'instance déployée (Railway/Render fournissent un shell)
python manage.py createsuperuser

# Synchroniser un premier lot de films depuis TMDB
python manage.py shell -c "from apps.movies.tasks import sync_genres, sync_popular_movies; sync_genres(); sync_popular_movies()"
```

### Déploiement continu (CD)

Les trois plateformes redéploient automatiquement à chaque push sur `main` une fois le repo connecté — aucune action GitHub Actions n'est nécessaire dans le cas standard. `.github/workflows/cd.yml` est fourni en option pour ceux qui préfèrent déclencher le déploiement via un *deploy hook* explicite plutôt que l'intégration automatique (utile par exemple pour ne déployer qu'après confirmation manuelle, ou enchaîner strictement après la CI) ; il ne fait rien tant que les secrets correspondants ne sont pas configurés.

## Structure du projet

```
cinevault/
├── .github/workflows/        # CI (tests, lint, build) + CD optionnelle
├── cinevault-backend/        # Django + DRF
│   ├── config/                # settings (dev/prod), urls, celery
│   ├── apps/
│   │   ├── users/
│   │   ├── movies/
│   │   ├── reviews/
│   │   ├── watchlists/
│   │   └── recommendations/
│   ├── tests/
│   └── railway.json           # config de déploiement Railway
├── cinevault-frontend/       # Next.js + TypeScript
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── __tests__/             # tests Jest
│   └── vercel.json            # config de déploiement Vercel
├── render.yaml                # blueprint de déploiement Render (backend)
├── docker-compose.yml
└── .env.example
```

## Roadmap

- [ ] Recherche full-text avec Elasticsearch
- [ ] Notifications en temps réel (WebSocket) pour les nouveaux followers/critiques
- [ ] Export de watchlist en PDF
- [ ] Documentation OpenAPI/Swagger générée automatiquement
- [ ] Mise en cache Redis des endpoints de catalogue à forte fréquentation

---

## Licence

Projet réalisé dans le cadre d'une certification développeur d'applications. Usage pédagogique.
