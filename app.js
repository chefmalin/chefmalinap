const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const pipoAsset = 'assets/pipo-thumbs-up-small.png';

const state = {
  day: 0,
  meals: [
    { lunch: 'Poulet citron & légumes rôtis', dinner: 'Pâtes au pesto de courgette' },
    { lunch: 'Bowl méditerranéen au quinoa', dinner: 'Saumon, tomate et olives' },
    { lunch: 'Salade grecque complète', dinner: 'Risotto aux champignons' },
    { lunch: 'Wrap de légumes grillés', dinner: 'Soupe douce et tartines' },
    { lunch: 'Taboulé frais aux herbes', dinner: 'Poisson au four, citron' },
    { lunch: 'Omelette aux légumes', dinner: 'Pizza fine maison' },
    { lunch: 'Salade de lentilles', dinner: 'Couscous végétal' }
  ],
  shopping: {
    frais: [['Tomates cerises', false], ['Courgettes', false], ['Citrons', true], ['Saumon frais', false]],
    placard: [['Huile d’olive', true], ['Pâtes complètes', false], ['Pois chiches', false], ['Herbes de Provence', false]]
  }
};

const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const recipeOptions = [
  'Poulet citron & légumes rôtis', 'Bowl méditerranéen au quinoa', 'Salade grecque complète',
  'Pâtes au pesto de courgette', 'Saumon, tomate et olives', 'Risotto aux champignons',
  'Wrap de légumes grillés', 'Poisson au four, citron'
];
const recipes = {
  personnalise: [
    ['Poulet citron & légumes rôtis', '30 min · 560 kcal', 'Un plat chaleureux, prêt sans complication.'],
    ['Bowl méditerranéen au quinoa', '20 min · 485 kcal', 'Frais, coloré et facile à adapter.'],
    ['Pâtes au pesto de courgette', '25 min · 515 kcal', 'Une recette simple pour les soirs pressés.']
  ],
  panier: [
    ['Saumon, tomate et olives', '35 min · 520 kcal', 'Le soleil de la Méditerranée dans votre assiette.'],
    ['Salade grecque complète', '15 min · 430 kcal', 'Croquante, généreuse et pleine de fraîcheur.'],
    ['Aubergines farcies au boulgour', '40 min · 490 kcal', 'Une recette végétale qui a du caractère.']
  ],
  chef: [['Orzo crémeux aux légumes grillés', '25 min · 465 kcal', 'La suggestion du jour de Pipo, tout simplement.']]
};

function svg(name) {
  const icons = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6"></circle><path d="m15.3 15.3 4.5 4.5"></path></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13"></path><path d="m13 6 6 6-6 6"></path></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"></rect><path d="M7.5 3v4M16.5 3v4M3.5 10h17"></path></svg>',
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 11h10.8l2-8H6"></path><circle cx="9" cy="19" r="1.25"></circle><circle cx="17" cy="19" r="1.25"></circle></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M4.5 21c.8-4.2 3.4-6.2 7.5-6.2s6.7 2 7.5 6.2"></path></svg>',
    chef: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10.5C3 10 3.2 6 6 6c.4-2.6 3.9-2.9 5-.8 1.4-2.2 5.1-1.4 5.3 1.2 2.8-.2 3.8 4.1.7 4.1H6Z"></path><path d="M7.5 11v4.5c0 2 2 3.5 4.5 3.5s4.5-1.5 4.5-3.5V11M12 19v2"></path></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4 10-10"></path></svg>',
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"></path><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"></path></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg>'
  };
  return icons[name] || icons.arrow;
}

function pipoMini(emoji = '👋') {
  return `<span class="mini-pipo"><img src="${pipoAsset}" alt="Pipo, le chef malin"><b>${emoji}</b></span>`;
}

function pageHeader(eyebrow, title, subtitle, action = '') {
  return `<header class="page-header"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="subtitle">${subtitle}</p></div>${action}</header>`;
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function currentRoute() { return decodeURIComponent(location.hash.slice(1) || 'accueil'); }
function go(route) { location.hash = route; }

function home() {
  return `<article class="page">
    <section class="home-hero">
      <div class="hero-copy"><p class="eyebrow">Votre assistant repas</p><h1>Une semaine<br>qui vous ressemble.</h1><p class="subtitle">Des repas personnalisés, un menu clair et des courses qui se font sans y penser.</p><button class="hero-button" data-route="recettes"><span class="round-icon">${svg('search')}</span> Choisir mon prochain repas <span class="arrow">→</span></button></div>
      <div class="hero-pipo"><span class="pipo-chip">👍</span><img src="${pipoAsset}" alt="Pipo vous accompagne"></div>
    </section>
    <section class="journey"><div class="journey-heading"><div><p class="eyebrow">Un seul endroit, trois repères</p><h2>Ce qui simplifie votre semaine</h2></div><a class="text-link" href="#calendrier">Voir mon menu →</a></div>
      <div class="journey-grid">
        <a class="journey-card" href="#recettes" style="--card-soft:#e7f0d1">${pipoMini('✨')}<p class="eyebrow">À votre goût</p><h3>Trouvez vos recettes</h3><p>Des idées adaptées, sans perdre de temps à chercher.</p><span class="card-go">Découvrir <b>→</b></span><span class="card-arrow">→</span></a>
        <a class="journey-card week-card" href="#calendrier">${pipoMini('🗓')}<p class="eyebrow">Tout est prêt</p><h3>Une semaine sereine</h3><p>Vos déjeuners et dîners sont lisibles en un coup d’œil.</p><span class="card-go">Organiser <b>→</b></span><span class="card-arrow">→</span></a>
        <a class="journey-card waste-card" href="#courses">${pipoMini('🛒')}<p class="eyebrow">Bien organisé</p><h3>Rien ne se perd</h3><p>Une liste vivante, triée et facile à cocher en magasin.</p><span class="card-go">Préparer <b>→</b></span><span class="card-arrow">→</span></a>
      </div>
    </section>
    <section class="ideas-section"><p class="eyebrow">À cuisiner bientôt</p><h2>De belles idées, sans surcharge</h2><div class="recipe-strip"><a class="recipe-peek" href="#recette/Poulet%20citron%20et%20l%C3%A9gumes">Poulet citron & légumes</a><a class="recipe-peek" href="#recette/Salade%20grecque%20compl%C3%A8te">Salade grecque complète</a><a class="recipe-peek" href="#recette/Orzo%20cr%C3%A9meux">Orzo aux légumes grillés</a></div></section>
  </article>`;
}

function choices() {
  return `<article class="page">${pageHeader('Recettes', 'Quelle envie avez-vous aujourd’hui ?', 'Trois chemins simples pour trouver un repas qui vous convient.')}
    <section class="choice-grid">
      <article class="choice-card"><div class="choice-visual"><div class="person-visual"><i>✓</i></div></div><div class="choice-copy"><p class="eyebrow">01 · Pour vous</p><h2>Recettes personnalisées</h2><p>Des idées adaptées à votre profil et à votre repère calorique.</p><button class="btn" data-route="recettes/personnalise">Découvrir ${svg('arrow')}</button></div></article>
      <article class="choice-card"><div class="choice-visual"><div class="basket-visual"></div></div><div class="choice-copy"><p class="eyebrow">02 · Le catalogue</p><h2>Panier bleu</h2><p>Exclusivement les recettes méditerranéennes du catalogue.</p><button class="btn" data-route="recettes/panier">Voir le catalogue ${svg('arrow')}</button></div></article>
      <article class="choice-card"><div class="choice-visual"><div class="chef-visual"><img src="${pipoAsset}" alt="Pipo avec son plateau"></div></div><div class="choice-copy"><p class="eyebrow">03 · L’inspiration</p><h2>Recettes du chef</h2><p>Laissez Pipo vous surprendre avec une recette au hasard.</p><button class="btn" data-route="recettes/chef">Me surprendre ${svg('arrow')}</button></div></article>
    </section>
  </article>`;
}

function recipeList(type) {
  const content = recipes[type] || recipes.personnalise;
  const labels = {personnalise:['Pour vous','Des recettes dans votre rythme','Préférences, temps et repère calorique : tout est déjà pris en compte.'], panier:['Panier bleu','La Méditerranée dans votre cuisine','Un catalogue clair de recettes fraîches et généreuses.'], chef:['L’idée de Pipo','Une bonne idée, tout de suite','Pipo ne vous propose qu’une seule recette, pour ne pas vous perdre.']}[type] || [];
  return `<article class="page">${pageHeader(labels[0],labels[1],labels[2],'<a class="btn btn-light" href="#recettes">Changer de parcours</a>')}
    <section class="content-grid"><div class="recipe-grid">${content.map((recipe, index) => `<article class="recipe-card ${type === 'chef' ? 'generated-card' : ''}"><div class="recipe-mark"></div><span class="badge">${recipe[1]}</span><h3>${recipe[0]}</h3><p>${recipe[2]}</p><button class="btn btn-small" data-route="recette/${encodeURIComponent(recipe[0])}">Voir la recette ${svg('arrow')}</button>${type === 'chef' ? `<div class="generated-pipo"><img src="${pipoAsset}" alt="Pipo vous propose cette recette"></div>` : ''}</article>`).join('')}</div>
      <aside class="side-note"><p><strong>Simple et sans pression.</strong><br>Gardez une recette, passez à la suivante ou ajoutez-la directement à votre menu.</p>${pipoMini('👌')}</aside>
    </section>
  </article>`;
}

function recipeDetail(name) {
  return `<article class="page">${pageHeader('La recette', name, 'Une recette facile à suivre, avec uniquement les informations utiles.', '<a class="btn btn-light" href="#recettes">Voir les recettes</a>')}
    <section class="content-grid"><article class="recipe-card"><div class="recipe-mark" style="height:170px"></div><span class="badge">25 min · 2 personnes · ≈ 465 kcal</span><h2>Les ingrédients</h2><p>Une base céréalière, des légumes de saison, une touche de citron, des herbes et de l’huile d’olive.</p><h2>La préparation</h2><p>1. Préparez et cuisez les légumes.<br>2. Ajoutez la base et assaisonnez.<br>3. Servez aussitôt avec quelques herbes fraîches.</p></article>
      <aside class="side-note"><p><strong>Pipo a pensé à tout.</strong><br>Ajoutez les ingrédients manquants à votre liste en une seule fois.</p>${pipoMini('🛒')}<button class="btn" style="width:100%;margin-top:16px" data-action="add-recipe">Ajouter à ma liste</button></aside>
    </section>
  </article>`;
}

function calendar() {
  const meal = state.meals[state.day];
  const select = (slot, value) => `<select data-meal="${slot}" aria-label="Choisir le ${slot === 'lunch' ? 'déjeuner' : 'dîner'}">${recipeOptions.map((option) => `<option ${option === value ? 'selected' : ''}>${option}</option>`).join('')}</select>`;
  return `<article class="page">${pageHeader('Mon calendrier', 'Votre semaine, sans casse-tête', 'Choisissez un jour. Regardez vos deux repas. Ajustez seulement si vous le souhaitez.', `<button class="btn btn-light" data-action="fill-week">${svg('spark')} Me proposer une semaine</button>`)}
    <section class="explain-strip"><div class="explain-step"><span class="step-number">1</span><span><strong>Choisissez un jour</strong><br>La semaine est juste ici.</span></div><div class="explain-step"><span class="step-number">2</span><span><strong>Regardez vos deux repas</strong><br>Midi et soir, rien de plus.</span></div><div class="explain-step"><span class="step-number">3</span><span><strong>Ajustez si besoin</strong><br>Vous gardez toujours la main.</span></div></section>
    <section class="calendar-layout"><aside class="day-tabs">${days.map((day, index) => `<button class="day-tab ${state.day === index ? 'active' : ''}" data-day="${index}"><span>${day}</span><small>${18 + index} août</small></button>`).join('')}</aside><div class="day-panel"><div class="day-panel-top"><div><p class="eyebrow">${days[state.day]}  ${18 + state.day} août</p><h2>Votre menu du jour</h2></div>${pipoMini('✓')}</div><div class="meal-slots"><div class="meal-slot"><strong>☀ Déjeuner</strong>${select('lunch', meal.lunch)}<button data-action="add-recipe">${svg('cart')} Ajouter</button></div><div class="meal-slot"><strong>☾ Dîner</strong>${select('dinner', meal.dinner)}<button data-action="add-recipe">${svg('cart')} Ajouter</button></div></div><p class="subtitle" style="margin:18px 0 0">Les ingrédients des deux repas peuvent rejoindre votre liste de courses en un clic.</p></div></section>
  </article>`;
}

function shoppingItems(group) {
  return state.shopping[group].map(([label, checked], index) => `<label class="check-item"><input type="checkbox" data-check="${group}:${index}" ${checked ? 'checked' : ''}><span class="fake-check"></span><span>${label}</span></label>`).join('');
}

function shopping() {
  const items = Object.values(state.shopping).flat();
  const checked = items.filter(([, value]) => value).length;
  return `<article class="page">${pageHeader('Ma liste de courses', 'Vos courses, déjà organisées', 'Cochez simplement au fur et à mesure. Pipo garde le fil, même au magasin.', '<button class="btn btn-light" data-action="clear-checked">Retirer les cochés</button>')}
    <section class="shopping-summary"><div class="summary-pill"><strong>${items.length}</strong><span>produits au total</span></div><div class="summary-pill"><strong>${checked}</strong><span>déjà cochés</span></div><div class="summary-pill"><strong>${items.length - checked}</strong><span>encore à trouver</span></div></section>
    <section class="shopping-board"><section class="shopping-group"><h3>Frais & marché <span>${state.shopping.frais.length} produits</span></h3>${shoppingItems('frais')}<form class="add-item" data-group="frais"><input name="item" placeholder="Ajouter un produit" aria-label="Ajouter un produit frais"><button aria-label="Ajouter">+</button></form></section><section class="shopping-group"><h3>Placard <span>${state.shopping.placard.length} produits</span></h3>${shoppingItems('placard')}<form class="add-item" data-group="placard"><input name="item" placeholder="Ajouter un produit" aria-label="Ajouter un produit au placard"><button aria-label="Ajouter">+</button></form></section></section>
  </article>`;
}

function api() {
  const endpoint = sessionStorage.getItem('chefmalin-api') || '';
  return `<article class="page">${pageHeader('Connexion', 'Relier ChefMalin à votre autre site', 'Ajoutez l’adresse de son API lorsque vous l’aurez. La connexion restera contrôlée et sécurisée.')}
    <section class="api-card"><div><p class="eyebrow">Connexion technique</p><h2>Rentrer l’adresse de l’API</h2><p>ChefMalin utilisera cette adresse pour dialoguer avec votre deuxième site, lorsque son API sera prête.</p><div class="api-next"><strong>Avant de connecter :</strong> il faudra l’adresse exacte de l’API et savoir quelles données les deux sites peuvent échanger.</div></div><form class="api-form" id="api-form"><label class="field-label">Adresse de l’API<input type="url" name="endpoint" value="${endpoint}" placeholder="https://api.votresite.fr" required></label><button class="btn" type="submit">Enregistrer l’adresse ${svg('check')}</button><p class="secure-note">${svg('lock')}<span><b>Pas de clé privée ici.</b><br>Une clé secrète doit être conservée côté serveur, jamais dans une page HTML.</span></p><p class="api-status">${endpoint ? 'Adresse enregistrée pour cette session.' : 'Aucune API n’est encore reliée.'}</p></form></section>
  </article>`;
}

function profile() {
  return `<article class="page">${pageHeader('Mon profil', 'Votre cuisine, à votre image', 'Ces repères permettent à ChefMalin de garder ses suggestions pertinentes.')}
    <section class="profile-layout"><article class="profile-card"><div class="profile-figure"><img src="${pipoAsset}" alt="Pipo, votre chef malin"></div><p class="eyebrow">Votre assistant</p><h2>Pipo vous accompagne</h2><p class="subtitle">Une organisation plus légère, sans vous imposer une façon de manger.</p><div class="stats"><div class="stat"><strong>7</strong><span>menus prévus</span></div><div class="stat"><strong>8</strong><span>produits listés</span></div><div class="stat"><strong>3</strong><span>favoris</span></div></div></article><article class="profile-card"><p class="eyebrow">Vos repères</p><h2>Préférences culinaires</h2><div class="preferences"><div class="pref-row"><strong>Style de cuisine</strong><span>Méditerranéen</span></div><div class="pref-row"><strong>Temps préféré</strong><span>Moins de 30 minutes</span></div><div class="pref-row"><strong>Foyer</strong><span>2 personnes</span></div><div class="pref-row"><strong>Objectif</strong><span>Manger varié, simplement</span></div></div><a class="btn" href="#recettes">Trouver des recettes ${svg('arrow')}</a></article></section>
  </article>`;
}

function updateNavigation(route) {
  const section = route.split('/')[0] === 'recette' ? 'recettes' : route.split('/')[0];
  document.querySelectorAll('.top-nav a, .mobile-nav a').forEach((link) => {
    const target = link.getAttribute('href').slice(1);
    link.classList.toggle('active', target === section);
  });
}

function render() {
  const route = currentRoute();
  let html;
  if (route === 'accueil') html = home();
  else if (route === 'recettes') html = choices();
  else if (route.startsWith('recettes/')) html = recipeList(route.split('/')[1]);
  else if (route.startsWith('recette/')) html = recipeDetail(route.slice(8));
  else if (route === 'calendrier') html = calendar();
  else if (route === 'courses') html = shopping();
  else if (route === 'api') html = api();
  else if (route === 'profil') html = profile();
  else html = home();
  app.innerHTML = html;
  updateNavigation(route);
  app.focus({ preventScroll: true });
}

document.addEventListener('click', (event) => {
  const routeButton = event.target.closest('[data-route]');
  if (routeButton) { go(routeButton.dataset.route); return; }
  const day = event.target.closest('[data-day]');
  if (day) { state.day = Number(day.dataset.day); render(); return; }
  const action = event.target.closest('[data-action]');
  if (!action) return;
  if (action.dataset.action === 'add-recipe') { notify('Les ingrédients utiles ont été ajoutés à votre liste.'); }
  if (action.dataset.action === 'fill-week') { notify('Pipo a préparé une semaine équilibrée, à ajuster librement.'); }
  if (action.dataset.action === 'clear-checked') {
    Object.keys(state.shopping).forEach((group) => { state.shopping[group] = state.shopping[group].filter(([, checked]) => !checked); });
    notify('Les produits cochés ont été retirés.'); render();
  }
});

document.addEventListener('change', (event) => {
  if (event.target.matches('[data-check]')) {
    const [group, index] = event.target.dataset.check.split(':');
    state.shopping[group][Number(index)][1] = event.target.checked;
    render();
  }
  if (event.target.matches('[data-meal]')) {
    state.meals[state.day][event.target.dataset.meal] = event.target.value;
    notify('Votre menu est mis à jour.');
  }
});

document.addEventListener('submit', (event) => {
  if (event.target.matches('[data-group]')) {
    event.preventDefault();
    const input = event.target.elements.item;
    const value = input.value.trim();
    if (!value) return;
    state.shopping[event.target.dataset.group].push([value, false]);
    notify(`${value} a été ajouté à votre liste.`); render();
  }
  if (event.target.id === 'api-form') {
    event.preventDefault();
    const field = event.target.elements.endpoint;
    try {
      const url = new URL(field.value.trim());
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      sessionStorage.setItem('chefmalin-api', url.toString().replace(/\/$/, ''));
      notify('Adresse de l’API enregistrée pour cette session.'); render();
    } catch { notify('Ajoutez une adresse complète qui commence par https://'); }
  }
});

window.addEventListener('hashchange', () => { render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
render();

