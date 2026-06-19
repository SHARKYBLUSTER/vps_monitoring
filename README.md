# VPS Monitoring Dashboard

> Un tableau de bord léger et open-source pour surveiller en temps réel l'état de vos serveurs VPS.

---

## 📌 À propos

**VPS Monitoring Dashboard** est une solution simple et efficace pour superviser les métriques clés de votre serveur (CPU, RAM, Disque, Réseau) directement depuis un navigateur web. Le projet utilise une **architecture SSR (Server-Side Rendering)** avec génération HTML côté serveur et rafraîchissement automatique.

---

## ✅ Fonctionnalités (Phase 1)

- 📊 **Surveillance en temps réel** : CPU, RAM, Disque, Réseau.
- 🎨 **Interface moderne** : Barres de progression, animations, design responsive.
- ⚠️ **Alertes dynamiques** : Seuils configurables pour CPU, RAM et Disque.
- 🔄 **Rafraîchissement automatique** : Mise à jour toutes les 5 secondes.
- 📝 **Logging** : Suivi des requêtes HTTP via `morgan`.

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

3. **Configurer les seuils d'alerte** (optionnel) :
   Modifiez les valeurs dans `backend/config/config.js` :
   ```javascript
   alerts: {
     cpuThreshold: 80,    // Alerte si CPU > 80%
     memoryThreshold: 85, // Alerte si RAM > 85%
     diskThreshold: 90,   // Alerte si disque > 90%
   }
   ```

4. **Démarrer le serveur** :
   ```bash
   npm start
   ```

5. **Accéder au dashboard** :
   Ouvrez votre navigateur et allez sur :
   ```
   http://localhost:3000
   ```

---

## 📂 Structure du projet

```
vps_monitoring/
├── backend/
│   ├── app.js              # Point d'entrée du backend (Express)
│   └── config/
│       └── config.js       # Configuration (seuils d'alerte, etc.)
├── frontend/
│   ├── css/
│   │   └── style.css       # Styles globaux
│   ├── js/
│   │   ├── app.js          # Logique principale du frontend
│   │   └── components/
│   │       ├── alerts.js   # Gestion des alertes
│   │       └── metrics.js  # Utilitaires pour les métriques
│   └── index.html          # Structure HTML (générée dynamiquement par le backend)
├── package.json
├── README.md
└── ROADMAP.md
```

---

## 🛠 Stack Technique

| Composant       | Technologie          |
|-----------------|----------------------|
| **Backend**     | Node.js + Express    |
| **Frontend**    | Vanilla JS + HTML5 + CSS3 |
| **Métriques**   | `systeminformation`  |
| **Logging**     | `morgan`             |

---

## 📊 Captures d'écran

*(À venir)*

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
