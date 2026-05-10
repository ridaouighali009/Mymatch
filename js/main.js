/* ============================================================
   MyMatch — Logique de la page d'accueil (sélection vidéo)
   Page : index.html
   Rôle : 4 étapes interactives + header au scroll + menu mobile.
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

  const HORAIRES = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
    '21:00', '22:00', '23:00'
  ];

  // Vidéos conservées 14 jours.
  const NB_JOURS = 14;


  /* ------------------------------------------------------------
     2. ÉTAT DE SÉLECTION
     ------------------------------------------------------------ */
  const state = {
    club: null,
    terrain: null,
    date: null,
    heure: null
  };


  /* ------------------------------------------------------------
     3. RÉFÉRENCES DOM
     ------------------------------------------------------------ */
  const el = {
    header: document.getElementById('site-header'),
    burger: document.getElementById('burger'),
    mobileMenu: document.getElementById('mobile-menu'),
    menuBackdrop: document.getElementById('menu-backdrop'),
    menuClose: document.getElementById('menu-close'),
    steps: {
      1: document.getElementById('step-1'),
      2: document.getElementById('step-2'),
      3: document.getElementById('step-3'),
      4: document.getElementById('step-4')
    },
    clubGrid: document.getElementById('club-grid'),
    terrainGrid: document.getElementById('terrain-grid'),
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
     4. UTILITAIRES DE DATE
     ------------------------------------------------------------ */
  const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const MOIS  = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

  function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDateLong(date) {
    return `${JOURS[date.getDay()]} ${date.getDate()} ${MOIS[date.getMonth()]}`;
  }

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
        <span class="club-card-check" aria-hidden="true"></span>
        <span class="club-card-name">${club.nom}</span>
        <span class="club-card-meta">
          <svg class="club-card-pin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.6"/>
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
        Chaque carte reçoit une variable CSS --i pour le délai
        d'animation (effet d'apparition en cascade).
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
        <span class="terrain-card-check" aria-hidden="true"></span>
        <span class="terrain-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
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
     6b. Faire défiler vers une étape (smooth, sans déborder).
     ------------------------------------------------------------ */
  function scrollVersEtape(numEtape) {
    const stepEl = el.steps[numEtape];
    if (!stepEl) return;
    const headerOffset = 88;
    const rect = stepEl.getBoundingClientRect();
    const ciblesY = window.scrollY + rect.top - headerOffset;
    window.scrollTo({ top: ciblesY, behavior: 'smooth' });
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

    const aChange = state.club?.id !== club.id;
    state.club = club;
    if (aChange) state.terrain = null;

    el.clubGrid.querySelectorAll('.club-card').forEach((card) => {
      const sel = card.dataset.clubId === clubId;
      card.classList.toggle('is-selected', sel);
      card.setAttribute('aria-checked', sel ? 'true' : 'false');
    });

    renderTerrains(club);
    updateUI();

    // On amène l'utilisateur sur l'étape 2 si elle est en dessous de la vue.
    if (aChange) scrollVersEtape(2);
  }

  function selectTerrain(terrainId) {
    if (!state.club) return;
    const terrain = state.club.terrains.find((t) => t.id === terrainId);
    if (!terrain) return;
    state.terrain = terrain;

    el.terrainGrid.querySelectorAll('.terrain-card').forEach((card) => {
      const sel = Number(card.dataset.terrainId) === terrainId;
      card.classList.toggle('is-selected', sel);
      card.setAttribute('aria-checked', sel ? 'true' : 'false');
    });

    updateUI();
  }

  function selectDate(key, date) {
    state.date = date;

    el.dateScroller.querySelectorAll('.date-pill').forEach((pill) => {
      const sel = pill.dataset.dateKey === key;
      pill.classList.toggle('is-selected', sel);
      pill.setAttribute('aria-checked', sel ? 'true' : 'false');
    });

    updateUI();
  }

  function selectHeure(heure) {
    state.heure = heure;

    el.timeGrid.querySelectorAll('.time-pill').forEach((pill) => {
      const sel = pill.dataset.heure === heure;
      pill.classList.toggle('is-selected', sel);
      pill.setAttribute('aria-checked', sel ? 'true' : 'false');
    });

    updateUI();
  }


  /* ------------------------------------------------------------
     10. MISE À JOUR DE L'INTERFACE GLOBALE
     ------------------------------------------------------------ */
  function updateUI() {
    updateStepper();

    const completion = {
      1: !!state.club,
      2: !!state.terrain,
      3: !!state.date,
      4: !!state.heure
    };

    // Verrouillage / déverrouillage des étapes selon la complétion.
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

    el.statuses[1].textContent = state.club    ? state.club.nom    : '';
    el.statuses[2].textContent = state.terrain ? state.terrain.nom : '';
    el.statuses[3].textContent = state.date    ? formatDateLong(state.date) : '';
    el.statuses[4].textContent = state.heure   ? state.heure       : '';

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
     ------------------------------------------------------------ */
  el.ctaButton.addEventListener('click', () => {
    if (el.ctaButton.disabled) return;

    const params = new URLSearchParams({
      club: state.club.id,
      terrain: state.terrain.code,
      date: dateKey(state.date),
      heure: state.heure
    });

    // À brancher quand player.html sera développé :
    // window.location.href = `player.html?${params}`;
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
     12. HEADER — devient opaque au scroll
     ------------------------------------------------------------ */
  function onScroll() {
    if (window.scrollY > 24) {
      el.header.classList.add('is-scrolled');
    } else {
      el.header.classList.remove('is-scrolled');
    }
  }


  /* ------------------------------------------------------------
     13. MENU DRAWER (burger à gauche, ouverture latérale)
         - Ouvre/ferme au clic sur le burger
         - Ferme au clic sur le backdrop, sur la croix, sur un lien,
           ou sur la touche Échap
         - Bloque le scroll du body quand ouvert
     ------------------------------------------------------------ */
  function ouvrirMenu() {
    el.burger.classList.add('is-open');
    el.burger.setAttribute('aria-expanded', 'true');
    el.burger.setAttribute('aria-label', 'Fermer le menu');

    el.mobileMenu.hidden = false;
    el.menuBackdrop.hidden = false;

    // Force un reflow pour que la transition CSS s'applique correctement.
    void el.mobileMenu.offsetWidth;

    el.mobileMenu.classList.add('is-open');
    el.menuBackdrop.classList.add('is-visible');
    document.body.classList.add('menu-open');
  }

  function fermerMenu() {
    el.burger.classList.remove('is-open');
    el.burger.setAttribute('aria-expanded', 'false');
    el.burger.setAttribute('aria-label', 'Ouvrir le menu');

    el.mobileMenu.classList.remove('is-open');
    el.menuBackdrop.classList.remove('is-visible');
    document.body.classList.remove('menu-open');

    // Cache après la transition pour rester accessible.
    setTimeout(() => {
      if (!el.mobileMenu.classList.contains('is-open')) {
        el.mobileMenu.hidden = true;
        el.menuBackdrop.hidden = true;
      }
    }, 320);
  }

  function toggleMenu() {
    if (el.burger.classList.contains('is-open')) fermerMenu();
    else ouvrirMenu();
  }


  /* ------------------------------------------------------------
     14. STEPPER HORIZONTAL — synchronisation avec l'état des étapes
     ------------------------------------------------------------ */
  function updateStepper() {
    const items = document.querySelectorAll('.stepper-item');
    if (!items.length) return;

    const completion = {
      1: !!state.club,
      2: !!state.terrain,
      3: !!state.date,
      4: !!state.heure
    };

    items.forEach((item) => {
      const n = Number(item.dataset.stepper);
      item.classList.remove('is-current', 'is-done', 'is-todo');
      const precedenteOk = n === 1 ? true : completion[n - 1];
      if (completion[n]) {
        item.classList.add('is-done');
      } else if (precedenteOk) {
        item.classList.add('is-current');
      } else {
        item.classList.add('is-todo');
      }
    });
  }


  /* ------------------------------------------------------------
     15. STATS ANIMÉES — compte de 0 jusqu'à la valeur cible
         quand la zone des stats entre dans le viewport.
     ------------------------------------------------------------ */
  function animerCompteurs() {
    const compteurs = document.querySelectorAll('.stat strong[data-count], .hero-stats strong[data-count]');
    if (!compteurs.length) return;

    // Si réduction d'animation : on affiche directement les valeurs finales.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      compteurs.forEach((el) => {
        el.textContent = el.dataset.count + (el.dataset.suffix || '');
      });
      return;
    }

    const lancerCompte = (el) => {
      const cible = parseInt(el.dataset.count, 10) || 0;
      const suffixe = el.dataset.suffix || '';
      const duree = 1400;
      const debut = performance.now();

      function tick(now) {
        const t = Math.min((now - debut) / duree, 1);
        // Easing out cubic pour une décélération naturelle.
        const eased = 1 - Math.pow(1 - t, 3);
        const valeur = Math.round(cible * eased);
        el.textContent = valeur + suffixe;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          lancerCompte(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    compteurs.forEach((c) => observer.observe(c));
  }


  /* ------------------------------------------------------------
     16. INITIALISATION
     ------------------------------------------------------------ */
  function init() {
    renderClubs();
    renderTerrains(null);
    renderDates();
    renderHoraires();
    updateUI();

    animerCompteurs();

    // Header au scroll (avec passive listener pour les perfs mobiles).
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Menu drawer (burger / backdrop / close / liens / Échap).
    el.burger.addEventListener('click', toggleMenu);
    el.menuClose.addEventListener('click', fermerMenu);
    el.menuBackdrop.addEventListener('click', fermerMenu);
    el.mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
      link.addEventListener('click', fermerMenu);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.burger.classList.contains('is-open')) {
        fermerMenu();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
