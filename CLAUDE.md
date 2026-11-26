# MyMatch — Fichier de contexte projet (mis à jour 26 novembre 2026)

## C'est quoi MyMatch ?

MyMatch est une plateforme marocaine de captation vidéo automatique pour terrains de football amateur 5v5 à Casablanca. Les joueurs scannent un QR Code affiché sur le terrain après leur match, sélectionnent club/terrain/date/heure sur le site, et accèdent à leur vidéo en quelques secondes. Aucune app, aucun compte.

Fondateurs : 2 personnes. L'un gère la technique (basé en France à partir de décembre 2026 pour sa dernière année d'études, retour prévu à Casablanca en mai 2027 pour 4 mois). L'autre (Mohamed) est basé au Maroc en permanence mais a peu de disponibilité (emploi du temps professionnel chargé).

⚠️ **STATUT ACTUEL** : projet en pause depuis ~2 mois (sept-nov 2026), reprise le 26 novembre 2026. Lancement repoussé à mai 2027.

## Pourquoi le lancement est repoussé

Le fondateur technique part en France début décembre 2026 pour sa dernière année d'études et ne revient à Casablanca que fin mai 2027, pour une fenêtre de 4 mois seulement. Décision prise : ne jamais pitcher un club avant que le système ait été testé et validé de bout en bout avec du vrai matériel (caméra réelle, vrai enregistrement, vraie vidéo visible sur le site). Au Maroc, un accord de principe ne vaut rien et présenter l'idée sans produit fonctionnel expose au risque qu'un gérant ou un tiers copie le concept avant signature.

Stratégie retenue : le fondateur technique ramène le kit matériel (RPi, caméra, injecteur PoE) en France et teste tout depuis son appartement (espace réduit mais suffisant — seule la chaîne logicielle compte, pas les dimensions d'un vrai terrain). Rythme de travail réaliste : environ 1h/jour. Objectif : arriver à Casablanca en mai 2027 avec un système déjà validé plusieurs jours d'affilée, prêt à installer et pitcher dans la foulée.

## Modèle économique

- Tarif standard : 50 MAD/joueur. Tarif terrain filmé : 60 MAD/joueur (+10 MAD).
- 10 joueurs/match → 100 MAD de revenu additionnel par match filmé.
- Commission MyMatch : 60%. Commission club : 40%.
- Exception : commission 50/50 sur le tout premier terrain pilote uniquement, le temps de valider.
- Conservation des vidéos : 14 jours, puis suppression automatique.
- Téléchargement de la vidéo : gratuit (décision assumée — meilleur levier marketing/partage, ne pas le faire payer).

## Les 3 clubs cibles (Casablanca)

| Club | Total terrains 5v5 | Terrains filmés visés |
|---|---|---|
| City Foot 5 | 13 | 6 |
| Arena Bouskoura | 9 | 4 |
| Green Sports Park | 6 | 3 |

Contact direct déjà établi avec le propriétaire de City Foot 5 (c'est lui le décisionnaire). Ne rien lui présenter tant que le système n'est pas validé.

## Architecture technique retenue

### Détection — décision finale

Détection de mouvement uniquement, pas de bouton physique. (Un bouton GPIO avait été envisagé puis explicitement abandonné.)

- Seuil de déclenchement : 15% de l'image doit bouger pour démarrer l'enregistrement (filtre les nettoyeurs/agents seuls, qui ne représentent qu'une petite portion de l'image).
- Délai avant arrêt : 15 minutes sans mouvement → l'enregistrement s'arrête (couvre les mi-temps, qui peuvent durer 5-10 min).
- Durée maximale par fichier : 75 minutes (couvre un match + marge ; si un 2e match démarre avant la fin des 75 min avec chevauchement, le système ferme le fichier à 75 min et en ouvre un nouveau proprement).
- Important pour les tests en appartement : avec un espace de quelques m² au lieu d'un terrain entier, le seuil de 15% sera probablement à recalibrer (une seule personne dans une petite pièce occupe proportionnellement plus d'image que 10 joueurs sur un terrain).

### Matériel (liste et décisions prises)

| Élément | Décision | Statut |
|---|---|---|
| Raspberry Pi | RPi 4, 4GB RAM (pas le RPi 5 — suffisant, moins cher) | Acheté, à Casablanca |
| Carte microSD | 32GB — la carte Lexar achetée a grillé pendant le flash (10%), jamais remplacée | À racheter (SanDisk ou Samsung, éviter Lexar) |
| SSD externe | 256GB suffit (upload immédiat après match = pas de stockage long terme sur site) | Jamais acheté — à acheter en France |
| Caméra IP | Hikvision 4MP, bullet fixe (pas PTZ), extérieure IP67, PoE (pas d'alim 12V séparée) | Acheté, à Casablanca |
| Injecteur PoE | Nécessaire car caméra PoE — oublié initialement dans la liste de courses, racheté après coup | Acheté, à Casablanca |
| Point d'accès WiFi dédié | TP-Link EAP225-Outdoor envisagé pour l'installation définitive sur terrain (pas nécessaire pour les tests en appartement) | Pas encore acheté, pas urgent |
| Câble RJ45 | 20m acheté pour la distance terrain réelle (largement surdimensionné pour un test en appartement) | Acheté |

Résolution caméra : 4MP suffit largement (vu sur téléphone, le 4K/8MP n'apporte rien et alourdit inutilement les fichiers/upload). ColorVu (vision nocturne couleur) jugé inutile : les terrains sont éclairés par projecteurs le soir.

### Upload vidéo — décision finale

Upload immédiat après chaque match (pas d'upload nocturne différé), rendu possible par la fibre du club. Délai estimé : 5-10 min après la fin du match pour qu'elle soit disponible aux joueurs. Le SSD local ne stocke donc qu'1-2 vidéos à la fois (le temps de l'upload), d'où le choix de 256GB au lieu de 1To.

Système de retry : si le serveur est injoignable, la vidéo reste sur le SSD et une liste d'attente (`mymatch_upload_attente.txt`) est réessayée au prochain cycle.

### Stockage serveur — non résolu, à trancher après le pilote

Le volume Hetzner (0.0504€/Go/mois) est jugé trop cher (~25€/mois pour 500Go). Alternative retenue en réflexion : Cloudflare R2 (gratuit jusqu'à 10Go, puis ~0.015$/Go/mois, soit ~5x moins cher). Décision reportée après la signature du premier club, pour calibrer sur les vrais volumes négociés.

### Désactivation à distance d'un terrain — fonctionnalité demandée, pas codée

Le fondateur veut pouvoir désactiver/réactiver un terrain à distance depuis son téléphone/PC (ex : le club organise un tournoi privé sur un terrain filmé ce soir-là). Routes API prévues mais non implémentées :

- `POST /api/terrain/desactiver {"club":..., "terrain":...}`
- `POST /api/terrain/activer {"club":..., "terrain":...}`
- `GET /api/terrain/statut`

Le script `detect_and_record.py` devrait vérifier ce statut toutes les 5 min. Non fait — à faire.

## Infrastructure serveur (opérationnelle)

- VPS : Hetzner CX22/CX23, Ubuntu (26.04 après mises à jour automatiques de Hetzner), IP 91.99.78.242.
- Accès SSH : clé uniquement (pas de mot de passe). Clés autorisées actuellement : un Mac principal (sans label dans authorized_keys), et un PC Windows (mymatch-hp, connexion via `ssh mymatch` grâce à un alias dans `~/.ssh/config` sur ce PC — nécessite `-o KexAlgorithms=curve25519-sha256` car OpenSSH client 9.5 sur Windows ne supporte pas nativement le KEX par défaut d'un serveur OpenSSH 10.2). Un 2e Mac (mymatch-mac2) a été retiré le 26/11/2026. Sauvegarde du fichier dans `~/.ssh/authorized_keys.backup`.
- Base de données : PostgreSQL, DB `mymatch`, user `mymatch_user` / password `MyMatch2026!`.
  - Table `clubs` (city-foot-5, arena-bouskoura, green-sports-park déjà insérés)
  - Table `terrains`
  - Table `videos` (club_id, terrain_numero, date_match, heure_debut, heure_fin, fichier, taille_octets, date_upload, date_expiration, statut)
  - 0 vidéo en base au 26/11/2026 (vidéos de test uploadées en août puis supprimées manuellement).
- Backend : Flask + Gunicorn (3 workers) + service systemd `mymatch` (Restart=always). Routes existantes : `/api/nouvelle-video`, `/api/creneaux`, `/api/video`, `/api/statut`, `/api/upload`, `/api/purge`.
- Reverse proxy : Nginx, `client_max_body_size 5000M` (configuré après une erreur 413 lors des tests d'upload).
- Domaine : mymatch.ma acheté via Genious Communication (registrar marocain agréé ANRT), DNS configuré, HTTPS actif via Certbot/Let's Encrypt.
- Firewall : UFW actif, ports 22/80/443 seulement.
- Purge automatique : cron à 3h du matin, script `/var/www/mymatch/purge.py`, supprime les vidéos dont `date_expiration < NOW()`.
- Déploiement du site : le dossier `/var/www/mymatch/static` est un clone git du repo GitHub. Mise à jour = `cd /var/www/mymatch/static && git pull`. Ce n'est pas automatique, il faut le faire manuellement à chaque fois que des changements sont poussés sur GitHub.

Check de santé effectué le 26/11/2026 : les 3 services (mymatch, nginx, postgresql) sont actifs, l'API répond correctement, le serveur a tenu 2 mois sans supervision ni incident. Usage disque : 17.6% (30Go libres sur 40Go — attention, dès qu'un vrai terrain enverra des matchs régulièrement, ce sera insuffisant, cf. section stockage ci-dessus).

## État du repository GitHub (ridaouighali009/Mymatch)

Important : il n'y a pas de branche `main` utilisée comme branche principale stable. Le travail s'est fait sur plusieurs branches `claude/...` créées automatiquement par des sessions Claude Code successives. Le serveur est actuellement figé sur le commit `3306a34` (branche `claude/install-ui-ux-skill-yTgfh`), choisi après un `git reset --hard` suite à des modifications non désirées d'une session Claude Code.

Branches connues à la pause :

- `claude/install-ui-ux-skill-yTgfh` (HEAD du serveur actuellement, commit 3306a34)
- `claude/charming-planck-fvyavw` (contient des évolutions postérieures — sélection multi-clubs, créneaux locaux, et un merge plus tardif incluant un skill ui-ux-pro-max volumineux — jamais mergées proprement vers le serveur, à évaluer avant de reprendre dessus)
- `claude/add-match-redirect-5Lfzo`
- `claude/review-claude-md-es2dh`

Une nouvelle version de `Player.html` (lecteur vidéo avec sidebar créneaux, specs auto, bloc expiration animé, bloc Instagram "but du mois") a été écrite en dehors de Claude Code et donnée au fondateur en téléchargement mais il n'est pas confirmé qu'elle ait été déployée sur GitHub ni sur le serveur. À vérifier en priorité.

### 🚫 Bloquants avant de basculer le serveur sur `main` (relevés le 26/11/2026)

- `index.html` sur `main` (sélection multi-clubs) affiche des créneaux **fixes** (`HORAIRES` 09:00→23:00) et n'appelle plus `/api/creneaux` — régression par rapport à la prod (3306a34).
- Noms de terrains incompatibles avec le format API `terrain-N` : Arena Bouskoura = "Terrain A…I", Green Sports Park = "Alpha…Zeta".
- `Player.html` : format exact du champ d'expiration (`expire` attendu par le JS) et de `heure_debut` (`21:00` ou `21:00:00` ?) non confirmé — la base est vide (0 vidéo), l'API ne renvoie que `[]` / 404. À vérifier avec une vraie vidéo ou en lisant `app.py`.

Action recommandée à la reprise : faire le ménage dans les branches, merger ou abandonner explicitement chacune, et repartir d'une branche `main` propre comme unique source de vérité.

## Site web — pages existantes

- **index.html** — page d'accueil. Design : fond noir `#080808`, jaune fluo `#C8FF00`, police Barlow Condensed ultra-bold. Logo en 3 barres verticales + texte MYMATCH. Hero avec photo de terrain marocain (drapeau), titre "TU VIENS DE MARQUER." + "MATENSACH." en accent jaune. Sections : stats animées, aperçu vidéo, "comment ça marche", citations des 2 fondateurs, section Casablanca (mosquée Hassan II), clubs partenaires, footer (mentions légales, copyright, réseaux sociaux), bouton "Partager MyMatch" (WhatsApp).
- **Player.html** — page lecteur vidéo. Reçoit club/terrain/date/heure en paramètres URL, interroge `/api/video`, charge la vraie vidéo dans un lecteur HTML5.
- **Sélection de créneaux dynamique** : implémentée et validée en test — le site interroge `/api/creneaux` et n'affiche que les horaires où une vidéo existe réellement (plus de créneaux fixes 9h/10h/11h... codés en dur). Si aucun créneau, le site reste bloqué à l'étape "date" avec le message "Aucune vidéo disponible pour ce terrain à cette date." et le bouton "Voir mon match" reste désactivé.
- Le parcours complet a été testé et validé en août 2026 avec de fausses vidéos uploadées manuellement via curl : sélection → créneau réel → Player.html → vidéo qui se charge. Mais jamais avec une vraie caméra/un vrai enregistrement.

## Outils de travail utilisés

- Claude Code (web, sessions régulièrement instables/plantées — recréer une session consiste à reconnecter le repo GitHub et relire ce fichier).
- Déploiement manuel : après chaque session Claude Code, il faut se connecter en SSH et faire `git pull` dans `/var/www/mymatch/static`.
- Un skill ui-ux-pro-max a été installé dans une session Claude Code (fichiers volumineux visibles dans le repo sous `.claude/skills/`) — pertinence et usage réel incertains, à évaluer.

## Scripts Raspberry Pi — écrits mais jamais testés avec du vrai matériel

Tous rédigés et sauvegardés par le fondateur, jamais déployés ni exécutés sur un vrai RPi avec une vraie caméra.

### detect_and_record.py

Détection de mouvement (OpenCV, seuil 15%, comparaison de frames), déclenchement FFmpeg (`-c copy`, pas de réencodage — le RPi n'a qu'à écrire le flux déjà compressé par la caméra), nommage automatique du fichier avec l'heure exacte de début (`club_terrain_YYYY-MM-DD_HHhMM.mp4`), arrêt après 15 min sans mouvement ou 75 min max, notification de statut à l'API, appel de `upload.py` en sous-processus à la fin de l'enregistrement.

### upload.py

Upload du fichier vers `/api/upload` sur le serveur, 3 tentatives avec 60s d'intervalle en cas d'échec, vérification de la connexion serveur avant tentative, suppression du fichier local seulement après upload confirmé, système de file d'attente (`mymatch_upload_attente.txt`) pour réessayer les échecs au prochain cycle.

### alerts.py

Surveillance toutes les 10 min : ping caméra, % d'usage du SSD (seuil 80%), accessibilité du serveur mymatch.ma, et que `detect_and_record.py` tourne toujours (redémarre automatiquement sinon). Alertes SMS via Twilio — compte Twilio jamais créé/configuré, les identifiants dans le script sont des placeholders. Numéros d'alerte prévus : +212641690227 et un second numéro non communiqué. Redémarrage préventif du RPi à 3h du matin (seulement si aucun enregistrement en cours).

### Configuration systemd prévue (2 services, pas 3 — upload.py n'est pas un service permanent, il est appelé ponctuellement)

- `mymatch-detect.service` → lance `detect_and_record.py`, Restart=always
- `mymatch-alerts.service` → lance `alerts.py`, Restart=always

Commandes de déploiement déjà rédigées, jamais exécutées faute de matériel fonctionnel réuni au même endroit.

## Ce qui a été volontairement écarté ou reporté

- Bouton physique de déclenchement : envisagé puis abandonné au profit de la détection de mouvement seule.
- Pitcher un club avant d'avoir un système validé : explicitement écarté, risque de copie et d'accord non contraignant au Maroc.
- Tablette de stats sur le terrain (joueurs inscrits, clic sur le buteur, score live) : idée en discussion, jugée secondaire ("séduction, pas solidité") tant que le cœur du système (caméra → vidéo) n'est pas validé. Questions ouvertes non tranchées : qui clique pendant le match, qui saisit les noms des joueurs, interface tactile ou boutons prédéfinis, lien ou non avec la vidéo du match.
- Déclaration CNDP, contrat type avec les clubs, CGU détaillées, consultation d'un avocat marocain : jugé nécessaire mais non bloquant pour un lancement pilote ("lancez-vous, régularisez ensuite" — approche assumée, inspirée de la trajectoire de Spash en France).
- Cloudflare R2 pour le stockage vidéo : solution identifiée comme la bonne direction long terme, non implémentée.

## Priorités à la reprise (dans l'ordre recommandé)

1. Racheter microSD + SSD en France (le kit RPi/caméra/injecteur PoE est à Casablanca, à rapatrier).
2. Nettoyer le dépôt GitHub : choisir/créer une branche `main` unique, merger ou trancher le sort des branches `claude/*` en suspens, vérifier si la nouvelle version de Player.html a été déployée ou non.
3. Reprendre le flashage et la configuration du RPi une fois le matériel réuni en France (via le PC disponible sur place, avec un adaptateur microSD compatible).
4. Tester la chaîne complète en appartement : caméra → détection (seuil à recalibrer pour un petit espace) → enregistrement → upload → vidéo visible sur mymatch.ma, à répéter jusqu'à fiabilité sur plusieurs jours.
5. Avant mai 2027 : si le temps le permet, tableau de bord admin, route de désactivation à distance d'un terrain, configuration Twilio pour les alertes SMS réelles, message d'attente sur le site si un joueur scanne juste après son match et que l'upload n'est pas encore terminé.
6. Mai 2027 : installation terrain pilote chez City Foot 5, uniquement une fois le système validé plusieurs jours d'affilée.

*Fichier remis à jour le 26 novembre 2026 après ~2 mois de pause du projet.*
