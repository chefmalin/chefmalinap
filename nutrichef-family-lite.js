/* Profil famille : plusieurs personnes, un même calendrier et des recettes adaptées au profil choisi. */
(() => {
  const STORAGE_KEY = 'nutrichef-v3';
  let mode = 'overview';
  const copy = value => JSON.parse(JSON.stringify(value));
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `member-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const labelGoal = value => value === 'perdre' ? 'Perdre du poids' : value === 'prendre' ? 'Prendre du poids' : 'Maintenir son poids';

  function getState() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return value && typeof value === 'object' ? value : {profile:null,weights:[],menus:{},shopping:[]};
    } catch { return {profile:null,weights:[],menus:{},shopping:[]}; }
  }
  function putState(value) { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); }
  function household(state) { return state.family && Array.isArray(state.family.members) ? state.family : null; }
  function activeMember(state) { const home = household(state); return home?.members.find(member => member.id === state.activeFamilyMemberId) || null; }

  function addFamilyLink() {
    const nav = document.querySelector('.top nav');
    if (!nav || nav.querySelector('.family-link')) return;
    const link = document.createElement('a');
    link.className = 'family-link';
    link.href = '#famille';
    link.textContent = 'Profil famille';
    nav.appendChild(link);
  }

  function memberCard(member, state) {
    const isActive = member.id === state.activeFamilyMemberId;
    const p = member.profile;
    const role = member.role === 'child' ? 'Enfant' : 'Adulte';
    const note = member.role === 'child'
      ? 'Menus et préférences pris en compte. Repère calorique à définir avec un professionnel.'
      : `${p.age} ans · ${escapeHtml(p.diet || 'Omnivore')} · ${labelGoal(p.goal)}`;
    return `<article class="family-member ${isActive ? 'is-active' : ''}">
      <span class="family-role">${role}${isActive ? ' · profil actif' : ''}</span>
      <h3>${escapeHtml(p.firstName || 'Sans prénom')}</h3>
      <p>${note}</p>
      <div class="family-member-actions">
        <button type="button" data-action="family-activate" data-member-id="${member.id}" ${isActive ? 'disabled' : ''}>${isActive ? 'Profil utilisé' : 'Utiliser ce profil'}</button>
        <button type="button" class="family-ghost" data-action="family-edit" data-member-id="${member.id}">Modifier</button>
        <button type="button" class="family-remove" data-action="family-remove" data-member-id="${member.id}">Retirer</button>
      </div>
    </article>`;
  }

  function memberForm(member) {
    const p = member?.profile || {firstName:'',sex:'femme',age:'',weight:'',height:'',activity:'1.375',diet:'Omnivore',goal:'maintenir'};
    const role = member?.role || 'adult';
    const isEditing = Boolean(member);
    return `<section class="family-card section-gap">
      <h2>${isEditing ? `Modifier ${escapeHtml(p.firstName)}` : 'Ajouter un profil'}</h2>
      <p class="family-help">Chaque personne possède ses préférences. Les menus et les recettes se règlent ensuite selon le profil choisi.</p>
      <form id="family-member-form" class="family-form" data-member-id="${member?.id || ''}">
        <label>Prénom<input name="firstName" required maxlength="35" value="${escapeHtml(p.firstName)}" placeholder="Ex. Léa"></label>
        <label>Profil<select name="role"><option value="adult" ${role === 'adult' ? 'selected' : ''}>Adulte</option><option value="child" ${role === 'child' ? 'selected' : ''}>Enfant</option></select></label>
        <label>Sexe<select name="sex"><option value="femme" ${p.sex === 'femme' ? 'selected' : ''}>Femme</option><option value="homme" ${p.sex === 'homme' ? 'selected' : ''}>Homme</option></select></label>
        <label>Âge<input name="age" type="number" min="2" max="120" required value="${escapeHtml(p.age)}"></label>
        <label>Poids (kg)<input name="weight" type="number" min="5" max="350" step="0.1" required value="${escapeHtml(p.weight)}"></label>
        <label>Taille (cm)<input name="height" type="number" min="50" max="250" required value="${escapeHtml(p.height)}"></label>
        <label>Activité<select name="activity"><option value="1.2" ${String(p.activity) === '1.2' ? 'selected' : ''}>Peu active</option><option value="1.375" ${String(p.activity) === '1.375' ? 'selected' : ''}>Légèrement active</option><option value="1.55" ${String(p.activity) === '1.55' ? 'selected' : ''}>Active</option><option value="1.725" ${String(p.activity) === '1.725' ? 'selected' : ''}>Très active</option></select></label>
        <label>Alimentation<select name="diet"><option ${p.diet === 'Omnivore' ? 'selected' : ''}>Omnivore</option><option ${p.diet === 'Végétarien' ? 'selected' : ''}>Végétarien</option><option ${p.diet === 'Végétalien' ? 'selected' : ''}>Végétalien</option><option ${p.diet === 'Pescatarien' ? 'selected' : ''}>Pescatarien</option></select></label>
        <label class="wide">Objectif<select name="goal"><option value="maintenir" ${p.goal === 'maintenir' ? 'selected' : ''}>Maintenir le poids</option><option value="perdre" ${p.goal === 'perdre' ? 'selected' : ''}>Perdre du poids</option><option value="prendre" ${p.goal === 'prendre' ? 'selected' : ''}>Prendre du poids</option></select></label>
        <p class="family-child-note">Pour un enfant, NutriChef ne fixe jamais d’objectif calorique automatique. Les portions restent à adapter avec un professionnel de santé.</p>
        <div class="family-form-actions"><button type="submit">${isEditing ? 'Enregistrer ce profil' : 'Ajouter à la famille'}</button><button type="button" class="secondary" data-action="family-cancel">Annuler</button></div>
      </form>
    </section>`;
  }

  function householdSetup(state) {
    const current = state.profile;
    return `<section class="family-card family-empty"><div class="eyebrow">Un foyer, plusieurs repères</div><h2>Créons votre profil famille</h2><p class="family-help">Ajoutez les adultes et les enfants du foyer. Vous pourrez choisir le profil actif avant de préparer les recettes ou les menus.</p>
      <form id="family-household-form" class="family-form">
        <label class="wide">Nom du foyer<input name="name" required maxlength="50" placeholder="Ex. La famille Martin" value="${current?.firstName ? `Famille ${escapeHtml(current.firstName)}` : ''}"></label>
        ${current ? `<label class="wide"><input type="checkbox" name="includeCurrent" checked> Ajouter aussi mon profil actuel (${escapeHtml(current.firstName)})</label>` : ''}
        <div class="family-form-actions"><button type="submit">Créer mon profil famille</button><a class="btn secondary" href="#profil">Revenir à mon profil</a></div>
      </form>
    </section>`;
  }

  function renderFamily() {
    addFamilyLink();
    const appRoot = document.querySelector('#app');
    if (!appRoot) return;
    const state = getState();
    const home = household(state);
    if (!home) {
      appRoot.innerHTML = `<div class="wrap family-shell">${householdSetup(state)}</div>`;
      document.title = 'NutriChef · Profil famille';
      return;
    }
    const active = activeMember(state);
    const count = home.members.length;
    appRoot.innerHTML = `<div class="wrap family-shell">
      <section class="family-intro"><div><div class="eyebrow">Le foyer NutriChef</div><h1>${escapeHtml(home.name || 'Ma famille')}</h1><p class="family-lead">Un calendrier commun, des recettes adaptées à chaque personne. Sélectionnez simplement le profil qui cuisine ou pour lequel vous préparez le repas.</p></div><div class="family-count"><strong>${count}</strong><span>profil${count > 1 ? 's' : ''}<br>dans le foyer</span></div></section>
      <section class="family-card"><h2>Les profils de la famille</h2><p class="family-help">${active ? `<strong>${escapeHtml(active.profile.firstName)}</strong> est le profil actif : ses préférences guident les recettes proposées.` : 'Choisissez un profil pour personnaliser les propositions.'}</p><div class="family-member-grid">${home.members.map(member => memberCard(member, state)).join('')}</div><div class="family-actions section-gap"><button class="btn" type="button" data-action="family-add">Ajouter une personne</button><button class="btn secondary" type="button" data-action="family-rename">Renommer le foyer</button></div><div class="family-tip"><b>i</b><span>Le calendrier et la liste de courses restent communs à la famille. Avant de chercher une recette personnalisée, choisissez la personne concernée.</span></div></section>
      ${mode === 'add' ? memberForm() : mode.startsWith('edit:') ? memberForm(home.members.find(member => member.id === mode.slice(5))) : ''}
    </div>`;
    document.querySelectorAll('.top nav a').forEach(link => link.toggleAttribute('aria-current', link.hash === '#famille'));
    document.title = 'NutriChef · Profil famille';
  }

  function useMember(id) {
    const state = getState();
    const member = household(state)?.members.find(item => item.id === id);
    if (!member) return;
    state.profile = copy(member.profile);
    state.weights = copy(member.weights || []);
    state.activeFamilyMemberId = member.id;
    putState(state);
    location.hash = '#profil';
    location.reload();
  }

  document.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'family-add') { mode = 'add'; renderFamily(); return; }
    if (action === 'family-cancel') { mode = 'overview'; renderFamily(); return; }
    if (action === 'family-activate') { useMember(event.target.closest('[data-member-id]')?.dataset.memberId); return; }
    if (action === 'family-edit') { mode = `edit:${event.target.closest('[data-member-id]')?.dataset.memberId}`; renderFamily(); return; }
    if (action === 'family-remove') {
      const state = getState(), home = household(state), id = event.target.closest('[data-member-id]')?.dataset.memberId;
      const member = home?.members.find(item => item.id === id);
      if (!home || !member || !confirm(`Retirer le profil de ${member.profile.firstName} ?`)) return;
      home.members = home.members.filter(item => item.id !== id);
      if (state.activeFamilyMemberId === id) state.activeFamilyMemberId = home.members[0]?.id || null;
      putState(state); mode = 'overview'; renderFamily(); return;
    }
    if (action === 'family-rename') {
      const state = getState(), home = household(state), next = prompt('Nom du foyer', home?.name || '');
      if (home && next?.trim()) { home.name = next.trim().slice(0,50); putState(state); renderFamily(); }
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target;
    if (form.id === 'family-household-form') {
      const state = getState(), values = new FormData(form), members = [];
      if (values.get('includeCurrent') && state.profile) members.push({id:uid(),role:'adult',profile:copy(state.profile),weights:copy(state.weights || [])});
      state.family = {name:String(values.get('name')).trim(),members};
      state.activeFamilyMemberId = members[0]?.id || null;
      putState(state); mode = members.length ? 'overview' : 'add'; renderFamily(); return;
    }
    if (form.id === 'family-member-form') {
      const state = getState(), home = household(state), values = new FormData(form);
      if (!home) return;
      const id = form.dataset.memberId || uid(), role = values.get('role');
      const profile = {firstName:String(values.get('firstName')).trim(),sex:values.get('sex'),age:Number(values.get('age')),weight:Number(values.get('weight')),height:Number(values.get('height')),activity:Number(values.get('activity')),diet:values.get('diet'),goal:values.get('goal'),exclusions:[],special:role === 'child'};
      if (!profile.firstName) return;
      const index = home.members.findIndex(member => member.id === id);
      const member = {id,role,profile,weights:index >= 0 ? home.members[index].weights || [] : [{date:new Date().toISOString().slice(0,10),weight:profile.weight}]};
      if (index >= 0) home.members[index] = member; else home.members.push(member);
      if (!state.activeFamilyMemberId) { state.profile=copy(profile); state.weights=copy(member.weights); state.activeFamilyMemberId=id; }
      putState(state); mode = 'overview'; renderFamily(); return;
    }
    if (form.id === 'profile-form') setTimeout(() => {
      const state = getState(), member = activeMember(state);
      if (member && state.profile) { member.profile = copy(state.profile); member.weights = copy(state.weights || []); putState(state); }
    }, 0);
  });

  window.addEventListener('hashchange', () => setTimeout(() => { addFamilyLink(); if (location.hash === '#famille') renderFamily(); }, 0));
  addFamilyLink();
  if (location.hash === '#famille') renderFamily();
})();
