# Trip Sheet Monitor (Rig TP-228)

Système digital de contrôle et de surveillance des volumes de manœuvre (Trip Tank Monitoring & Well Control) pour appareils de forage pétrolier, conforme aux pratiques de chantier de la Sonatrach et de l'appareil Rig TP-228 (Puits TRNW12Z).

---

## 📌 Présentation Générale

Lors des manœuvres de remontée (POOH) ou de descente (RIH) de la garniture de forage, le contrôle précis des volumes de boue entrant et sortant du **Trip Tank** est une barrière critique de **Well Control**.
Une anomalie de volume permet de détecter immédiatement :
- **Un Influx / Venir / Kick** (le puits rend plus de boue que le volume théorique de l'acier).
- **Une Perte de boue / Circulation loss** (le puits absorbe du fluide, risquant de baisser la pression hydrostatique).

Cette application numérise la feuille de chantier officielle **"Contrôle des volumes en manœuvres"**, automatise tous les calculs d'acier et de capacité, gère les vidanges/remplissages de bac, et génère des alarmes visuelles et des graphiques en temps réel.

---

## 🚀 Fonctionnalités Clés

### 1. Prise en charge intégrale des 4 modes de manœuvre
1. **POOH Dry (Tirage à sec)** : La garniture remonte vide. Le volume de boue nécessaire pour remplir le puits correspond exactement au volume d'acier retiré ($V_{\text{acier}}$).
2. **POOH Wet (Tirage plein / bouché)** : La garniture remonte pleine de boue. Le volume nécessaire correspond au volume extérieur total ($V_{\text{ext}} = V_{\text{acier}} + V_{\text{int}}$).
3. **RIH Dry (Descente libre / tube ouvert)** : La boue pénètre dans la garniture. Le volume déplacé vers le Trip Tank correspond au volume d'acier ($V_{\text{acier}}$).
4. **RIH Wet (Descente bouchée / clapet float valve)** : La boue ne rentre pas dans le tube. Le volume refoulé au Trip Tank correspond au volume extérieur ($V_{\text{ext}}$).

### 2. Base de données complète des tubulaires (sans pompes)
Données issues des relevés réels de l'appareil TP-228 (*Volumes dans le puits* et *Drilling Data*) :
- **Drill Pipe (DP)** : 5" S-135 / G-105 19.50#, 3½" S-135 / G-105 13.30# (référence chantier : 0.40 m³ / 5 stands Dry et 0.94 m³ / 5 stands Wet), 2⅞" DP.
- **Heavy Weight (HWDP)** : 5" NC50 (49.3#) et 3½" NC38 (25.3#).
- **Drill Collars (DC)** : 8" (ID 2 13/16"), 6½", 4¾" (ID 2¼"), 3⅛".
- **Tubing** : 3½" 9.30# EUE, 2⅞" 6.50# EUE.
- **Tubage & Liners** : 13⅜", 9⅝", 7", 5" Liner.
- Possibilité d'ajouter des composants personnalisés en cours de manœuvre.

### 3. Gestion intelligente des événements de Trip Tank
- **Vidange TT & Remplissage TT** : Réinitialise automatiquement le niveau de référence sans corrompre le cumul théorique ni générer de faux écarts.
- **Contrôle de Débit (Flow Check)** : Chronomètre intégré (10 min / 15 min) avec consignation automatique du résultat (*Négatif / Positif / Doute*) dans la feuille.

### 4. Graphiques & Barrières Well Control
- Courbe comparative en direct : **Volume Théorique vs Volume Réel lu au Trip Tank**.
- Tendance d'écart cumulé avec lignes de seuils d'avertissement ($\pm 0.20 \text{ m³}$) et seuils critiques de Kick ($\pm 0.40 \text{ m³}$).
- Jauge visuelle animée du Trip Tank avec alerte de niveau bas (<20%) et niveau haut (>85%).

### 5. Impression officielle & Exportation
- **Format d'impression officiel** répliquant fidèlement la feuille papier de chantier (visas et signatures Chef de poste, Superviseur Forage, Superviseur Client).
- **Export CSV / Excel** en un clic.

---

## 🛠️ Stack Technique

- **Framework** : React 18 / 19 + TypeScript + Vite
- **Styles** : Tailwind CSS v4 (design industriel moderne pour écrans de cabine de forage)
- **Visualisations** : Recharts + Lucide Icons

---

## 💻 Installation & Démarrage Local

```bash
git clone https://github.com/Yazid104/trip-sheet-monitor.git
cd trip-sheet-monitor
npm install
npm run dev
```

Pour créer le build de production :
```bash
npm run build
```

---

*Développé pour les équipes de forage & Well Control — Appareil Rig TP-228.*
