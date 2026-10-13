(()=>{
  const URL='https://naregjbyatnoazyyfwmj.supabase.co';
  const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcmVnamJ5YXRub2F6eXlmd21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODMyMjAsImV4cCI6MjEwNTc1OTIyMH0.3wdp1l-61dSaFyVKDqKr9sM0SlUZT-y6wmDJ0Io9JhI';
  const SESSION_KEY='sb-naregjbyatnoazyyfwmj-auth-token';
  const root=document.documentElement;
  const jsonHeaders={'apikey':KEY,'Content-Type':'application/json'};
  const read=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
  const tokenInfo=token=>{try{return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch{return {}}};
  const expiresAt=session=>Number(session?.expires_at||tokenInfo(session?.access_token||'').exp||0);
  const sessionUserId=session=>session?.user?.id||tokenInfo(session?.access_token||'').sub||'';
  const isFresh=session=>!!(session?.access_token&&sessionUserId(session)&&expiresAt(session)>Math.floor(Date.now()/1000)+30);
  const dataKey=session=>'nutrichef-v3:'+sessionUserId(session);
  const migrateLegacy=session=>{const key=dataKey(session),legacy=localStorage.getItem('nutrichef-v3');if(key&&legacy&&!localStorage.getItem(key))localStorage.setItem(key,legacy);};
  const unlock=session=>{if(!isFresh(session))return false;migrateLegacy(session);window.NUTRICHEF_STORAGE_KEY=dataKey(session);root.classList.remove('nc-auth-pending');root.classList.add('nc-auth-ready');mountAccount();return true;};
  const api=async(path,options={})=>fetch(URL+path,{...options,headers:{...jsonHeaders,...(options.headers||{})}});
  const clearHash=()=>history.replaceState(null,'',location.pathname+location.search);
  const removeGate=()=>document.querySelector('.nc-auth-gate')?.remove();
  const gate=()=>{
    if(document.querySelector('.nc-auth-gate'))return;
    root.classList.remove('nc-auth-ready');root.classList.add('nc-auth-pending');
    const el=document.createElement('section');el.className='nc-auth-gate';el.setAttribute('aria-label','Connexion sécurisée NutriChef');
    el.innerHTML='<div class="nc-auth-card"><img class="nc-auth-pipo" src="nutrichef-assets-v2/image-01.png" alt="Pipo, le chef NutriChef"><p class="nc-auth-kicker">Accès client sécurisé</p><h1>Bienvenue dans NutriChef</h1><p class="nc-auth-copy">Saisissez votre e-mail. Vous recevrez un lien sécurisé, valable une seule fois, pour ouvrir votre espace.</p><form class="nc-auth-form"><label for="nc-auth-email">Votre adresse e-mail<input id="nc-auth-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="vous@exemple.fr" required></label><button type="submit">Recevoir mon lien sécurisé</button><p class="nc-auth-message" aria-live="polite"></p></form><p class="nc-auth-note">Aucun mot de passe à retenir. Vérifiez aussi vos courriers indésirables si le message n’arrive pas.</p></div>';
    document.body.append(el);
    const form=el.querySelector('form'),input=el.querySelector('input'),button=el.querySelector('button'),message=el.querySelector('.nc-auth-message');
    form.addEventListener('submit',async event=>{event.preventDefault();const email=input.value.trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email)){message.textContent='Entrez une adresse e-mail valide.';message.className='nc-auth-message is-error';input.focus();return;}button.disabled=true;message.className='nc-auth-message';message.textContent='Envoi du lien sécurisé…';try{const response=await api('/auth/v1/otp',{method:'POST',body:JSON.stringify({email,create_user:true,redirect_to:location.origin+location.pathname})});if(!response.ok)throw Error();message.textContent='C’est envoyé. Ouvrez votre e-mail, puis cliquez sur le lien sécurisé.';input.disabled=true;button.textContent='Lien envoyé';}catch{message.textContent='L’envoi n’a pas fonctionné. Réessayez dans un instant.';message.className='nc-auth-message is-error';button.disabled=false;}});
  };
  const mountAccount=()=>{removeGate();const nav=document.querySelector('.top nav');if(!nav||nav.querySelector('.nc-auth-account'))return;const button=document.createElement('button');button.type='button';button.className='nc-auth-account';button.textContent='Se déconnecter';button.addEventListener('click',async()=>{const session=read();try{if(session?.access_token)await api('/auth/v1/logout',{method:'POST',headers:{Authorization:'Bearer '+session.access_token}})}catch{}localStorage.removeItem(SESSION_KEY);delete window.NUTRICHEF_STORAGE_KEY;root.classList.remove('nc-auth-ready');root.classList.add('nc-auth-pending');location.reload();});nav.append(button);};
  const store=payload=>{const exp=Number(payload.expires_at||tokenInfo(payload.access_token||'').exp||0);const session={...payload,expires_at:exp};localStorage.setItem(SESSION_KEY,JSON.stringify(session));return session;};
  const completeLink=async()=>{const params=new URLSearchParams(location.hash.startsWith('#')?location.hash.slice(1):'');const accessToken=params.get('access_token'),refreshToken=params.get('refresh_token');if(!accessToken||!refreshToken)return false;try{const response=await api('/auth/v1/user',{headers:{Authorization:'Bearer '+accessToken}});if(!response.ok)throw Error();const user=await response.json();store({access_token:accessToken,refresh_token:refreshToken,token_type:params.get('token_type')||'bearer',expires_in:Number(params.get('expires_in')||0),user});clearHash();location.reload();return true;}catch{clearHash();return false;}};
  const refresh=async session=>{if(!session?.refresh_token)return null;try{const response=await api('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})});if(!response.ok)return null;return store(await response.json());}catch{return null;}};
  (async()=>{if(await completeLink())return;let session=read(),wasReady=root.classList.contains('nc-auth-ready');if(!isFresh(session))session=await refresh(session);if(unlock(session)){if(!wasReady)location.reload();return;}gate();})();
})();

