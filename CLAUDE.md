# MyMatch — Fichier de contexte projet (mis à jour 26 novembre 2026)

> 🔒 **Le repo GitHub est PUBLIC.** N'y écrire **jamais** aucun secret, même temporairement (un commit supprimé ensuite reste lisible dans l'historique) : mots de passe, clé API (`MYMATCH_API_KEY`), identifiants Twilio, clés SSH, fichiers `.env`, `app.py` du serveur. Les secrets restent uniquement sur le serveur / le RPi ; ce fichier dit seulement *où* ils sont rangés.

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
- Base de données : PostgreSQL, DB `mymatch`, user `mymatch_user`. Mot de passe **changé le 26/11/2026** (l'ancien était exposé publiquement dans l'historique git) ; il n'est noté nulle part dans le repo.
  - Table `clubs` (city-foot-5, arena-bouskoura, green-sports-park déjà insérés)
  - Table `terrains`
  - Table `videos` (club_id, terrain_numero, date_match, heure_debut, heure_fin, fichier, taille_octets, date_upload, date_expiration, statut)
  - 0 vidéo en base au 26/11/2026 (vidéos de test uploadées en août puis supprimées manuellement).
- Backend : Flask + Gunicorn (3 workers) + service systemd `mymatch` (Restart=always). Routes existantes : `/api/nouvelle-video`, `/api/creneaux`, `/api/video`, `/api/statut`, `/api/upload`, `/api/purge`.
- ✅ **Sécurisation de l'API — résolu, déployé et vérifié le 26/11/2026** :
  - `/api/upload`, `/api/nouvelle-video` et `/api/purge` exigent le header `X-API-Key` (401 sinon ; 503 si la clé n'est pas configurée côté serveur). `/api/video`, `/api/creneaux` restent publiques ; `/api/statut` n'est pas protégée (ne fait rien pour l'instant).
  - Validation stricte avant de construire le nom de fichier (400 sinon) : club ∈ {city-foot-5, arena-bouskoura, green-sports-park}, terrain = `terrain-N`, date = `AAAA-MM-JJ` (date réelle), heures = `HH:MM` (sans secondes). Bloque `../` et tout caractère inattendu.
  - La clé n'est **pas** dans `app.py` ni dans le repo : variable `MYMATCH_API_KEY` dans `/etc/systemd/system/mymatch.service.d/cle-api.conf` (chmod 600). Ne jamais l'écrire dans ce fichier.
  - Sauvegarde de l'ancienne version : `/var/www/mymatch/app.py.avant-cle-api`.
  - Vérifié : service actif, les 3 tests curl OK (sans clé → 401, avec clé → `{"deleted":0}`, `/api/creneaux` → `[]`). `purge.py` (cron 3h) n'appelle pas l'API → non impacté.
  - `app.py` n'est volontairement pas versionné dans le repo (il contient le mot de passe de la base).
- Reverse proxy : Nginx, `client_max_body_size 5000M` (configuré après une erreur 413 lors des tests d'upload).
- ✅ **Blocage des fichiers cachés et `.md` — résolu, déployé et vérifié le 27/11/2026** : le dossier servi étant un clone git, Nginx exposait `/.git/`, `/.mcp.json`, `/CLAUDE.md`… Règles dans `/etc/nginx/snippets/mymatch-bloque.conf` (incluses après chaque `server_name` de la config du site) : tout chemin commençant par un point → 404, **sauf `/.well-known/`** (indispensable au renouvellement Certbot) ; tout fichier `.md` → 404. Sauvegarde de l'ancienne config : `/root/nginx-mymatch.avant-blocage`. Vérifié : `/.git/config`, `/CLAUDE.md`, `/.mcp.json` → 404 ; `/`, `/Player.html` → 200 ; `certbot renew --dry-run` OK.
- Domaine : mymatch.ma acheté via Genious Communication (registrar marocain agréé ANRT), DNS configuré, HTTPS actif via Certbot/Let's Encrypt.
- Firewall : UFW actif, ports 22/80/443 seulement.
- Purge automatique : cron à 3h du matin, script `/var/www/mymatch/purge.py`, supprime les vidéos dont `date_expiration < NOW()`.
- Déploiement du site : le dossier `/var/www/mymatch/static` est un clone git du repo GitHub, **sur la branche `main`**. Mise à jour = `cd /var/www/mymatch/static && git pull`. Ce n'est pas automatique, il faut le faire manuellement à chaque fois que des changements sont poussés sur `main`.

Check de santé effectué le 26/11/2026 : les 3 services (mymatch, nginx, postgresql) sont actifs, l'API répond correctement, le serveur a tenu 2 mois sans supervision ni incident. Usage disque : 17.6% (30Go libres sur 40Go — attention, dès qu'un vrai terrain enverra des matchs régulièrement, ce sera insuffisant, cf. section stockage ci-dessus).

## État du repository GitHub (ridaouighali009/Mymatch)

✅ **Depuis le 27/11/2026, `main` est la branche de production et l'unique source de vérité.** Le serveur (`/var/www/mymatch/static`) suit `main` (bascule faite le 27/11/2026 sur le commit `72febe6`, vérifiée : site OK, « Aucune vidéo disponible » affiché comme attendu).

- **Mise à jour du site** : `cd /var/www/mymatch/static && git pull` (sur `main`). Pas de redémarrage nécessaire : Nginx sert les fichiers directement. Le backend `app.py` n'est pas dans le repo et se met à jour séparément.
- **Retour arrière** si besoin : `git checkout claude/install-ui-ux-skill-yTgfh` dans `/var/www/mymatch/static` (ancienne prod, commit `3306a34`).
- Tout nouveau travail part de `main` et y revient ; ne plus laisser traîner de branches `claude/*` non mergées.
- ⚠️ **La branche par défaut du dépôt GitHub est encore `claude/install-ui-ux-skill-yTgfh`** : tout fichier envoyé via l'interface web de GitHub y atterrit au lieu de `main` (arrivé le 27/11/2026 avec reference-v5.html). À changer dans GitHub → Settings → General → Default branch → `main`.

Branches restantes :

- `main` — production.
- `claude/install-ui-ux-skill-yTgfh` — ancienne prod (`3306a34`), gardée uniquement comme point de retour arrière ; supprimable une fois `main` éprouvé.
- Supprimées le 27/11/2026 : `claude/charming-planck-fvyavw` (contenu intégré à `main`), `claude/add-match-redirect-5Lfzo`, `claude/review-claude-md-es2dh` (obsolètes).

Ménage fait au 26-27/11/2026 : skill `ui-ux-pro-max` retiré du repo ; nouveau `Player.html` intégré et déployé ; sélection multi-clubs corrigée et déployée (créneaux réels via `/api/creneaux`, terrains « Terrain 1…N » → `terrain-N` sur les 3 clubs).

🎨 **Refonte design v3 — fusionnée dans `main` le 27/11/2026, PAS ENCORE DÉPLOYÉE** (le serveur est encore sur `4e7df00`). Source : branche `Refonte-v3` / PR #2. Voir « Site web » ci-dessous. Sélection limitée à **City Foot 5** (multi-clubs mis de côté, voir « Écarté ou reporté »).

✅ Exposition de `/.git/` et des fichiers `.md` via Nginx — résolu le 27/11/2026 (voir « Reverse proxy » dans Infrastructure serveur).

## Site web — pages existantes

### Charte graphique (refonte v3, validée — ne pas modifier sans accord)

| Rôle | Code | Variable CSS |
|---|---|---|
| Vert forêt (fond principal) | `#1F3B2D` | `--bg`, `--navy` |
| Vert forêt foncé / clair (surfaces) | `#152A20` / `#2A4A3A` | `--navy2` `--s1` / `--navy3` `--s2` |
| Crème (sections claires) | `#F2EAD7` / `#F8F3E8` | `--ice` / `--ice2` |
| Orange brûlé (accent, titres) | `#E8873F` (clair `#F2B27A`, foncé `#9A3F00`) | `--coral` (`--coral2`, `--coral-d`) |
| Orange des boutons principaux | `#BF5000`, texte `#FFF8EC` | forcé en CSS sur `.btn-p`, `.nav-cta`… |
| Texte sur crème | `#5A6B5F` | `--ink-m` |

⚠️ Nom trompeur hérité : la variable `--green` vaut l'orange `#E8873F`.

- **Police** : Archivo (Google Fonts, axes largeur/graisse) sur tout le site ; titres en Archivo noir (900) italique.
- **Logo « Y-célébration »** (depuis le 27/11/2026) : le Y de MYMATCH est un joueur qui lève les bras, la balle orange (`#CC5500`) est sa tête. Fichiers dans `logo/` :
  - `mymatch-logo-clair.svg` (lettres crème, pour fonds verts/foncés) et `mymatch-logo-fonce.svg` (lettres vertes, pour fonds crème/clairs) — lettres déjà en tracés, ne jamais ajouter de texte « MyMatch » à côté ; PNG équivalents (1181×300).
  - `mymatch-icone.svg` / `favicon.svg` (Y sur tuile verte arrondie), `mymatch-y-seul.svg` (Y seul, fond transparent), `favicon-32.png`, `apple-touch-icon.png` (180), `icone-512.png`.
  - Utilisé en `<img class="logo-img">` (hauteur 28 px ordinateur, 23 px mobile) : header d'`index.html` (visible aussi menu mobile ouvert), footer, transition vers le lecteur (`.pw-logo`, 44/36 px), header de `Player.html`. Tous ces emplacements sont sur fond vert → version **claire** ; la version foncée n'est pas utilisée pour l'instant.
  - Favicons des 2 pages : `/logo/favicon.svg`, `/logo/favicon-32.png`, `/logo/apple-touch-icon.png`.
  - L'ancienne balle à traînées (`#mm-ball`) a été supprimée le 27/11/2026 (plus aucun usage).

### Animations (depuis le 27/11/2026, prototype validé `animations-reference.html`, supprimé du repo après intégration)

- **Écran de chargement `.ld`** (accueil + lecteur) : le logo se construit (balle qui arrive en 2 rebonds et devient la tête, corps qui sort du sol, bras qui se lèvent, lettres qui glissent), les bras « pompent » en attendant, puis sortie « frappe vers l'écran » (la balle grossit et un trou s'ouvre sur la page). SVG, CSS et script `MMLoader` repris tels quels de la référence.
  - Accueil : `data-min="2300"` (durée minimale) ; se termine à `window.load`.
  - `Player.html` : `data-min="3400"` + `data-wait-for-video="true"` ; `MMLoader.done()` est appelé à `loadeddata`, `loadedmetadata` (sur iPhone, `loadeddata` n'arrive souvent qu'à la lecture) ou `error` de la vidéo, et quand l'API ne renvoie pas de vidéo.
  - Ajout MyMatch au script : filet de sécurité `data-max` (9 000 ms par défaut) — la page s'ouvre quoi qu'il arrive.
- **Transition accueil → lecteur** (`.page-wipe`) : même fond dégradé que l'écran de chargement, sans logo statique ; l'écran de chargement du lecteur prend le relais avec le logo animé.
- **Balle de défilement `.sc`** (accueil uniquement) : balle orange qui roule sur une ligne en haut de page, proportionnellement au défilement (remplace l'ancienne barre `.scroll-progress`).
- **Passe en pointillés** dans « Comment ça marche » : un trait orange en pointillés relie chaque étape à la suivante quand elle apparaît (vertical sur mobile, horizontal entre les cartes sur ordinateur). CSS seul (`.how-item::after`).
- `prefers-reduced-motion` respecté partout : logo affiché directement puis fondu, balle de défilement masquée, pointillés affichés sans animation.
- Mobile : espace réservé sous le pied de page (150 px) pour que la barre « Retrouve ta vidéo » et le bouton WhatsApp ne cachent plus le copyright.

### Photos (`images/`, toutes en WebP)

Générées avec Figma, fichier **« MyMatch — Visuels du site »** ; converties de JPG en WebP le 27/11/2026 (rendu identique, -22 à -43 % de poids).

| Fichier | Rôle |
|---|---|
| `joueur.webp` | Joueur en photo à droite du haut de page (préchargé) |
| `hero-action.webp` | Fond du haut de page (préchargé) + carte « Foot » de la section multisport |
| `terrain-nuit.webp` | Fond du bandeau terrain de nuit |
| `but.webp` | Fond de l'affiche « but » d'`index.html` + bloc Instagram de `Player.html` |
| `padel.webp` | Carte « Padel » de la section multisport |
| `basket.webp` | Carte « Basket » de la section multisport |
| `mosquee-hassan2.webp` | Mosquée Hassan II au coucher du soleil, section « Le talent casablancais » (chargement différé, cadrage `object-position: left 28%`) |

Images supprimées le 27/11/2026 (plus utilisées) : `hero-bg`, `night-bg`, `mural-bg`, `cityfoot-bg`, `cityfoot-logo`, `club-ico`, `video-thumb`, puis `casa-bg` (ancienne photo de la mosquée, remplacée par `mosquee-hassan2`). Récupérables dans l'historique git si besoin.

Design de référence : `reference-v5.html` (index final validé), sur la branche `claude/install-ui-ux-skill-yTgfh` (commit `f2a380d`) — volontairement **non copié sur `main`** (il serait servi publiquement sur mymatch.ma). `index.html` de `main` = reference-v5 + optimisations (WebP, préchargement, lazy, WhatsApp mobile, contraste mentions légales).

### Pages

- **index.html** — page d'accueil : haut de page « TU VIENS DE MARQUER. / MATENSACH. » avec joueur à droite, stats, aperçu vidéo, sélection du match, « comment ça marche », « Le talent casablancais » (mosquée), fondateurs, section multisport foot / padel / basket, FAQ, footer.
- **Sélection du match** : **City Foot 5 uniquement** (13 terrains, 1 à 6 filmés). Appelle `/api/creneaux?club=city-foot-5&terrain=terrain-N&date=AAAA-MM-JJ` (date locale) et n'affiche que les créneaux réels ; si aucun : « Aucune vidéo disponible pour ce terrain à cette date. », bouton « Voir mon match » désactivé. Ouvre `Player.html?club=City Foot 5&terrain=Terrain N&date=…&heure=…`.
- **Player.html** — lecteur vidéo : interroge `/api/video` puis `/api/creneaux` (sidebar des autres matchs). Garde les corrections : « Terrain 3 » / « terrain-3 » / « 3 » → `terrain-3` ; taille en Mo / Go ; `expire` avec microsecondes ; heures comparées en HH:MM ; sidebar construite en `textContent`.
- Le parcours complet a été testé en août 2026 avec de fausses vidéos uploadées via curl, et la refonte le 27/11/2026 avec API simulée + vraie API en lecture seule. Jamais avec une vraie caméra / un vrai enregistrement.

## Outils de travail utilisés

- Claude Code (web, sessions régulièrement instables/plantées — recréer une session consiste à reconnecter le repo GitHub et relire ce fichier).
- Déploiement manuel : après chaque session Claude Code, il faut se connecter en SSH et faire `git pull` dans `/var/www/mymatch/static` (branche `main`).
- Le skill ui-ux-pro-max a été retiré du repo le 26/11/2026 (3,6 Mo inutiles, risque d'exposition via Nginx).

## Scripts Raspberry Pi — écrits mais jamais testés avec du vrai matériel

Tous rédigés et sauvegardés par le fondateur, jamais déployés ni exécutés sur un vrai RPi avec une vraie caméra.

### detect_and_record.py

Détection de mouvement (OpenCV, seuil 15%, comparaison de frames), déclenchement FFmpeg (`-c copy`, pas de réencodage — le RPi n'a qu'à écrire le flux déjà compressé par la caméra), nommage automatique du fichier avec l'heure exacte de début (`club_terrain_YYYY-MM-DD_HHhMM.mp4`), arrêt après 15 min sans mouvement ou 75 min max, notification de statut à l'API, appel de `upload.py` en sous-processus à la fin de l'enregistrement.

### upload.py

Upload du fichier vers `/api/upload` sur le serveur, 3 tentatives avec 60s d'intervalle en cas d'échec, vérification de la connexion serveur avant tentative, suppression du fichier local seulement après upload confirmé, système de file d'attente (`mymatch_upload_attente.txt`) pour réessayer les échecs au prochain cycle.

### alerts.py

Surveillance toutes les 10 min : ping caméra, % d'usage du SSD (seuil 80%), accessibilité du serveur mymatch.ma, et que `detect_and_record.py` tourne toujours (redémarre automatiquement sinon). Alertes SMS via Twilio — compte Twilio jamais créé/configuré, les identifiants dans le script sont des placeholders. Numéros d'alerte prévus : +212641690227 et un second numéro non communiqué. Redémarrage préventif du RPi à 3h du matin (seulement si aucun enregistrement en cours).

### ⚠️ À faire sur les scripts RPi suite à la sécurisation de l'API

- `upload.py` (et `detect_and_record.py` s'il appelle `/api/nouvelle-video`) doit envoyer `headers={"X-API-Key": API_KEY}`, avec la même clé que sur le serveur.
- Les valeurs envoyées doivent respecter le format validé : `city-foot-5`, `terrain-3`, `2026-08-10`, `21:05`.
- Ne pas remettre en file d'attente indéfiniment un envoi refusé en 400/401 (réessayer ne règle rien) : le signaler à la place.

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
- **Sélection multi-clubs (Arena Bouskoura, Green Sports Park) : mise de côté le 27/11/2026**, le site ne propose que City Foot 5 (club pilote). La version 3 clubs existe dans l'historique de `main` (commit `72febe6` : 3 cartes club, terrains « Terrain 1…N » → `terrain-N`, appel `/api/creneaux` avec le slug du club choisi) — à reprendre dans le nouveau design quand un 2e club sera en vue.

## Priorités à la reprise (dans l'ordre recommandé)

1. Racheter microSD + SSD en France (le kit RPi/caméra/injecteur PoE est à Casablanca, à rapatrier).
2. ~~Nettoyer le dépôt GitHub~~ → fait le 27/11/2026 : `main` est la branche de production, branches obsolètes supprimées, nouveau Player.html déployé.
3. Reprendre le flashage et la configuration du RPi une fois le matériel réuni en France (via le PC disponible sur place, avec un adaptateur microSD compatible).
4. Tester la chaîne complète en appartement : caméra → détection (seuil à recalibrer pour un petit espace) → enregistrement → upload → vidéo visible sur mymatch.ma, à répéter jusqu'à fiabilité sur plusieurs jours.
5. Avant mai 2027 : si le temps le permet, tableau de bord admin, route de désactivation à distance d'un terrain, configuration Twilio pour les alertes SMS réelles, message d'attente sur le site si un joueur scanne juste après son match et que l'upload n'est pas encore terminé.
6. Mai 2027 : installation terrain pilote chez City Foot 5, uniquement une fois le système validé plusieurs jours d'affilée.

*Fichier remis à jour le 26 novembre 2026 après ~2 mois de pause du projet.*
