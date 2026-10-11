const app = document.querySelector('#app');
const toastNode = document.querySelector('#toast');
const pipo = 'assets/pipo-thumbs-up-small.png';

const state = {
  selectedDay: 0,
  meals: [
    { midi: 'Bowl méditerranéen', soir: 'Saumon, légumes rôtis' },
    { midi: 'Salade grecque', soir: 'Pâtes au citron' },
    { midi: 'Poulet aux herbes', soir: 'Soupe de saison' },
    { midi: 'Wrap de légumes', soir: 'Poisson au four' },
    { midi: 'Taboulé frais', soir: 'Risotto aux champignons' },
    { midi: 'Omelette aux légumes', soir: 'Pizza maison légère' },
    { midi: 'Salade de lentilles', soir: 'Couscous végétal' }
  ],
  shopping: {
    frais: [
      ['Tomates cerises', false],
      ['Courgettes', false],
      ['Citron', false],
      ['Saumon frais', false]
    ],
    placard: [
      ['Pois chiches', false],
      ['Huile d’olive', false],
      ['Pâtes complètes', false]
    ]
  }
};

const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function icon(type) {
  const icons = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13"></path><path d="m13 6 6 6-6 6"></path></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M7 3v4M17 3v4M3 10h18"></path></svg>',
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 11.5h10.8l2-8H6"></path><circle cx="9" cy="19" r="1.2"></circle><circle cx="17" cy="19" r="1.2"></circle></svg>',
    chef: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10.5C3 10 3.2 6 6 6c.3-2.5 3.7-3 5-.9 1.5-2.2 5.1-1.3 5.3 1.3 2.8-.2 3.8 4.1.7 4.1H6Z"></path><path d="M7.5 11v4.5c0 2 2 3.5 4.5 3.5s4.5-1.5 4.5-3.5V11M12 19v2"></path></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.6c0 5-8.8 10.4-8.8 10.4S3.2 13.6 3.2 8.6c0-3 3.5-4.5 5.7-2.3L12 9.4l3.1-3.1c2.2-2.2 5.7-.7 5.7 2.3Z"></path></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4 10-10"></path></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M4.5 21c.8-4.2 3.4-6.3 7.5-6.3s6.7 2.1 7.5 6.3"></path></svg>',
    key: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.5" cy="15.5" r="3.5"></circle><path d="m11 13 8-8M15 5h4v4"></path></svg>'
  };
  return icons[type] || icons.arrow;
}

function miniPipo(className = '') {
  return `<img class="mini-pipo ${className}" src="${pipo}" alt="Pipo, le chef malin">`;
}

function pageHeader(eyebrow, title, text, action = '') {
  return `<section class="page-header">
    <div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${text}</p></div>
    ${action}
  </section>`;
}

function notify(message) {
  toastNode.textContent = message;
  toastNode.classList.add('is-visible');
  window.clearTimeout(notify.timeout);
  notify.timeout = window.setTimeout(() => toastNode.classList.remove('is-visible'), 2800);
}

function route() {
  return window.location.hash.replace('#', '') || 'accueil';
}

function go(to) {
  window.location.hash = to;
}

function updateNavigation() {
  const current = route().split('/')[0];
  document.querySelectorAll('[data-nav]').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.nav === current);
  });
}

function home() {
  return `
    <section class="home-hero">
      <div class="hero-copy">
        <p class="eyebrow">Votre cuisine, plus simple</p>
        <h1>Bonjour !<br><span>On cuisine quoi aujourd’hui ?</span></h1>
        <p class="hero-text">Des repas qui vous ressemblent, une semaine bien organisée et moins de gaspillage.</p>
        <button class="primary-button" data-route="recettes">Trouver une recette ${icon('arrow')}</button>
      </div>
      <div class="hero-pipo-wrap" aria-label="Pipo vous accueille">
        <div class="hero-orbit orbit-one"></div><div class="hero-orbit orbit-two"></div>
        ${miniPipo('hero-pipo')}
        <div class="pipo-tag">Pipo est prêt ! <span>👋</span></div>
      </div>
    </section>

    <section class="journey" aria-label="Les raccourcis principaux">
      <article class="journey-card recipes-card">
        <div class="card-icon">${icon('search')}</div>
        <div class="journey-pipo">${miniPipo('pipo-thumb thumbs-up')}</div>
        <p class="card-kicker">À votre goût</p><h2>Trouvez vos recettes</h2>
        <p>Choisissez une idée adaptée à vous, au catalogue ou à l’inspiration du chef.</p>
        <button class="text-button" data-route="recettes">Explorer ${icon('arrow')}</button>
      </article>
      <article class="journey-card calendar-card">
        <div class="card-icon">${icon('calendar')}</div>
        <div class="journey-pipo">${miniPipo('pipo-thumb planning')}</div>
        <p class="card-kicker">Tout est prêt</p><h2>Une semaine sereine</h2>
        <p>Un menu clair, jour par jour. Ajoutez ou modifiez seulement ce dont vous avez envie.</p>
        <button class="text-button" data-route="calendrier">Voir ma semaine ${icon('arrow')}</button>
      </article>
      <article class="journey-card shopping-card">
        <div class="card-icon">${icon('cart')}</div>
        <div class="journey-pipo">${miniPipo('pipo-thumb basket')}</div>
        <p class="card-kicker">Bien organisé</p><h2>Rien ne se perd</h2>
        <p>Votre liste est triée. Cochez les produits, Pipo garde le fil pour vous.</p>
        <button class="text-button" data-route="courses">Préparer mes courses ${icon('arrow')}</button>
      </article>
    </section>

    <section class="home-bottom">
      <div><p class="eyebrow">Cette semaine</p><h2>Vos prochains repas, en un regard</h2></div>
      <button class="outline-button" data-route="calendrier">Ouvrir le calendrier ${icon('arrow')}</button>
    </section>
    <section class="quick-week">
      ${days.slice(0, 4).map((day, index) => `<button class="quick-day ${index === 0 ? 'selected' : ''}" data-route="calendrier"><span>${day}</span><strong>${state.meals[index].midi}</strong><small>${state.meals[index].soir}</small></button>`).join('')}
    </section>`;
}

function recipeChoices() {
  return `
    ${pageHeader('Recettes', 'Trois façons de trouver votre prochain repas', 'Choisissez simplement ce qui vous convient aujourd’hui.', `<div class="header-pipo">${miniPipo('header-pipo')}</div>`)}
    <section class="recipe-choice-grid">
      <article class="recipe-choice personalized">
        <div class="software-visual person-visual"><span class="visual-dot one"></span><span class="visual-dot two"></span><div class="person-head"></div><div class="person-body"></div><span class="visual-check">${icon('check')}</span></div>
        <div><p class="choice-number">01</p><h2>Recettes personnalisées</h2><p>Des idées adaptées à votre profil et à votre repère calorique.</p></div>
        <button class="primary-button compact" data-action="open-recipe" data-kind="personal">Découvrir ${icon('arrow')}</button>
      </article>
      <article class="recipe-choice basket-choice">
        <div class="software-visual basket-visual"><div class="basket-handle"></div><div class="basket-body"><i></i><i></i><i></i></div><span class="lemon">●</span><span class="leaf">◆</span></div>
        <div><p class="choice-number">02</p><h2>Panier bleu</h2><p>Exclusivement les recettes méditerranéennes du catalogue.</p></div>
        <button class="primary-button compact" data-action="open-recipe" data-kind="basket">Voir le catalogue ${icon('arrow')}</button>
      </article>
      <article class="recipe-choice chef-choice">
        <div class="software-visual chef-visual">${miniPipo('choice-pipo')}<div class="serving-tray"><span></span></div></div>
        <div><p class="choice-number">03</p><h2>Recettes du chef</h2><p>Laissez Pipo vous surprendre avec une recette au hasard.</p></div>
        <button class="primary-button compact" data-action="open-recipe" data-kind="chef">Surprenez-moi ${icon('arrow')}</button>
      </article>
    </section>
    <p class="helper-note">Vous pourrez toujours modifier votre choix ou enregistrer une recette pour plus tard.</p>`;
}

function recipeList(kind) {
  const content = {
    personal: { eyebrow: 'Pour vous', title: 'Des recettes qui collent à votre rythme', intro: 'Sélectionnées selon vos préférences, sans jargon et faciles à ajuster.', recipes: [['Poulet citron & légumes', '30 min · 560 kcal'], ['Pâtes crémeuses aux courgettes', '25 min · 510 kcal'], ['Bowl méditerranéen au quinoa', '20 min · 480 kcal']] },
    basket: { eyebrow: 'Panier bleu', title: 'Le goût de la Méditerranée', intro: 'Des recettes du catalogue, simples et généreuses.', recipes: [['Poisson au four, tomate & olives', '35 min · 520 kcal'], ['Salade grecque complète', '15 min · 430 kcal'], ['Aubergines farcies au boulgour', '40 min · 490 kcal']] },
    chef: { eyebrow: 'L’idée de Pipo', title: 'Pipo a choisi pour vous', intro: 'Une seule proposition, claire et prête à cuisiner.', recipes: [['Orzo aux légumes grillés', '25 min · 465 kcal']] }
  }[kind] || null;
  if (!content) return recipeChoices();
  return `${pageHeader(content.eyebrow, content.title, content.intro, kind === 'chef' ? `<div class="header-pipo"><div class="small-bubble">Une bonne idée !</div>${miniPipo('header-pipo')}</div>` : '')}
    <section class="recipe-list ${kind === 'chef' ? 'single-recipe' : ''}">
      ${content.recipes.map(([title, meta], index) => `<article class="recipe-list-card">
        <div class="food-illustration food-${(index % 3) + 1}"><span></span><i></i><b></b></div>
        <div><p class="recipe-meta">${meta}</p><h2>${title}</h2><p>Un repas savoureux, facile à préparer avec des ingrédients accessibles.</p><button class="text-button" data-route="recette/${encodeURIComponent(title)}">Voir la recette ${icon('arrow')}</button></div>
      </article>`).join('')}
    </section>
    <div class="bottom-cta"><button class="outline-button" data-route="recettes">${icon('arrow')} Voir les recettes</button></div>`;
}

function recipeDetail(name) {
  const title = decodeURIComponent(name || 'Orzo aux légumes grillés');
  return `${pageHeader('La recette', title, 'Un repas facile à suivre, étape par étape, sans surcharge.', `<button class="outline-button" data-route="recettes">${icon('arrow')} Toutes les recettes</button>`)}
    <section class="recipe-detail">
      <div class="detail-visual food-2"><span></span><i></i><b></b></div>
      <div class="detail-copy"><div class="recipe-stats"><span>25 min</span><span>2 personnes</span><span>≈ 465 kcal</span></div><h2>Il vous faut</h2><ul><li>Des légumes de saison</li><li>Une base céréalière</li><li>Huile d’olive, citron et herbes</li></ul><h2>En quelques gestes</h2><ol><li>Préparez les légumes et lancez la cuisson.</li><li>Ajoutez la base puis assaisonnez.</li><li>Servez chaud, avec quelques herbes fraîches.</li></ol><button class="primary-button" data-action="meal-to-list">Ajouter à ma liste ${icon('cart')}</button></div>
    </section>`;
}

function calendar() {
  const meal = state.meals[state.selectedDay];
  return `${pageHeader('Mon calendrier', 'Votre semaine, tout simplement', 'Choisissez un jour, regardez les deux repas, et ajustez seulement si besoin.', `<button class="outline-button" data-action="auto-week">${icon('chef')} Me proposer une semaine</button>`)}
    <section class="explain-strip"><div><span>1</span><strong>Choisissez un jour</strong><p>Un seul clic sur la semaine.</p></div><div><span>2</span><strong>Regardez vos repas</strong><p>Midi et soir sont regroupés.</p></div><div><span>3</span><strong>Modifiez si besoin</strong><p>Une recette vous plaît moins ? Changez-la.</p></div></section>
    <section class="calendar-panel">
      <div class="days-row">${days.map((day, index) => `<button class="day-tab ${state.selectedDay === index ? 'is-selected' : ''}" data-day="${index}"><span>${day}</span><strong>${18 + index}</strong></button>`).join('')}</div>
      <div class="today-summary"><div><p class="eyebrow">${days[state.selectedDay]}  ${18 + state.selectedDay} août</p><h2>Voici votre menu</h2></div>${miniPipo('calendar-pipo')}</div>
      <div class="meal-slots">
        <article class="meal-slot"><div class="meal-icon">☀</div><div><p>Déjeuner</p><h3>${meal.midi}</h3><small>Simple, frais et prêt sans stress.</small></div><button aria-label="Modifier le déjeuner" data-action="meal-to-list">${icon('plus')}</button></article>
        <article class="meal-slot"><div class="meal-icon">☾</div><div><p>Dîner</p><h3>${meal.soir}</h3><small>Une assiette équilibrée pour finir la journée.</small></div><button aria-label="Modifier le dîner" data-action="meal-to-list">${icon('plus')}</button></article>
      </div>
      <div class="calendar-footer"><p>${icon('cart')} Les ingrédients des deux repas peuvent être ajoutés à votre liste.</p><button class="primary-button compact" data-route="courses">Voir ma liste ${icon('arrow')}</button></div>
    </section>`;
}

function shoppingRows(group, label) {
  return `<section class="shopping-group"><div class="shopping-group-title"><h2>${label}</h2><span>${state.shopping[group].filter(([, done]) => !done).length} restant${state.shopping[group].filter(([, done]) => !done).length > 1 ? 's' : ''}</span></div>
    <div class="shopping-items">${state.shopping[group].map(([item, done], index) => `<label class="shopping-item ${done ? 'is-done' : ''}"><input type="checkbox" data-shopping="${group}:${index}" ${done ? 'checked' : ''}><span class="fake-check">${icon('check')}</span><span>${item}</span></label>`).join('')}</div>
    <form class="add-item" data-add-group="${group}"><input aria-label="Ajouter un article à ${label}" name="item" placeholder="Ajouter un produit"><button aria-label="Ajouter">${icon('plus')}</button></form></section>`;
}

function shopping() {
  const total = Object.values(state.shopping).flat().length;
  const done = Object.values(state.shopping).flat().filter(([, checked]) => checked).length;
  return `${pageHeader('Ma liste de courses', 'Les bonnes choses, dans le bon ordre', 'Cochez au fur et à mesure. Votre liste reste claire, même au supermarché.', `<div class="header-pipo shopping-pipo">${miniPipo('header-pipo')}</div>`)}
    <section class="shopping-overview"><div class="progress-copy"><p class="eyebrow">Votre avancée</p><strong>${done} / ${total}</strong><span>produits cochés</span></div><div class="progress-bar"><span style="width:${total ? (done / total) * 100 : 0}%"></span></div><button class="outline-button" data-action="clean-list">${icon('check')} Retirer les produits cochés</button></section>
    <section class="shopping-layout">${shoppingRows('frais', 'Frais & marché')}${shoppingRows('placard', 'Placard')}</section>
    <section class="leftover-banner"><div>${miniPipo('leftover-pipo')}</div><div><p class="eyebrow">Petite idée anti-gaspi</p><h2>Il vous reste quelques légumes ?</h2><p>Pipo peut vous proposer une recette à partir de ce que vous avez déjà.</p></div><button class="primary-button compact" data-action="leftover-idea">Trouver une idée ${icon('arrow')}</button></section>`;
}

function leftovers() {
  return `${pageHeader('Rien ne se perd', 'Cuisiner avec ce qu’il vous reste', 'Indiquez quelques ingrédients et Pipo vous proposera une idée simple.', `<div class="header-pipo">${miniPipo('header-pipo')}</div>`)}
    <section class="leftovers-panel"><div class="leftovers-intro"><div class="ingredient-orbs"><span>🍅</span><span>🥕</span><span>🧅</span></div><h2>Qu’avez-vous sous la main ?</h2><p>Par exemple : tomates, riz, courgettes…</p><div class="ingredient-input"><input id="leftover-input" placeholder="Ajouter un ingrédient"><button data-action="leftover-idea">${icon('arrow')}</button></div></div><div class="pipo-idea">${miniPipo('idea-pipo')}<div><p class="eyebrow">L’idée de Pipo</p><h3>Une poêlée colorée avec une touche de citron</h3><p>Une base simple, adaptable à vos ingrédients.</p><button class="text-button" data-route="recette/Poêlée méditerranéenne">Voir la recette ${icon('arrow')}</button></div></div></section>`;
}

function apiPage() {
  const savedEndpoint = sessionStorage.getItem('chefmalin-api-endpoint') || '';
  return `${pageHeader('Connexion', 'Rentrer l’adresse de l’API', 'Cette connexion permettra à ChefMalin de communiquer avec votre autre site lorsque son adresse sera disponible.', `<div class="header-pipo">${miniPipo('header-pipo')}</div>`)}
    <section class="api-layout"><article class="api-card"><div class="api-icon">${icon('key')}</div><h2>Connecter les deux sites</h2><p>Indiquez l’adresse publique de l’API de votre deuxième site. Exemple : <code>https://api.monsite.fr</code></p><form id="api-form"><label for="api-endpoint">Adresse de l’API</label><input id="api-endpoint" name="endpoint" type="url" value="${savedEndpoint}" placeholder="https://api.votresite.fr" autocomplete="url" required><button class="primary-button" type="submit">Enregistrer l’adresse ${icon('check')}</button></form></article>
    <aside class="api-safety"><span>${icon('heart')}</span><h2>Vos clés restent privées</h2><p>Ne collez pas de clé secrète ou de mot de passe ici. Une vraie clé API doit être conservée côté serveur, jamais dans une page HTML.</p><p class="small">Pour terminer la connexion, il faudra l’adresse exacte de l’API, la méthode de connexion attendue et l’autorisation de votre deuxième site.</p></aside></section>`;
}

function profile() {
  return `${pageHeader('Mon profil', 'Votre espace personnel', 'Vos préférences permettent à ChefMalin de vous proposer des idées plus pertinentes.', `<div class="header-pipo">${miniPipo('header-pipo')}</div>`)}
    <section class="profile-grid"><article class="profile-card"><div class="profile-avatar">${icon('user')}</div><h2>Mes préférences</h2><p>Méditerranéen · Repas simples · 2 personnes</p><button class="text-button" data-action="profile">Modifier ${icon('arrow')}</button></article><article class="profile-card"><div class="profile-avatar">${icon('heart')}</div><h2>Mes favoris</h2><p>Gardez les recettes que vous avez envie de refaire.</p><button class="text-button" data-route="recettes">Voir les recettes ${icon('arrow')}</button></article><article class="profile-card api-shortcut"><div class="profile-avatar">${icon('key')}</div><h2>Connexion API</h2><p>Reliez ChefMalin à votre autre site de façon sûre.</p><button class="text-button" data-route="api">Rentrer l’API ${icon('arrow')}</button></article></section>`;
}

function render() {
  const current = route();
  let content = '';
  if (current === 'accueil') content = home();
  else if (current === 'recettes') content = recipeChoices();
  else if (current.startsWith('recettes/')) content = recipeList(current.split('/')[1]);
  else if (current.startsWith('recette/')) content = recipeDetail(current.slice('recette/'.length));
  else if (current === 'calendrier') content = calendar();
  else if (current === 'courses') content = shopping();
  else if (current === 'restes') content = leftovers();
  else if (current === 'api') content = apiPage();
  else if (current === 'profil') content = profile();
  else content = home();
  app.innerHTML = content;
  updateNavigation();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', (event) => {
  const routeButton = event.target.closest('[data-route]');
  if (routeButton) { go(routeButton.dataset.route); return; }
  const day = event.target.closest('[data-day]');
  if (day) { state.selectedDay = Number(day.dataset.day); render(); return; }
  const action = event.target.closest('[data-action]');
  if (!action) return;
  if (action.dataset.action === 'open-recipe') { go(`recettes/${action.dataset.kind}`); }
  if (action.dataset.action === 'meal-to-list') { notify('Les ingrédients ont été ajoutés à votre liste.'); }
  if (action.dataset.action === 'auto-week') { notify('Pipo prépare une semaine simple à ajuster.'); }
  if (action.dataset.action === 'clean-list') {
    Object.keys(state.shopping).forEach((group) => { state.shopping[group] = state.shopping[group].filter(([, done]) => !done); });
    notify('Les produits cochés ont été retirés.'); render();
  }
  if (action.dataset.action === 'leftover-idea') { go('restes'); }
  if (action.dataset.action === 'profile') { notify('Les réglages du profil seront bientôt disponibles.'); }
});

document.addEventListener('change', (event) => {
  if (!event.target.matches('[data-shopping]')) return;
  const [group, index] = event.target.dataset.shopping.split(':');
  state.shopping[group][Number(index)][1] = event.target.checked;
  render();
});

document.addEventListener('submit', (event) => {
  const groupForm = event.target.closest('[data-add-group]');
  if (groupForm) {
    event.preventDefault();
    const input = groupForm.elements.item;
    const item = input.value.trim();
    if (!item) return;
    state.shopping[groupForm.dataset.addGroup].push([item, false]);
    notify(`${item} a été ajouté à votre liste.`); render();
  }
  if (event.target.id === 'api-form') {
    event.preventDefault();
    const input = event.target.elements.endpoint;
    try {
      const address = new URL(input.value.trim());
      if (!['http:', 'https:'].includes(address.protocol)) throw new Error('Protocol');
      sessionStorage.setItem('chefmalin-api-endpoint', address.origin + address.pathname.replace(/\/$/, ''));
      notify('Adresse de l’API enregistrée pour cette session.');
    } catch {
      notify('Ajoutez une adresse API complète, qui commence par https://');
    }
  }
});

window.addEventListener('hashchange', render);
render();

