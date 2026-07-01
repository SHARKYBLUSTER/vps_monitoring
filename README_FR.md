# VPS Monitoring Dashboard

> Un tableau de bord léger et open-source pour surveiller en temps réel l'état de vos serveurs VPS.

---

## 📌 À propos

**VPS Monitoring Dashboard** est une solution complète et sécurisée pour superviser les métriques clés de votre serveur (CPU, RAM, Disque, Réseau, Processus, Docker) directement depuis un navigateur web. Le projet utilise une **architecture API REST + SSR** avec rafraîchissement automatique des données, prend en charge le **multi-langues (Français/Anglais)** et intègre des fonctionnalités avancées de sécurité et de configuration.

---

## ✅ Fonctionnalités

### 📊 **Surveillance en temps réel**
- **CPU** : Utilisation en %, nombre de cœurs, modèle et vitesse
- **RAM** : Utilisation en %, mémoire utilisée/totale, mémoire libre
- **Disque** : Espace utilisé, total, disponible, pourcentage d'utilisation
- **Réseau** : Téléchargement/Upload en KB/s par interface réseau active
- **Processus** : Top 5 processus consommateurs de CPU/RAM avec utilisateur, PID et pourcentages

### 🎨 **Interface moderne et responsive**
- Barres de progression animées pour toutes les métriques
- Design responsive (mobile-friendly) avec grilles CSS adaptatives
- Tableaux triables (par CPU ou RAM pour les processus)
- Rafraîchissement dynamique sans rechargement de page (via setInterval configurable)
- **Mode sombre** : Thème alternatif avec persistance via localStorage, appliqué de manière cohérente sur toutes les pages (dashboard, configuration, login)
- **Boutons unifiés** : Style CSS cohérent pour tous les boutons (logout, configuration, etc.)
- **Icônes** : Intégration de Font Awesome 6.4.0 via CDN pour les icônes du menu
- Favicon personnalisé (loupe avec centre bleu et manche noir)

### ⚠️ **Alertes intelligentes**
- Seuils configurables pour CPU, RAM et Disque (via interface ou .env)
- **Niveaux d'alerte** : Warning (CPU/RAM) et Danger (Disque)
- Notifications en temps réel avec détection des nouvelles alertes et des résolutions
- Historique des alertes stocké en base de données SQLite
- **Notifications Telegram** : Configuration complète (token, chat ID, cooldown 1-1440 min) avec bouton de test intégré
- **Cooldown configurable** : Délai entre notifications pour éviter le spam (1-1440 minutes)
- **Notification de résolution** : Option pour notifier quand une alerte est résolue

### 📈 **Historique et analyse**
- **Stockage SQLite** (better-sqlite3) avec tables dédiées : metrics, alerts, docker_containers, docker_alerts
- **Paramètre de rétention configurable** : Durée de stockage des données (1-24 mois)
- Collecte automatique avec intervalle configurable (défaut : 5 secondes)
- **Endpoints API** pour récupérer les données historiques avec filtrage temporel
- **Agrégation intelligente** : Données groupées par 30 minutes (jour), par jour (semaine/mois)
- **Nettoyage automatique** : Suppression des anciennes données selon la période de rétention

### ⚙️ **Configuration avancée**
- **Menu de configuration** accessible depuis l'interface (icône ⚙️)
- **Intervalle de collecte** : Ajustement de la fréquence de collecte des métriques (en ms, minimum 1000ms)
- **Rétention des données** : Paramétrage de la durée de stockage (1-24 mois)
- **Effacement des données** : Bouton pour supprimer toutes les données historiques (SQLite + JSON) avec confirmation explicite
- **Gestion du thème** : Basculer entre mode clair/sombre depuis le menu configuration
- **Décalage horaire** : Paramétrage du décalage UTC (+/- heures, -12 à +14) pour l'affichage des graphiques historiques
- **Visibilité Docker Engine** : Option pour afficher ou masquer la section Docker du dashboard
- **Multi-langues** : Sélecteur de langue (Français/Anglais) avec persistance via localStorage
- **Seuils d'alerte** : Configuration des seuils CPU/RAM/Disque (0-100%) directement depuis la modale
- **Notifications Telegram** : Configuration complète avec test de connexion et envoi de test
- **Présélections d'intervalle** : Boutons prédéfinis pour faciliter la configuration

### 🔍 **Surveillance avancée des processus**
- **Top 5 processus** : Identification des processus les plus gourmands en CPU et RAM
- Tri dynamique par CPU ou mémoire (boutons de tri actifs)
- Visualisation avec barres de progression inline
- **Analyse cohérente** : Données alignées avec l'utilisation globale CPU/RAM
- **Deux méthodes de collecte** : Commande `ps aux` (préférée, donne directement les %) + fallback sur systeminformation.processes()
- **Affichage détaillé** : PID, nom, utilisateur, %CPU, %RAM

### 🔌 **Sécurité des ports**
- **Surveillance des ports ouverts** : Liste des ports TCP en écoute (état LISTEN)
- **Indicateur visuel** : 🟢 (local - 127.0.0.1/::1) ou 🟠 (externe - 0.0.0.0/::)
- **Identification des services** : Base de données de ports connus (SSH:22, HTTP:80, HTTPS:443, MySQL:3306, etc.)
- **Niveau de sécurité** : Notation en étoiles (⭐⭐⭐ = port système <1024, ⭐⭐☆ = port enregistré 1024-49151, ⭐☆☆ = port dynamique >49151)
- **Classification automatique** : Ports système (<1024), enregistrés (1024-49151), dynamiques (>49151)
- **Détection multi-méthode** : systeminformation.networkConnections() + fallback sur commande `ss -tlnp`

### 🐳 **Surveillance Docker complète**
- **Docker Engine** : Statut (running/stopped), version, OS, architecture, nombre de CPU, mémoire totale
- **Conteneurs** : Liste complète avec nom, ID (12 premiers caractères), image, état (Running/Stopped/Paused), ports publiés/exposés, date de création, commande
- **Stats conteneurs** : Nombre total, en cours, arrêtés, en pause
- **Images** : Liste complète avec repoTags (nom:tag), ID (12 premiers caractères), taille, date de création, statut (dangling/untagged)
- **Stats images** : Nombre total, taille totale, images dangling, images untagged
- **Détails étendus** : Bouton toggle pour afficher/masquer les tableaux détaillés des conteneurs et images
- **Graphiques par conteneur** : Évolution CPU et RAM avec agrégation par période
- **Alertes Docker** : Détection des conteneurs arrêtés, CPU > 90%, RAM > 85%
- **Contrôles** : Boutons Démarrer/Arrêter/Redémarrer directement depuis l'interface
- **Historique Docker** : Stockage SQLite avec nettoyage automatique après 91 jours
- **API Docker simplifiée** : Endpoint `/api/docker-simple` pour les infos de base (running/stopped/total)
- **API Docker détaillée** : Endpoint `/api/docker-detailed` pour conteneurs + images avec tous les détails

### 🔐 **Sécurité renforcée**
- **Authentification obligatoire** : Protection de toutes les routes (dashboard + API) via sessions
- **Gestion des sessions** : express-session avec cookie sécurisé (httpOnly, sameSite: lax, maxAge: 24h)
- **Hashage des mots de passe** : bcryptjs avec cost factor 10
- **Rate limiting** : 5 tentatives de login maximum par fenêtre de 15 minutes, basé sur IP
- **CORS strict** : Liste blanche des origines autorisées (ALLOWED_ORIGINS obligatoire)
- **Protection CSRF** : Régénération de session ID après login (session fixation prevention)
- **Validation des entrées** : Vérification stricte des paramètres API (types, plages de valeurs)
- **Sanitization** : Utilisation de execFile au lieu de exec pour éviter l'injection de commande
- **Audit de sécurité** : Documentation des vulnérabilités et mesures de protection

### 📊 **Visualisation avec Graphiques**
- **4 graphiques principaux** : CPU, RAM, Disque (utilisation en %), Réseau (téléchargement/envoi en KB/s)
- **Sélection de période** : Jour, Semaine, Mois, Trimestre (indépendante pour chaque graphique)
- **Mise à jour automatique** : Toutes les minutes pour les données graphiques
- **Technologie** : Chart.js (v4.4.0) via CDN
- **Agrégation jour** : 48 points de données (1 toutes les 30 minutes) avec valeur MAX
- **Agrégation semaine/mois** : 1 point par jour avec valeur MAX
- **Affichage cohérent** : Utilisation de dates UTC pour éviter les décalages horaires

---

## 🚀 Installation

### Prérequis
- Node.js (v16 ou supérieur, recommandé v18+)
- npm ou yarn
- Un serveur VPS ou local pour tester
- **Docker Engine** (pour la surveillance Docker - optionnel)
- **Git** (pour le déploiement)

### Étapes

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/SHARKYBLUSTER/vps_monitoring.git
   cd vps_monitoring
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer l'environnement** (obligatoire) :
   ```bash
   cp .env.example .env
   # Modifier le fichier .env avec vos identifiants
   nano .env  # ou utiliser votre éditeur préféré
   ```
   
   **Variables obligatoires** :
   ```ini
   # Authentification
   ADMIN_USER=votre_utilisateur
   ADMIN_PASSWORD=votre_mot_de_passe
   SESSION_SECRET=votre_cle_secrete_aleatoire
   
   # Sécurité CORS (obligatoire)
   ALLOWED_ORIGINS=http://localhost:3000,https://votre-domaine.com
   ```
   
   **Générer une clé secrète sécurisée** :
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Installer Docker (optionnel - pour la surveillance Docker)** :
   
   Si vous souhaitez surveiller vos conteneurs Docker, installez Docker Engine :
   
   ```bash
   # Pour Debian/Ubuntu
   sudo apt-get update
   sudo apt-get install -y docker.io
   
   # Démarrer et activer Docker
   sudo systemctl enable docker
   sudo systemctl start docker
   
   # Vérifier l'installation
   docker --version
   sudo docker run hello-world
   ```
   
   **Ajouter votre utilisateur au groupe docker** (pour éviter sudo) :
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker  # Appliquer les changements sans redémarrer
   ```
   
   **⚠️ Important** : Après avoir ajouté votre utilisateur au groupe docker, vous devez redémarrer votre session ou exécuter `newgrp docker` pour que les changements prennent effet.

5. **Installer procps (optionnel - pour la surveillance des processus)** :
   ```bash
   # Pour Debian/Ubuntu
   sudo apt-get install -y procps
   ```
   
   **Note** : La commande `ps aux` est utilisée par défaut pour récupérer les processus avec leurs pourcentages CPU/RAM.

6. **Démarrer le serveur** :
   ```bash
   # Mode développement (avec rechargement automatique)
   npm run dev
   
   # Mode production
   npm start
   ```

7. **Utiliser PM2 (Recommandé pour la production)** :
   
   **PM2** est un gestionnaire de processus Node.js pour gérer des applications en production.
   
   **Prérequis** : Avant de lancer PM2, assurez-vous que Node.js a les permissions nécessaires pour surveiller les processus :
   ```bash
   sudo setcap cap_sys_ptrace,cap_dac_read_search+ep /usr/bin/node
   ```
   
   **Installation** (si ce n'est pas déjà fait) :
   ```bash
   npm install -g pm2
   ```
   
   **Lancer le serveur** :
   ```bash
   pm2 start backend/app.js --name "vps_monitoring"
   ```
   
   **Options utiles** :
   - `--name` : Donne un nom personnalisé à votre processus.
   - `--watch` : Redémarre automatiquement en cas de modification des fichiers (utile en développement).
   - `--max-memory-restart 300M` : Redémarre si la mémoire dépasse 300 Mo.
   
   **Commandes utiles avec PM2** :
   
   | Commande | Description |
   |----------|-------------|
   | `pm2 list` | Liste les processus en cours. |
   | `pm2 logs vps_monitoring` | Affiche les logs en temps réel. |
   | `pm2 logs --lines 100` | Affiche les 100 dernières lignes de logs. |
   | `pm2 restart vps_monitoring` | Redémarre le processus. |
   | `pm2 stop vps_monitoring` | Arrête le processus. |
   | `pm2 delete vps_monitoring` | Supprime le processus de la liste. |
   | `pm2 save` | Sauvegarde la liste des processus. |
   | `pm2 startup` | Génère une commande pour lancer PM2 au démarrage du serveur. |
   
   **Exemple complet** :
   ```bash
   pm2 start backend/app.js --name "vps_monitoring" --max-memory-restart 300M
   pm2 save
   pm2 startup
   ```

8. **Déploiement avec Docker** :

   VPS Monitoring peut être déployé dans un container Docker pour une isolation et une gestion simplifiée.
   
   **⚠️ Important** : Pour surveiller les métriques **globales du système hôte** (CPU, RAM, disque, processus, réseau), le container doit être lancé en **mode privilégié** avec accès aux namespaces système.
   
   ### Prérequis
   - Docker Engine installé sur votre VPS
   - Accès root ou sudo pour les commandes Docker

   ### Option A : Avec docker-compose (Recommandé)

   Le projet inclut un fichier `docker-compose.yml` configuré pour le monitoring global :
   
   ```yaml
   version: '3.8'
   services:
     vps_monitoring:
       build: .
       ports:
         - "3000:3000"
       network_mode: host
       pid: host
       privileged: true
       volumes:
         - ./data:/app/data
         - /var/run/docker.sock:/var/run/docker.sock:ro
       environment:
         - NODE_ENV=production
       restart: unless-stopped
   ```
   
   **Lancer avec docker-compose** :
   ```bash
   # 1. Cloner et entrer dans le projet
   git clone https://github.com/SHARKYBLUSTER/vps_monitoring.git
   cd vps_monitoring
   
   # 2. Créer votre fichier .env (optionnel - utilise les valeurs par défaut sinon)
   cp .env.example .env
   nano .env  # Modifier les identifiants
   
   # 3. Lancer avec docker-compose
   docker-compose up -d --build
   ```
   
   **Ce que fait docker-compose** :
   - `network_mode: host` - Accès aux interfaces réseau de l'hôte
   - `pid: host` - Accès aux processus de l'hôte via /proc
   - `privileged: true` - Permissions étendues pour systeminformation
   - Monte `/var/run/docker.sock` - Pour surveiller Docker Engine
   - Monte `./data` - Persistance de la base SQLite

   ### Option B : Avec docker run

   ```bash
   # Build l'image
   docker build -t vps_monitoring .
   
   # Lancer le container
   docker run -d \
     --name vps_monitoring \
     --restart unless-stopped \
     --net=host \
     --pid=host \
     --privileged \
     -v $(pwd)/data:/app/data \
     -v /var/run/docker.sock:/var/run/docker.sock:ro \
     -e ADMIN_USER=admin \
     -e ADMIN_PASSWORD=votre_mot_de_passe \
     -e SESSION_SECRET=votre_cle_secrete \
     -e ALLOWED_ORIGINS=http://localhost:3000 \
     -p 3000:3000 \
     vps_monitoring
   ```

   ### Commandes utiles Docker

   | Commande | Description |
   |----------|-------------|
   | `docker-compose logs -f` | Voir les logs en temps réel |
   | `docker-compose down` | Arrêter le container |
   | `docker-compose up -d --build` | Mettre à jour et redémarrer |
   | `docker exec -it vps_monitoring sh` | Accéder au shell du container |

   **Accès au dashboard** : `http://votre-vps-ip:3000`

9. **Accéder au dashboard** :
   Ouvrez votre navigateur et allez sur :
   ```
   http://localhost:3000
   ```
   
   **⚠️ Authentification obligatoire** :
   - Vous serez automatiquement redirigé vers `/login` si vous n'êtes pas connecté.
   - Utilisez les identifiants définis dans votre fichier `.env` (par défaut : `admin`/`changer_mot_de_passe`).
   - Après connexion, vous accéderez au tableau de bord complet.
   - Le nom d'utilisateur est sauvegardé dans localStorage pour votre confort.

10. **Gestion de l'authentification** :
    
    Le projet inclut un système d'authentification complet basé sur des sessions :
    
    - **Fichier de configuration** : `.env` (copiez `.env.example` et modifiez les valeurs)
    - **Identifiants par défaut** :
      ```ini
      ADMIN_USER=admin
      ADMIN_PASSWORD=changer_mot_de_passe
      SESSION_SECRET=votre_cle_secrete_aleatoire_ici
      ```
    - **Générer une clé secrète sécurisée** :
      ```bash
      node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
      ```
    - **Routes d'authentification** :
      - `GET /login` : Page de connexion
      - `POST /login` : Traitement du formulaire (avec rate limiting)
      - `GET /logout` : Déconnexion (détruit la session)
      - `GET /api/user` : Récupère l'utilisateur connecté (pour le frontend)
    - **Middleware de protection** : `requireAuth` (redirige vers /login) et `requireApiAuth` (retourne 401 JSON)

11. **Mise à jour du projet** :
    
    Pour mettre à jour votre installation existante :
    ```bash
    cd vps_monitoring
    git pull origin main
    npm install --production
    pm2 restart vps_monitoring  # ou : npm start
    ```
    
    **⚠️ Important** : Après une mise à jour, vérifiez que votre fichier `.env` est toujours présent et contient vos identifiants personnalisés.

---

## 🔐 Permissions pour la surveillance des processus

> ⚠️ **Important** : La surveillance des processus et de Docker nécessite des permissions élevées.

### Option 1 : Exécuter avec sudo (recommandé pour les tests)
```bash
sudo node backend/app.js
```

### Option 2 : Configurer les capabilities (recommandé pour la production)
```bash
# Donner les permissions nécessaires à Node.js
sudo setcap cap_sys_ptrace,cap_dac_read_search+ep /usr/bin/node

# Puis démarrer normalement
node backend/app.js
```

### Option 3 : Utiliser PM2 avec sudo
Pour une gestion optimale en production, utilisez PM2 avec les permissions nécessaires :
```bash
sudo npm install -g pm2
sudo pm2 start backend/app.js --name vps_monitoring
sudo pm2 save
sudo pm2 startup
```
> **Note** : Pour plus de détails sur PM2, consultez la section **[Utiliser PM2 (Recommandé pour la production)](#7-utiliser-pm2-recommandé-pour-la-production)**.

### ⚠️ **Permissions Docker supplémentaires**

Si vous utilisez la **surveillance Docker**, assurez-vous que :

1. **Docker est installé et en cours d'exécution** :
   ```bash
   sudo systemctl status docker
   ```

2. **Votre utilisateur fait partie du groupe docker** :
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Le démon Docker est accessible** :
   - Testez avec : `docker ps` (sans sudo)
   - Si vous obtenez une erreur de permission, redémarrez votre session

4. **Pour la surveillance complète dans un container Docker** :
   - Utilisez les flags `--privileged --pid=host --net=host`
   - Montez `/var/run/docker.sock` pour accéder à Docker Engine

---

## 📡 API REST

Le backend expose plusieurs endpoints pour récupérer les données. **Toutes les routes API nécessitent une authentification** (via session) sauf `/api/config` (GET) et `/api/user` (GET).

### 📊 **Endpoints Système**

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|-----------------|
| GET | `/api/metrics` | Toutes les métriques (CPU, RAM, Disque, Réseau) | ✅ Requise |
| GET | `/api/network` | Métriques réseau détaillées (par interface) | ✅ Requise |
| GET | `/api/alerts` | Alertes actives (calculées en temps réel) | ✅ Requise |
| GET | `/api/processes` | Top 5 processus consommateurs | ✅ Requise |
| GET | `/api/ports` | Liste des ports ouverts en écoute | ✅ Requise |
| GET | `/api/health` | État de santé du serveur + version | ✅ Requise |
| GET | `/api/config` | Configuration actuelle (sans secrets) | ❌ Non requise |
| POST | `/api/config` | Mettre à jour la configuration | ✅ Requise |

### 📈 **Endpoints Historique**

| Méthode | Endpoint | Description | Paramètres |
|---------|----------|-------------|------------|
| GET | `/api/history` | Historique des métriques | `limit`, `from`, `to` |
| GET | `/api/history/:metric` | Données pour graphique (cpu, memory, disk) | `limit`, `period` (day/week/month/quarter) |
| GET | `/api/history/alerts` | Historique des alertes | `limit`, `unresolvedOnly` |
| GET | `/api/network-history` | Historique réseau avec agrégation | `period` (day/week/month/quarter) |
| POST | `/api/history/cleanup` | Nettoyer l'historique (par jours) | `days` |
| POST | `/api/history/clear-all` | **EFFACER TOUTES les données** (nécessite `confirm=DELETE_ALL_DATA`) | `confirm` |

### 🐳 **Endpoints Docker**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/docker-simple` | Statut basique Docker Engine (running/stopped/total) |
| GET | `/api/docker-detailed` | **Statut détaillé** : conteneurs + images + infos Docker Engine |
| GET | `/api/docker` | Statut de Docker Engine (version, OS, architecture, CPU, mémoire) |
| GET | `/api/docker/containers` | Liste de tous les conteneurs |
| GET | `/api/docker/containers/:id/stats` | Stats d'un conteneur spécifique |
| GET | `/api/docker/stats` | Stats de tous les conteneurs actifs |
| GET | `/api/docker/history` | Historique des stats Docker |
| GET | `/api/docker/containers/:id/chart` | Données graphique (CPU/RAM) pour un conteneur |
| GET | `/api/docker/alerts` | Liste des alertes Docker |
| GET | `/api/docker/alerts/check` | Vérifier et sauvegarder les alertes Docker |
| POST | `/api/docker/containers/:id/start` | Démarrer un conteneur |
| POST | `/api/docker/containers/:id/stop` | Arrêter un conteneur |
| POST | `/api/docker/containers/:id/restart` | Redémarrer un conteneur |
| POST | `/api/docker/cleanup` | Nettoyer l'historique Docker |

### 📧 **Endpoints Telegram**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/telegram/test` | Tester la configuration Telegram + envoi d'un message de test |
| GET | `/api/telegram/status` | Statut de la configuration Telegram |
| POST | `/api/telegram/send-test` | Envoyer une notification de test manuelle |

### 🔐 **Endpoints d'Authentification**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/login` | Page de connexion (formulaire HTML) |
| POST | `/login` | Traitement de la connexion (avec rate limiting) |
| GET | `/logout` | Déconnexion (détruit la session) |
| GET | `/api/user` | Vérifie si l'utilisateur est connecté |

---

## 📂 Structure du projet

```
vps_monitoring/
├── backend/
│   ├── app.js                      # Point d'entrée du backend (Express)
│   ├── config/
│   │   └── config.js               # Configuration centrale (seuils, intervalles, Docker, Telegram)
│   ├── middleware/
│   │   └── auth.js                 # Middleware d'authentification (sessions, bcrypt)
│   └── services/
│       ├── metrics.js              # Collecte des métriques système (CPU, RAM, Disque, Réseau)
│       ├── history.js              # Gestion de l'historique (SQLite + fallback JSON)
│       ├── docker-simple.js         # Endpoints Docker simplifiés (conteneurs + images)
│       ├── docker.js               # Surveillance Docker complète (dockerode)
│       ├── telegram.js             # Notifications Telegram pour les alertes
│       ├── db-sqlite.js            # Stockage SQLite (tables: metrics, alerts, users, docker_*)
│       └── db.js                   # Fallback de stockage JSON (déprécié)
├── frontend/
│   ├── index.html                  # Dashboard principal (métriques, graphiques, alertes)
│   ├── login.html                  # Page de connexion
│   ├── favicon.svg                 # Favicon personnalisé (loupe)
│   └── js/
│       ├── i18n.js                 # Gestion de l'internationalisation
│       └── translations/
│           ├── fr.json             # Traductions Français
│           └── en.json             # Traductions Anglais
├── data/                          # Données historiques (créé automatiquement)
│   └── vps_monitoring.db          # Base de données SQLite
├── docker-compose.yml             # Configuration Docker Compose pour déploiement
├── Dockerfile                     # Image Docker pour le déploiement conteneurisé
├── package.json
├── README.md
├── ROADMAP.md
└── .env.example
```

---

## 🛠 Stack Technique

| Composant | Technologie | Version | Description |
|-----------|-------------|---------|-------------|
| **Backend** | Node.js + Express | v18+ | Framework web pour l'API et le routing |
| **Frontend** | Vanilla JS + HTML5 + CSS3 | - | Interface statique avec i18n |
| **Métriques** | `systeminformation` | v5.22.0 | Collecte des métriques système |
| **Processus** | `ps aux` (commande) | - | Récupération fiable des % CPU/RAM |
| **Logging** | `morgan` | v1.10+ | Middleware de logging HTTP |
| **Authentification** | `express-session` + `bcryptjs` | - | Gestion des sessions et hashage |
| **Rate Limiting** | `express-rate-limit` | v7.1.5 | Protection contre les attaques par force brute |
| **Environnement** | `dotenv` | v16.3+ | Chargement des variables d'environnement |
| **Base de données** | SQLite (`better-sqlite3`) | v11+ | Stockage persistant des métriques |
| **Graphiques** | Chart.js | v4.4.0 | Visualisation interactive |
| **Docker** | `dockerode` | v4.0+ | Client Docker pour la surveillance |
| **Notifications** | `axios` | v1.6.2 | Requêtes HTTP pour Telegram API |
| **Build** | `nodemon` | v3.0.2 | Rechargement automatique en développement |

---

## 📊 Configuration des seuils d'alerte

Les seuils d'alerte (CPU, RAM, Disque) sont **configurables de deux manières** :

### Via le fichier .env
```ini
# Seuils en pourcentage (0-100)
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=90
```

### Via l'interface (recommandé)
1. Cliquez sur l'icône ⚙️ **Configuration** dans le menu
2. Accédez à la section **"Seuils d'alerte"**
3. Modifiez les valeurs (0-100%) et sauvegardez

Les modifications sont appliquées **immédiatement** sans redémarrage du serveur.

### Niveaux d'alerte
- **Warning (⚠️)** : CPU et RAM dépassent le seuil
- **Danger (🚨)** : Disque dépasse le seuil

### Notifications Telegram
Pour recevoir des notifications Telegram :
1. Activez Telegram dans la configuration
2. Configurez votre **Bot Token** (obtenu via @BotFather)
3. Configurez votre **Chat ID** (utilisez @getidsbot pour le trouver)
4. Réglez le **cooldown** (1-1440 minutes) pour éviter le spam
5. Activez/désactivez la notification de résolution
6. Testez la configuration avec le bouton "Tester Telegram"

---

## 📊 Exemple de sortie API

### `/api/metrics`
```json
{
  "success": true,
  "data": {
    "cpu": {
      "usage": 45.2,
      "cores": 4,
      "model": "Intel(R) Xeon(R) CPU E5-2686 v4 @ 2.30GHz",
      "speed": 2300
    },
    "memory": {
      "used": 1845493760,
      "total": 4123113472,
      "free": 2277619712,
      "usagePercent": 44.7
    },
    "disk": {
      "used": 12345678,
      "total": 100000000,
      "free": 87654322,
      "usagePercent": 12.3
    },
    "network": {
      "download": 1234,
      "upload": 567,
      "status": "OK",
      "interface": "eth0"
    },
    "timestamp": "2026-06-30T12:00:00.000Z"
  }
}
```

### `/api/processes`
```json
{
  "success": true,
  "data": [
    {
      "pid": 1234,
      "name": "node",
      "cpu": 45.2,
      "mem": 12.5,
      "user": "debian"
    },
    {
      "pid": 5678,
      "name": "nginx",
      "cpu": 12.1,
      "mem": 8.3,
      "user": "root"
    }
  ],
  "timestamp": "2026-06-30T12:00:00.000Z"
}
```

### `/api/ports`
```json
{
  "success": true,
  "data": [
    {
      "port": 22,
      "address": "0.0.0.0",
      "pid": 1234,
      "process": "sshd",
      "protocol": "TCP",
      "state": "LISTEN"
    },
    {
      "port": 80,
      "address": "0.0.0.0",
      "pid": 5678,
      "process": "nginx",
      "protocol": "TCP",
      "state": "LISTEN"
    },
    {
      "port": 3000,
      "address": "127.0.0.1",
      "pid": 9012,
      "process": "node",
      "protocol": "TCP",
      "state": "LISTEN"
    }
  ],
  "timestamp": "2026-06-30T12:00:00.000Z"
}
```

### `/api/docker-simple`
```json
{
  "success": true,
  "data": {
    "available": true,
    "running": 3,
    "stopped": 1,
    "total": 4,
    "error": null
  },
  "timestamp": "2026-06-30T12:00:00.000Z"
}
```

### `/api/docker-detailed`
```json
{
  "success": true,
  "data": {
    "available": true,
    "containers": {
      "running": 3,
      "stopped": 1,
      "paused": 0,
      "total": 4,
      "details": [
        {
          "id": "abc123def456",
          "name": "web-app",
          "image": "nginx:latest",
          "state": "running",
          "status": "Up 2 hours",
          "ports": "0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp",
          "created": "2026-06-30T10:00:00.000Z",
          "command": "nginx -g daemon off;"
        }
      ]
    },
    "images": {
      "total": 5,
      "totalSize": 1234567890,
      "dangling": 0,
      "untagged": 1,
      "details": [...]
    },
    "dockerInfo": {
      "serverVersion": "24.0.7",
      "os": "Linux",
      "architecture": "x86_64",
      "cpus": 4,
      "memory": 8589934592
    },
    "error": null
  },
  "timestamp": "2026-06-30T12:00:00.000Z"
}
```

---

## 🎯 Roadmap

Consultez la [ROADMAP.md](ROADMAP.md) pour voir les prochaines étapes et l'état d'avancement du projet.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment aider :

1. **Signaler un bug** : Ouvrez une [issue](https://github.com/SHARKYBLUSTER/vps_monitoring/issues) avec une description détaillée.
2. **Proposer une fonctionnalité** : Ouvrez une [issue](https://github.com/SHARKYBLUSTER/vps_monitoring/issues) avec le label `enhancement`.
3. **Contribuer au code** : Fork le dépôt, créez une branche, et soumettez une Pull Request.
4. **Traductions** : Aidez à traduire l'interface dans d'autres langues en ajoutant des fichiers dans `frontend/js/translations/`.

---

## 📜 Licence

Ce projet est sous licence **MIT**. Voir [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- [systeminformation](https://github.com/sebhildebrandt/systeminformation) pour la collecte des métriques système
- [Express.js](https://expressjs.com/) pour le framework backend
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) pour le stockage SQLite performant
- [Chart.js](https://www.chartjs.org/) pour les graphiques interactifs
- [dockerode](https://github.com/apoclyps/dockerode) pour la surveillance Docker
- [Font Awesome](https://fontawesome.com/) pour les icônes
- À tous les contributeurs et utilisateurs !

---

> *Dernière mise à jour : **30 juin 2026** (Version 0.5.0 - Audit de sécurité complet, nettoyage des intervalles, support multi-langues, configuration avancée, surveillance Docker complète).*
