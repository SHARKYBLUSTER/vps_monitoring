# VPS Monitoring Dashboard

> Un tableau de bord léger et open-source pour surveiller en temps réel l'état de vos serveurs VPS.

---

## 📌 À propos

**VPS Monitoring Dashboard** est une solution complète pour superviser les métriques clés de votre serveur (CPU, RAM, Disque, Réseau, Processus) directement depuis un navigateur web. Le projet utilise une **architecture API REST + SSR** avec rafraîchissement automatique des données et prend en charge le **multi-langues (Français/Anglais)**.

---

## ✅ Fonctionnalités

### 📊 **Surveillance en temps réel**
- **CPU** : Utilisation, nombre de cœurs, modèle
- **RAM** : Utilisation en %, mémoire utilisée/totale
- **Disque** : Espace utilisé, total, disponible
- **Réseau** : Téléchargement/Upload par interface
- **Processus** : Top 5 processus consommateurs de CPU/RAM

### 🎨 **Interface moderne**
- Barres de progression animées
- Design responsive (mobile-friendly)
- Tableaux triables (par CPU ou RAM pour les processus)
- Rafraîchissement dynamique sans rechargement de page
- **Mode sombre** : Thème alternatif avec persistance via localStorage, appliqué de manière cohérente sur toutes les pages (dashboard, configuration, login)
- **Boutons unifiés** : Style CSS cohérent pour tous les boutons (logout, configuration, etc.)
- **Icônes** : Ajout d'icônes pour les boutons du menu configuration

### ⚠️ **Alertes intelligentes**
- Seuils configurables pour CPU, RAM et Disque
- Notifications en temps réel
- Historique des alertes

### 📈 **Historique et analyse**
- Stockage des métriques historiques (SQLite)
- **Paramètre de rétention configurable** : Durée de stockage des données en mois (1-24 mois)
- Collecte automatique avec intervalle configurable
- Endpoints API pour récupérer les données historiques

### ⚙️ **Configuration avancée**
- **Menu de configuration** accessible depuis l'interface
- **Intervalle de collecte** : Ajustement de la fréquence de collecte des métriques (en ms)
- **Rétention des données** : Paramétrage de la durée de stockage (1-24 mois)
- **Effacement des données** : Bouton pour supprimer toutes les données historiques
- **Gestion du thème** : Basculer entre mode clair/sombre depuis le menu configuration, appliqué automatiquement sur toutes les pages y compris la page de login
- **Décalage horaire** : Paramétrage du décalage UTC (+/- heures) pour l'affichage des graphiques historiques
- **Visibilité Docker Engine** : Option pour afficher ou masquer la section Docker du dashboard
- **Multi-langues** : Sélecteur de langue (Français/Anglais) avec persistance via localStorage
- **Seuils d'alerte** : Configuration des seuils CPU/RAM/Disque directement depuis la modale de configuration

### 🔍 **Surveillance avancée**
- **Top 5 processus** : Identification des processus les plus gourmands
- Tri dynamique par CPU ou mémoire
- Visualisation avec barres de progression
- **Analyse améliorée** : Données cohérentes avec l'utilisation globale CPU/RAM

### 🔌 **Sécurité des ports**
- **Surveillance des ports ouverts** : Liste des ports TCP en écoute
- **Indicateur visuel** : 🟢 (local) ou 🟠 (externe)
- **Identification des services** : Base de données de 25+ ports connus (SSH, HTTP, MySQL, etc.)
- **Niveau de sécurité** : Notation en étoiles (⭐⭐⭐, ⭐⭐☆, ⭐☆☆)
- **Classification automatique** : Ports système, enregistrés, dynamiques

### 🐳 **Surveillance Docker**
- **Docker Engine** : Statut, version, uptime
- **Conteneurs** : Liste complète (actifs/inactifs) avec filtres
- **Stats par conteneur** : CPU %, RAM % (utilisée/limite), Réseau RX/TX, Disque
- **Graphiques** : Évolution CPU et RAM par conteneur
- **Alertes Docker** : Conteneurs arrêtés, CPU > 90%, RAM > 85%
- **Contrôles** : Démarrer/Arrêter/Redémarrer directement depuis l'interface
- **Historique** : Stockage SQLite avec nettoyage automatique après 91 jours

---

## 🚀 Installation

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn
- Un serveur VPS ou local pour tester
- **Docker Engine** (pour la surveillance Docker - optionnel)

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

3. **Installer Docker (optionnel - pour la surveillance Docker)** :
   
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

3. **Configurer l'environnement** (optionnel) :
   ```bash
   cp .env.example .env
   nano .env  # Modifier selon vos besoins
   ```

4. **Démarrer le serveur** :
   ```bash
   # Mode développement
   npm run dev
   
   # Mode production
   npm start
   ```

6. **Utiliser PM2 (Recommandé pour la production)** :
   
   **PM2** est un gestionnaire de processus Node.js très populaire pour gérer des applications en production.
   
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
   pm2 start backend/app.js --name "vps_monitoring" --watch
   pm2 save
   pm2 startup
   ```
   
   **Avantages** :
   - Gestion avancée des logs.
   - Redémarrage automatique en cas de crash.
   - Monitoring intégré (CPU, mémoire).
   - Persistance au redémarrage du serveur.

7. **Déploiement avec Docker** :

   VPS Monitoring peut être déployé dans un container Docker pour une isolation et une gestion simplifiée.
   
   **⚠️ Important** : Pour surveiller les métriques **globales du système hôte** (CPU, RAM, disque, processus, réseau), le container doit être lancé en **mode privilégié** avec accès aux namespaces système.

   ### Prérequis
   - Docker Engine installé sur votre VPS
   - Accès root ou sudo pour les commandes Docker

   ### Option A : Avec docker-compose (Recommandé)

   Le projet inclut un fichier `docker-compose.yml` configuré pour le monitoring global :
   
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
   
   **Ce que fait docker-compose :**
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
     vps_monitoring
   ```

   ### Commandes utiles Docker

   | Commande | Description |
   |----------|-------------|
   | `docker-compose logs -f` | Voir les logs en temps réel |
   | `docker-compose down` | Arrêter le container |
   | `docker-compose up -d --build` | Mettre à jour et redémarrer |
   | `docker exec -it vps_monitoring sh` | Accéder au shell du container |

   **Accès au dashboard :** `http://votre-vps-ip:3000`

8. **Accéder au dashboard** :
   Ouvrez votre navigateur et allez sur :
   ```
   http://localhost:3000
   ```
   
   **⚠️ Depuis la version 0.2.0, l'authentification est obligatoire** :
   - Vous serez automatiquement redirigé vers `/login`.
   - Utilisez les identifiants définis dans votre fichier `.env` (par défaut : `admin`/`changer_mot_de_passe`).
   - Après connexion, vous accéderez au tableau de bord complet.

9. **Gestion de l'authentification** :
   
   Le projet inclut désormais un système d'authentification complet basé sur des sessions :
   
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
     - `POST /login` : Traitement du formulaire
     - `GET /logout` : Déconnexion
     - `GET /api/user` : Récupère l'utilisateur connecté (pour le frontend)

9. **Mise à jour du projet** :
   
   Pour mettre à jour votre installation existante :
   ```bash
   cd vps_monitoring
   git pull origin main
   npm install --production
   pm2 restart vps_monitoring  # ou : npm start
   ```
   
   **⚠️ Important** : Après une mise à jour, vérifiez que votre fichier `.env` est toujours présent et contient vos identifiants personnalisés.

10. **Visualisation avec Graphiques** :
    
    Le projet inclut désormais des graphiques interactifs pour visualiser l'historique des métriques :
    
    - **3 graphiques principaux** : CPU, RAM, Disque (utilisation en %)
    - **1 graphique réseau** : Téléchargement/Envoi (en KB/s)
    - **Sélection de période** : Jour, Semaine, Mois (indépendante pour chaque graphique)
    - **Mise à jour automatique** : Toutes les minutes
    - **Technologie** : Chart.js (v4.4.0) via CDN
    
    **Exemple d'utilisation** :
    - Cliquez sur "Semaine" dans le graphique CPU pour voir l'historique sur 7 jours
    - Cliquez sur "Mois" dans le graphique RAM pour voir l'historique sur 30 jours
    - Chaque graphique a ses propres contrôles !

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
> **Note** : Pour plus de détails sur PM2, consultez la section **[Utiliser PM2 (Recommandé pour la production)](#6-utiliser-pm2-recommandé-pour-la-production)**.

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

4. **Pour la surveillance complète** (y compris les stats avancées) :
   ```bash
   # Donner les permissions étendues à Node.js pour Docker
   sudo setcap cap_sys_admin+ep /usr/bin/node
   ```
   
   **⚠️ Attention** : Les capabilities étendues peuvent poser des problèmes de sécurité. Utilisez cette option uniquement si nécessaire et en comprenant les risques.

---

## 📡 API REST

Le backend expose plusieurs endpoints pour récupérer les données :

### 📊 **Endpoints Système**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/metrics` | Toutes les métriques (CPU, RAM, Disque, Réseau) |
| GET | `/api/network` | Métriques réseau détaillées |
| GET | `/api/alerts` | Alertes actives |
| GET | `/api/processes` | Top 5 processus consommateurs |
| GET | `/api/ports` | Liste des ports ouverts en écoute |
| GET | `/api/health` | État de santé du serveur |
| GET | `/api/history` | Historique des métriques |
| GET | `/api/history/:metric` | Données pour graphique (cpu, memory, disk) |
| GET | `/api/history/alerts` | Historique des alertes |
| POST | `/api/history/cleanup` | Nettoyer l'historique |
| POST | `/api/history/clear-all` | **EFFACER TOUTES les données** |
| GET | `/api/config` | Configuration actuelle |
| POST | `/api/config` | Mettre à jour la configuration |

### 🐳 **Endpoints Docker**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/docker` | Statut de Docker Engine |
| GET | `/api/docker/containers` | Liste de tous les conteneurs |
| GET | `/api/docker/containers/:id/stats` | Stats d'un conteneur spécifique |
| GET | `/api/docker/stats` | Stats de tous les conteneurs actifs |
| GET | `/api/docker/history` | Historique des stats Docker |
| GET | `/api/docker/containers/:id/chart` | Données graphique (CPU/RAM) |
| GET | `/api/docker/alerts` | Liste des alertes Docker |
| GET | `/api/docker/alerts/check` | Vérifier et sauvegarder les alertes |
| POST | `/api/docker/containers/:id/start` | Démarrer un conteneur |
| POST | `/api/docker/containers/:id/stop` | Arrêter un conteneur |
| POST | `/api/docker/containers/:id/restart` | Redémarrer un conteneur |
| POST | `/api/docker/cleanup` | Nettoyer l'historique Docker |

---

## 📂 Structure du projet

```
vps_monitoring/
├── backend/
│   ├── app.js              # Point d'entrée du backend (Express)
│   ├── config/
│   │   └── config.js       # Configuration (seuils d'alerte, etc.)
│   └── services/
│       ├── metrics.js      # Collecte des métriques système
│       ├── history.js      # Gestion de l'historique
│       ├── docker.js       # Surveillance Docker (dockerode)
│       └── db-sqlite.js    # Stockage des données (SQLite)
├── frontend/
│   └── index.html          # Interface utilisateur complète
├── data/                  # Données historiques (créé automatiquement)
│   └── vps_monitoring.db  # Base de données SQLite
├── package.json
├── README.md
├── ROADMAP.md
└── .env.example
```

---

## 🛠 Stack Technique

| Composant       | Technologie          | Version |
|-----------------|----------------------|---------|
| **Backend**     | Node.js + Express    | v18+    |
| **Frontend**    | Vanilla JS + HTML5 + CSS3 | - |
| **Métriques**   | `systeminformation`  | v5.21+  |
| **Logging**     | `morgan`             | v1.10+  |
| **Authentification** | `express-session` + `bcryptjs` | - |
| **Environnement** | `dotenv`            | v16.3+  |
| **Base de données** | SQLite (`better-sqlite3`) | v11+ |
| **Graphiques**  | Chart.js             | v4.4.0  |
| **Docker**     | `dockerode`          | v4.0+   |

## 📊 Historique des Versions

| Version | Date | Modifications |
|---------|------|---------------|
| **0.4.0** | **30 juin 2026** | **Support multi-langues** : Implémentation complète du système i18n avec fichiers JSON pour Français et Anglais, traduction de toutes les sections (Open Ports, Alerts, Metrics, Configuration, etc.). |
| **0.4.0** | **30 juin 2026** | **UI nettoyée** : Suppression des emojis (🔧,🕐,🌙,⏰,💾,✕) de la modale de configuration et des labels "Heure"/"Jour" sous les graphiques. |
| **0.4.0** | **30 juin 2026** | **Décalage horaire** : Ajout du paramètre UTC Heure locale dans le menu configuration pour ajuster l'affichage des abscisses des graphiques historiques (CPU, RAM, Disque, Réseau). |
| **0.4.0** | **30 juin 2026** | **Visibilité Docker Engine** : Ajout d'un bouton dans le menu configuration pour afficher ou masquer la carte Docker Engine sur la page index.html, avec rechargement automatique. |
| **0.4.0** | **29 juin 2026** | **Menu de configuration complet** : Interface pour modifier l'intervalle de collecte, la rétention des données (1-24 mois), bouton d'effacement total, intégration du mode sombre, style unifié des boutons, icônes ajoutées. |
| **0.4.0** | **29 juin 2026** | **Effacement des données** : Bouton pour supprimer toutes les données historiques (SQLite + JSON), avec VACUUM pour réduire la taille du fichier, rechargement automatique de la page. |
| **0.4.0** | **30 juin 2026** | **Corrections de bugs** : Analyse cohérente des processus, affichage correct des ports, gestion des erreurs améliorée, résolution du problème de paramètres SQLite. |
| **0.4.0** | **30 juin 2026** | **Graphiques corrigés** : Affichage complet des 24h pour le filtre jour (au lieu de 41 minutes), agrégation par 30 minutes avec 48 points, format HH:MM pour les labels du réseau. |
| **0.4.0** | **30 juin 2026** | **Thème cohérent** : Suppression du bouton de basculement mode sombre de la page login, application automatique du thème depuis la configuration globale (persistance localStorage). |
| **0.4.0** | **30 juin 2026** | **Support Docker complet** : Ajout de Dockerfile et docker-compose.yml pour déploiement conteneurisé avec accès aux métriques système globales (mode host + privileged). |
| **0.4.0** | **30 juin 2026** | **Correction Docker Engine sous Docker** : Remplacement de child_process par dockerode pour la détection Docker dans les containers. |
| **0.4.0** | **30 juin 2026** | **Correction Top 5 Processes** : Utilisation de `ps aux` au lieu de systeminformation.processes() pour obtenir directement les pourcentages CPU/MEM, ajout de procps au Dockerfile. |
| 0.3.0 | 27 juin 2026 | **Mode sombre** : Ajout d'un thème sombre avec toggle, persistance localStorage, adaptation de toutes les couleurs (cartes, graphiques, tableaux, alertes). |
| 0.3.0 | 24 juin 2026 | **Graphiques interactifs** : Ajout de 4 graphiques (CPU, RAM, Disque, Réseau) avec Chart.js, filtres par période indépendants, mise à jour automatique. |
| 0.2.6 | 24 juin 2026 | **Surveillance Docker complète** : Intégration de dockerode pour surveiller les conteneurs Docker (stats CPU/RAM/Réseau/Disque, alertes, contrôles start/stop/restart, historique SQLite, graphiques par conteneur). |
| 0.2.5 | 24 juin 2026 | **Migration vers SQLite** : Remplacement du stockage JSON par une base SQLite avec tables metrics, alerts, users, index pour les performances. |
| 0.2.0 | 24 juin 2026 | **Authentification complète** : Protection des routes API et du dashboard, page de login, gestion des sessions, middleware `requireAuth`/`requireApiAuth`. |
| 0.1.3 | 19 juin 2026 | Phase 2 terminée : API REST, alertes, historique, surveillance réseau/ports/processus. |
| 0.1.2 | 19 juin 2025 | Initialisation du projet Node.js, structure de base. |
| 0.1.1 | 19 juin 2025 | Architecture définie (Backend + Frontend). |
| 0.1.0 | 19 juin 2025 | Création du dépôt et roadmap initiale. |

---

## 📊 Configuration des seuils d'alerte

Les seuils d'alerte (CPU, RAM, Disque) sont désormais **configurables directement depuis l'interface** :
1. Cliquez sur l'icône ⚙️ **Configuration** dans le menu
2. Accédez à la section **"Seuils d'alerte"**
3. Modifiez les valeurs (0-100%) et sauvegardez

Les modifications sont appliquées **immédiatement** sans redémarrage du serveur.

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
    "timestamp": "2025-06-19T12:00:00.000Z"
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
  "timestamp": "2025-06-19T12:00:00.000Z"
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
  "timestamp": "2025-06-19T12:00:00.000Z"
}
```

---

## 🎯 Roadmap

Consultez la [ROADMAP.md](ROADMAP.md) pour voir les prochaines étapes et l'état d'avancement du projet.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment aider :

1. **Signaler un bug** : Ouvrez une [issue](https://github.com/SHARKYBLUSTER/vps_monitoring/issues).
2. **Proposer une fonctionnalité** : Ouvrez une [issue](https://github.com/SHARKYBLUSTER/vps_monitoring/issues) avec le label `enhancement`.
3. **Contribuer au code** : Fork le dépôt, créez une branche, et soumettez une Pull Request.

---

## 📜 Licence

Ce projet est sous licence **MIT**. Voir [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- [systeminformation](https://github.com/sebhildebrandt/systeminformation) pour la collecte des métriques système
- [Express.js](https://expressjs.com/) pour le framework backend
- À tous les contributeurs et utilisateurs !

---

> *Dernière mise à jour : **30 juin 2026** (Version 0.4.0 - Support multi-langues, corrections de traduction, améliorations UI, suppression emojis, labels graphiques nettoyés, **support Docker complet**, **correction Docker Engine sous Docker**, **correction Top 5 Processes**, **configuration des seuils d'alerte via la modale**, **notifications Telegram**).*
