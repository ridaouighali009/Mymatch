MyMatch — Fichier de contexte projet
C’est quoi MyMatch ?
MyMatch est une plateforme web marocaine de captation vidéo automatique pour terrains
de football amateur 5v5. Les joueurs réservent un terrain filmé (60 MAD au lieu de 50 MAD),
jouent leur match, puis scannent un QR Code affiché sur le terrain pour accéder à leur vidéo
en moins de 10 secondes. Aucune app à télécharger, aucune inscription préalable.
Lancement : Casablanca, mai 2026. Fondateurs : 2 personnes.
Les 3 clubs partenaires
City Foot 5
Localisation : Casablanca centre
Total terrains 5v5 : 13
Terrains filmés MyMatch : 6
Tarif standard : 50 MAD/joueur → 60 MAD avec option filmé
Site : oasissportscity.ma
Arena Bouskoura (Ville Verte)
Localisation : Bouskoura
Total terrains 5v5 : 9
Terrains filmés MyMatch : 4
Tarif standard : 50 MAD/joueur → 60 MAD avec option filmé
Site : avv.ma
Green Sports Park
Localisation : Bouskoura
Total terrains 5v5 : 6
Terrains filmés MyMatch : 3
Tarif standard : 50 MAD/joueur → 60 MAD avec option filmé
Site : greensportspark.ma
Total : 28 terrains 5v5 disponibles, 13 terrains filmés MyMatch
Modèle économique
Supplément : +10 MAD/joueur sur les terrains filmés
10 joueurs par match → 100 MAD de revenus supplémentaires par match
Commission MyMatch : 60% (60 MAD par match)
Commission club : 40% (40 MAD par match)
Exception : terrain pilote uniquement à 50/50
Conservation vidéos : 14 jours puis suppression automatique
Revenu mensuel à plein régime (13 terrains, 75% adoption) : ~115 375 MAD
Architecture technique
Matériel par terrain
1 caméra IP 4K grand angle (positionnée à 6-8m de hauteur)
1 Raspberry Pi 5 (4GB) dans un boîtier ventilé obligatoire
1 SSD externe 1 To (Kingston XS1000)
Câble RJ45 + boîtier IP65 étanche
Connexion au réseau existant du club (pas de routeur additionnel)
Fonctionnement du système embarqué
Détection de mouvement (pas de créneaux programmés)
Enregistrement démarre automatiquement dès qu’un joueur entre sur le terrain
Arrêt après 10 minutes d’inactivité
Purge automatique nocturne du SSD (upload vers VPS puis suppression locale)
Redémarrage préventif quotidien à 3h du matin
Alertes SMS automatiques en cas de panne
Plage active : 8h → 1h du matin
Infrastructure cloud
VPS Hetzner CX22 (~50 MAD/mois)
Stockage vidéos : 14 jours maximum
Nom de domaine : mymatch.ma (à acheter)
Accès joueur
QR Code unique et permanent par terrain (affiché en dur sur le terrain)
Joueur scanne → arrive sur la plateforme → sélectionne date et heure → vidéo
accessible
Aucune inscription requise pour voir la vidéo
Partage possible directement depuis la plateforme
Pages à développer
Page 1 — Accueil / Sélection vidéo (priorité absolue)
Inspirée de : https://www.urbansoccer.fr/videos/ Interface de sélection en 4 étapes :
1. Choisir le club (City Foot 5 / Arena Bouskoura / Green Sports Park)
2. Choisir le terrain (liste des terrains filmés du club sélectionné)
3. Choisir la date
4. Choisir l’heure → Affichage du lecteur vidéo
Page 2 — Lecteur vidéo
Lecteur plein écran
Bouton télécharger
Bouton partager (WhatsApp, Instagram)
Mention “Disponible X jours”
Logo MyMatch en watermark discret sur la vidéo
Page 3 — Page QR Code (landing page après scan)
URL type : mymatch.ma/terrain/city-foot-5/terrain-3
Pré-remplit automatiquement le club et le terrain
Le joueur choisit juste la date et l’heure
Design épuré, rapide à charger sur mobile
Page 4 — Interface Admin (pour les fondateurs)
Tableau de bord état des terrains (online / offline)
Revenus par club et par terrain
Nombre de vidéos générées
Alertes pannes en temps réel
Liste des vidéos stockées avec dates
Pages futures (ne pas développer maintenant)
Section “Mes Buts” (highlights automatiques)
Statistiques joueurs
But du mois Instagram
Gestion réservations clubs
Extension Padel
Design et identité visuelle
Références
Interface principale inspirée de : urbansoccer.fr/videos/
Ambiance : moderne, dynamique, sport, premium
Couleurs MyMatch
Bleu principal : #1A5276 (bleu marine)
Bleu secondaire : #2563EB (bleu vif)
Vert accent : #059669 (vert émeraude)
Fond clair : #FAFBFC
Texte principal : #0F1729
Texte secondaire : #5A6478
Typographie
Police principale : Inter (Google Fonts)
Titres : bold, lettres resserrées
Corps : regular, lisible
Ton et style
Professionnel mais dynamique
Pas de fioritures inutiles
Mobile-first (les joueurs scannent le QR depuis leur téléphone)
Temps de chargement minimal (vidéos lourdes, le reste doit être léger)
Règles de développement
Stack technique retenue
Frontend : HTML5 + CSS3 + JavaScript vanilla (pas de framework pour l’instant)
Backend : Python (Flask ou FastAPI)
Base de données : SQLite pour commencer, PostgreSQL ensuite
Hébergement : VPS Hetzner
Scripts RPi : Python
Règles importantes
Pas de framework JavaScript complexe (pas de React, Vue, Angular pour l’instant)
Mobile-first obligatoire (90% des utilisateurs sont sur téléphone)
Pas de dépendances inutiles — garder le projet simple
Chaque fichier doit être commenté en français
Tester sur mobile à chaque nouvelle page
Les vidéos sont hébergées sur le VPS, pas sur YouTube ou autre service tiers
Pas de cookies tracking ou publicité (modèle MyMatch = sans pub)
Structure des dossiers
mymatch/
├── frontend/
│ ├── index.html (page sélection vidéo)
│ ├── player.html (lecteur vidéo)
│ ├── scan.html (landing QR Code)
│ ├── admin.html (interface admin)
│ ├── css/
│ │ └── style.css
│ └── js/
│ └── main.js
├── backend/
│ ├── app.py (serveur principal)
│ ├── routes/
│ ├── models/
│ └── utils/
├── raspberry-pi/
│ ├── detect.py (détection de mouvement)
│ ├── record.py (enregistrement)
│ ├── upload.py (upload vers VPS)
│ └── alerts.py (alertes SMS)
├── CLAUDE.md (ce fichier)
└── README.md
Données de test (pour développement)
Utilise ces données fictives pour les démos et tests :
{
"clubs": [
{
"id": "city-foot-5",
"nom": "City Foot 5",
"ville": "Casablanca",
"terrains_filmes": [
{"id": 1, "nom": "Terrain 1", "qr_code": "CF5-T1"},
{"id": 2, "nom": "Terrain 2", "qr_code": "CF5-T2"},
{"id": 3, "nom": "Terrain 3", "qr_code": "CF5-T3"},
{"id": 4, "nom": "Terrain 4", "qr_code": "CF5-T4"},
{"id": 5, "nom": "Terrain 5", "qr_code": "CF5-T5"},
{"id": 6, "nom": "Terrain 6", "qr_code": "CF5-T6"}
]
},
{
"id": "arena-bouskoura",
"nom": "Arena Bouskoura",
"ville": "Bouskoura",
"terrains_filmes": [
{"id": 1, "nom": "Terrain A", "qr_code": "AB-TA"},
{"id": 2, "nom": "Terrain B", "qr_code": "AB-TB"},
{"id": 3, "nom": "Terrain C", "qr_code": "AB-TC"},
{"id": 4, "nom": "Terrain D", "qr_code": "AB-TD"}
]
},
{
"id": "green-sports-park",
"nom": "Green Sports Park",
"ville": "Bouskoura",
"terrains_filmes": [
{"id": 1, "nom": "Terrain Alpha", "qr_code": "GSP-1"},
{"id": 2, "nom": "Terrain Beta", "qr_code": "GSP-2"},
{"id": 3, "nom": "Terrain Gamma", "qr_code": "GSP-3"}
]
}
],
"horaires": ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
"15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
"21:00", "22:00", "23:00"]
}
Ce qu’il ne faut PAS faire
Ne pas créer d’app mobile native (site web responsive suffit)
Ne pas utiliser YouTube ou Vimeo pour héberger les vidéos
Ne pas demander de créer un compte pour voir une vidéo
Ne pas intégrer de publicités
Ne pas connecter au système de réservation des clubs (ils réservent par téléphone)
Ne pas créer de système de paiement en ligne pour l’instant
Priorités de développement (dans l’ordre)
1. Page d’accueil / sélection vidéo (interface joueur principale)
2. Page QR Code (landing page après scan terrain)
3. Lecteur vidéo
4. Scripts Raspberry Pi (détection, enregistrement, upload)
5. Backend API (servir les vidéos, gérer les données)
6. Interface admin (tableau de bord fondateurs)
Fichier créé le 9 mai 2026 — MyMatch, Casablanca Pour toute question sur le projet, se
référer au business plan complet.
