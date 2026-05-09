/* ============================================================
   MyMatch — Logique de la page d'accueil (sélection vidéo)
   Page : index.html
   Rôle : gérer les 4 étapes (club → terrain → date → heure)
          et activer le bouton "Voir mon match" quand tout est rempli.
   Stack : JavaScript vanilla, aucun framework.
   ============================================================ */

(() => {
  'use strict';


  /* ------------------------------------------------------------
     1. DONNÉES — Clubs, terrains filmés et créneaux horaires
        (source : Claude.md, section "Données de test")
     ------------------------------------------------------------ */
  const CLUBS = [
    {
      id: 'city-foot-5',
      nom: 'City Foot 5',
      ville: 'Casablanca centre',
      terrains: [
        { id: 1, nom: 'Terrain 1', code: 'CF5-T1' },
        { id: 2, nom: 'Terrain 2', code: 'CF5-T2' },
        { id: 3, nom: 'Terrain 3', code: 'CF5-T3' },
        { id: 4, nom: 'Terrain 4', code: 'CF5-T4' },
        { id: 5, nom: 'Terrain 5', code: 'CF5-T5' },
        { id: 6, nom: 'Terrain 6', code: 'CF5-T6' }
      ]
    },
    {
      id: 'arena-bouskoura',
      nom: 'Arena Bouskoura',
      ville: 'Bouskoura',
      terrains: [
        { id: 1, nom: 'Terrain A', code: 'AB-TA' },
        { id: 2, nom: 'Terrain B', code: 'AB-TB' },
        { id: 3, nom: 'Terrain C', code: 'AB-TC' },
        { id: 4, nom: 'Terrain D', code: 'AB-TD' }
      ]
    },
    {
      id: 'green-sports-park',
      nom: 'Green Sports Park',
      ville: 'Bouskoura',
      terrains: [
        { id: 1, nom: 'Terrain Alpha', code: 'GSP-1' },
        { id: 2, nom: 'Terrain Beta',  code: 'GSP-2' },
        { id: 3, nom: 'Terrain Gamma', code: 'GSP-3' }
      ]
    }
  ];

  // Plage active : 8h → 1h du matin (Claude.md). Ici on propose 09:00 → 23:00.
  const HORAIRES = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
    '21:00', '22:00', '23:00'
  ];

  // Vidéos conservées 14 jours → on propose 14 dates (aujourd'hui + 13 jours antérieurs).
  const NB_JOURS = 14;


  /* ------------------------------------------------------------
     2. ÉTAT — Sélection courante de l'utilisateur
     ------------------------------------------------------------ */
  const state = {
    club: null,     // objet club
    terrain: null,  // objet terrain
    date: null,     // objet Date
    heure: null     // string "HH:MM"
  };


  /* ------------------------------------------------------------
     3. RÉFÉRENCES DOM
     ------------------------------------------------------------ */
  const el = {
    steps: {
      1: document.getElementById('step-1'),
      2: document.getElementById('step-2'),
      3: document.getElementById('step-3'),
      4: document.getElementById('step-4')
    },
    clubGrid: document.getElementById('club-grid'),
    terrainGrid: document.getElementById('terrain-grid'),
    terrainEmpty: document.getElementById('terrain-empty'),
    dateScroller: document.getElementById('date-scroller'),
    timeGrid: document.getElementById('time-grid'),
    ctaButton: document.getElementById('cta-button'),
    ctaSummary: document.getElementById('cta-summary'),
    statuses: {
      1: document.querySelector('[data-step-status="1"]'),
      2: document.querySelector('[data-step-status="2"]'),
      3: document.querySelector('[data-step-status="3"]'),
      4: document.querySelector('[data-step-status="4"]')
    }
  };


  /* ------------------------------------------------------------
     4. UTILITAIRES
     ------------------------------------------------------------ */
  const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const MOIS = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

  /** Renvoie une clé YYYY-MM-DD pour comparer deux dates sans tenir compte de l'heure. */
  function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** Format d'affichage long (ex : "Jeu 9 mai"). */
  function formatDateLong(date) {
    return `${JOURS[date.getDay()]} ${date.getDate()} ${MOIS[date.getMonth()]}`;
  }

  /** Génère la liste des 14 derniers jours (du plus récent au plus ancien). */
  function genererDates() {
    const dates = [];
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    for (let i = 0; i < NB_JOURS; i++) {
      const d = new Date(aujourdhui);
      d.setDate(aujourdhui.getDate() - i);
      dates.push(d);
    }
    return dates;
  }


  /* ------------------------------------------------------------
     5. RENDU — Étape 1 : grille des clubs
     ------------------------------------------------------------ */
  function renderClubs() {
    el.clubGrid.innerHTML = '';
    CLUBS.forEach((club) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'club-card';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.dataset.clubId = club.id;
      btn.innerHTML = `
        <span class="club-card-check" aria-hidden="true">✓</span>
        <span class="club-card-name">${club.nom}</span>
        <span class="club-card-meta">
          <svg class="club-card-pin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" stroke="currentColor" stroke-width="1.8"/>
            <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.8"/>
          </svg>
          ${club.ville}
        </span>
        <span class="club-card-count">${club.terrains.length} terrains filmés</span>
      `;
      btn.addEventListener('click', () => selectClub(club.id));
      el.clubGrid.appendChild(btn);
    });
  }


  /* ------------------------------------------------------------
     6. RENDU — Étape 2 : grille des terrains
     ------------------------------------------------------------ */
  function renderTerrains(club) {
    el.terrainGrid.innerHTML = '';

    if (!club) {
      el.terrainGrid.innerHTML = `
        <p class="empty-state">Sélectionnez d'abord un club ci-dessus.</p>
      `;
      return;
    }

    club.terrains.forEach((terrain) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'terrain-card';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.dataset.terrainId = terrain.id;
      btn.innerHTML = `
        <span class="terrain-card-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/>
            <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" stroke-width="1.8"/>
            <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="1.8"/>
          </svg>
        </span>
        <span class="terrain-card-name">${terrain.nom}</span>
        <span class="terrain-card-code">${terrain.code}</span>
      `;
      btn.addEventListener('click', () => selectTerrain(terrain.id));
      el.terrainGrid.appendChild(btn);
    });
  }


  /* ------------------------------------------------------------
     7. RENDU — Étape 3 : pastilles de dates
     ------------------------------------------------------------ */
  function renderDates() {
    el.dateScroller.innerHTML = '';
    const dates = genererDates();
    const cleAujourdhui = dateKey(new Date());

    dates.forEach((d) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'date-pill';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      const key = dateKey(d);
      btn.dataset.dateKey = key;
      btn.setAttribute('aria-label', formatDateLong(d));

      if (key === cleAujourdhui) {
        btn.classList.add('is-today');
      }

      btn.innerHTML = `
        <span class="date-pill-day">${JOURS[d.getDay()]}</span>
        <span class="date-pill-num">${d.getDate()}</span>
        <span class="date-pill-month">${MOIS[d.getMonth()]}</span>
      `;
      btn.addEventListener('click', () => selectDate(key, d));
      el.dateScroller.appendChild(btn);
    });
  }


  /* ------------------------------------------------------------
     8. RENDU — Étape 4 : créneaux horaires
     ------------------------------------------------------------ */
  function renderHoraires() {
    el.timeGrid.innerHTML = '';
    HORAIRES.forEach((heure) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-pill';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.dataset.heure = heure;
      btn.textContent = heure;
      btn.addEventListener('click', () => selectHeure(heure));
      el.timeGrid.appendChild(btn);
    });
  }


  /* ------------------------------------------------------------
     9. SÉLECTIONS — handlers
     ------------------------------------------------------------ */
  function selectClub(clubId) {
    const club = CLUBS.find((c) => c.id === clubId);
    if (!club) return;

    // Si on change de club, on remet à zéro le terrain sélectionné.
    const aChange = state.club?.id !== club.id;
    state.club = club;
    if (aChange) {
      state.terrain = null;
    }

    // Mise à jour visuelle des cartes club.
    el.clubGrid.querySelectorAll('.club-card').forEach((card) => {
      const estSelectionne = card.dataset.clubId === clubId;
      card.classList.toggle('is-selected', estSelectionne);
      card.setAttribute('aria-checked', estSelectionne ? 'true' : 'false');
    });

    renderTerrains(club);
    updateUI();
  }

  function selectTerrain(terrainId) {
    if (!state.club) return;
    const terrain = state.club.terrains.find((t) => t.id === terrainId);
    if (!terrain) return;
    state.terrain = terrain;

    el.terrainGrid.querySelectorAll('.terrain-card').forEach((card) => {
      const estSelectionne = Number(card.dataset.terrainId) === terrainId;
      card.classList.toggle('is-selected', estSelectionne);
      card.setAttribute('aria-checked', estSelectionne ? 'true' : 'false');
    });

    updateUI();
  }

  function selectDate(key, date) {
    state.date = date;

    el.dateScroller.querySelectorAll('.date-pill').forEach((pill) => {
      const estSelectionne = pill.dataset.dateKey === key;
      pill.classList.toggle('is-selected', estSelectionne);
      pill.setAttribute('aria-checked', estSelectionne ? 'true' : 'false');
    });

    updateUI();
  }

  function selectHeure(heure) {
    state.heure = heure;

    el.timeGrid.querySelectorAll('.time-pill').forEach((pill) => {
      const estSelectionne = pill.dataset.heure === heure;
      pill.classList.toggle('is-selected', estSelectionne);
      pill.setAttribute('aria-checked', estSelectionne ? 'true' : 'false');
    });

    updateUI();
  }


  /* ------------------------------------------------------------
     10. MISE À JOUR DE L'INTERFACE GLOBALE
         (verrouillage / déverrouillage des étapes,
          libellés de statut, état du bouton CTA)
     ------------------------------------------------------------ */
  function updateUI() {
    const completion = {
      1: !!state.club,
      2: !!state.terrain,
      3: !!state.date,
      4: !!state.heure
    };

    // Pour chaque étape : on définit son état (verrouillée / active / complétée).
    for (let i = 1; i <= 4; i++) {
      const stepEl = el.steps[i];
      stepEl.classList.remove('is-locked', 'is-active', 'is-completed');

      const precedenteOk = i === 1 ? true : completion[i - 1];

      if (completion[i]) {
        stepEl.classList.add('is-completed');
        stepEl.removeAttribute('aria-disabled');
      } else if (precedenteOk) {
        stepEl.classList.add('is-active');
        stepEl.removeAttribute('aria-disabled');
      } else {
        stepEl.classList.add('is-locked');
        stepEl.setAttribute('aria-disabled', 'true');
      }
    }

    // Libellés de statut à droite de chaque en-tête d'étape.
    el.statuses[1].textContent = state.club    ? state.club.nom    : '';
    el.statuses[2].textContent = state.terrain ? state.terrain.nom : '';
    el.statuses[3].textContent = state.date    ? formatDateLong(state.date) : '';
    el.statuses[4].textContent = state.heure   ? state.heure       : '';

    // Bouton CTA + résumé.
    const tousChoisis = completion[1] && completion[2] && completion[3] && completion[4];
    el.ctaButton.disabled = !tousChoisis;

    if (tousChoisis) {
      el.ctaSummary.textContent =
        `${state.club.nom} · ${state.terrain.nom} · ${formatDateLong(state.date)} · ${state.heure}`;
      el.ctaSummary.classList.add('is-ready');
    } else {
      const restantes = 4 - Object.values(completion).filter(Boolean).length;
      el.ctaSummary.textContent = restantes === 4
        ? 'Complétez les 4 étapes ci-dessus'
        : `Encore ${restantes} étape${restantes > 1 ? 's' : ''} à compléter`;
      el.ctaSummary.classList.remove('is-ready');
    }
  }


  /* ------------------------------------------------------------
     11. CTA — clic sur "Voir mon match"
         Pour l'instant on redirige vers player.html avec les
         paramètres en query string. Cette page sera créée plus tard.
     ------------------------------------------------------------ */
  el.ctaButton.addEventListener('click', () => {
    if (el.ctaButton.disabled) return;

    const params = new URLSearchParams({
      club: state.club.id,
      terrain: state.terrain.code,
      date: dateKey(state.date),
      heure: state.heure
    });

    // Redirection prévue : window.location.href = `player.html?${params}`;
    // En attendant que player.html soit développé, on logue + alerte.
    console.log('[MyMatch] Lecture vidéo demandée :', params.toString());
    alert(
      `Lecture du match :\n` +
      `Club : ${state.club.nom}\n` +
      `Terrain : ${state.terrain.nom}\n` +
      `Date : ${formatDateLong(state.date)}\n` +
      `Heure : ${state.heure}\n\n` +
      `(player.html sera développé à l'étape suivante)`
    );
  });


  /* ------------------------------------------------------------
     12. INITIALISATION
     ------------------------------------------------------------ */
  function init() {
    renderClubs();
    renderTerrains(null);
    renderDates();
    renderHoraires();
    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
