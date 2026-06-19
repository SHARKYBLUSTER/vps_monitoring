# VPS Monitoring Dashboard

> Un tableau de bord léger et open-source pour surveiller en temps réel l'état de vos serveurs VPS.

---

## 📌 À propos

**VPS Monitoring Dashboard** est une solution complète pour superviser les métriques clés de votre serveur (CPU, RAM, Disque, Réseau, Processus) directement depuis un navigateur web. Le projet utilise une **architecture API REST + SSR** avec rafraîchissement automatique des données.

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

### ⚠️ **Alertes intelligentes**
- Seuils configurables pour CPU, RAM et Disque
- Notifications en temps réel
- Historique des alertes

### 📈 **Historique et analyse**
- Stockage des métriques historiques (JSON)
- Collecte automatique toutes les 5 minutes
- Endpoints API pour récupérer les données historiques

### 🔍 **Surveillance avancée**
- **Top 5 processus** : Identification des processus les plus gourmands
- Tri dynamique par CPU ou mémoire
- Visualisation avec barres de progression

### 🔌 **Sécurité des ports**
- **Surveillance des ports ouverts** : Liste des ports TCP en écoute
- **Indicateur visuel** : 🟢 (local) ou 🟠 (externe)
- **Identification des services** : Base de données de 25+ ports connus (SSH, HTTP, MySQL, etc.)
- **Niveau de sécurité** : Notation en étoiles (⭐⭐⭐, ⭐⭐☆, ⭐☆☆)
- **Classification automatique** : Ports système, enregistrés, dynamiques

---

## 🚀 Installation

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn
- Un serveur VPS ou local pour tester

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

3. **Configurer l'environnement** (optionnel) :
   ```bash
   cp .env.example .env
   nano .env  # Modifier selon vos besoins
   ```

4. **Configurer les seuils d'alerte** (optionnel) :
   Modifiez les valeurs dans `backend/config/config.js` :
   ```javascript
   alerts: {
     cpuThreshold: 80,     // Alerte si CPU > 80%
     memoryThreshold: 85,  // Alerte si RAM > 85%
     diskThreshold: 90,    // Alerte si disque > 90%
   }
   ```

5. **Démarrer le serveur** :
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

7. **Accéder au dashboard** :
   Ouvrez votre navigateur et allez sur :
   ```
   http://localhost:3000
   ```

---

## 🔐 Permissions pour la surveillance des processus

> ⚠️ **Important** : La surveillance des processus nécessite des permissions élevées.

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

---

## 📡 API REST

Le backend expose plusieurs endpoints pour récupérer les données :

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
│       └── db.js           # Stockage des données (JSON)
├── frontend/
│   └── index.html          # Interface utilisateur complète
├── data/                  # Données historiques (créé automatiquement)
│   ├── metrics_history.json
│   └── alerts_history.json
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
