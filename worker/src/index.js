const SESSION_COOKIE = 'nutrichef_session';
const APP_ASSET = '/__protected/nutrichef.html';

function readCookie(request, name) {
  const source = request.headers.get('Cookie') || '';
  return source.split(';').map(item => item.trim()).find(item => item.startsWith(`${name}=`))?.slice(name.length + 1) || '';
}

function sessionCookie(token, maxAge = 60 * 60 * 24 * 30) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function loginPage() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Accès NutriChef</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f0e3;font:16px system-ui;color:#214735}.card{max-width:420px;margin:24px;padding:32px;border-radius:24px;background:#fffdf7;box-shadow:0 18px 50px #21473526}h1{font-family:Georgia,serif;margin:.2em 0}.lead{line-height:1.55;color:#596b60}label,input,button{display:block;width:100%;box-sizing:border-box}label{font-weight:700;margin-top:20px}input{margin-top:7px;padding:13px;border:1px solid #cbdcc0;border-radius:12px;font:inherit}button{margin-top:14px;padding:14px;border:0;border-radius:12px;background:#315b43;color:#fff;font-weight:800;font-size:16px;cursor:pointer}button:disabled{opacity:.65;cursor:wait}#message{min-height:1.4em;color:#596b60;font-size:14px}.error{color:#a33!important}</style></head><body><main class="card"><p>ACCÈS CLIENT SÉCURISÉ</p><h1>Bienvenue dans NutriChef</h1><p class="lead">Utilisez l’adresse e-mail employée lors de votre achat. Nous vous enverrons un lien de connexion personnel.</p><form id="login"><label for="email">Votre adresse e-mail</label><input id="email" type="email" autocomplete="email" required placeholder="vous@exemple.fr"><button>Recevoir mon lien sécurisé</button><p id="message" aria-live="polite"></p></form></main><script src="/connexion.js"></script></body></html>`;
}

function clientScript(url, key) {
  return `const form=document.querySelector('#login'),email=document.querySelector('#email'),button=form.querySelector('button'),message=document.querySelector('#message');form.addEventListener('submit',async event=>{event.preventDefault();const value=email.value.trim().toLowerCase();button.disabled=true;message.className='';message.textContent='Envoi du lien sécurisé…';try{const r=await fetch(${JSON.stringify(url)}+'/auth/v1/otp',{method:'POST',headers:{apikey:${JSON.stringify(key)},'Content-Type':'application/json'},body:JSON.stringify({email:value,create_user:true,redirect_to:location.origin+'/connexion'})});if(!r.ok)throw Error();message.textContent='C’est envoyé. Ouvrez l’e-mail reçu pour accéder à NutriChef.';email.disabled=true;button.textContent='Lien envoyé'}catch{message.className='error';message.textContent='L’envoi n’a pas fonctionné. Réessayez dans un instant.';button.disabled=false}});const hash=new URLSearchParams(location.hash.slice(1));if(hash.get('access_token')){message.textContent='Vérification de votre accès…';fetch('/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_token:hash.get('access_token')})}).then(r=>{if(!r.ok)throw Error();location.replace('/')}).catch(()=>{message.className='error';message.textContent='Ce lien n’est plus valide. Demandez-en un nouveau.'})}`;
}

async function currentUser(token, env) {
  if (!token) return null;
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  return response.ok ? response.json() : null;
}

async function isAllowed(token, env) {
  const user = await currentUser(token, env);
  if (!user) return false;
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/nutrichef_access`, { method: 'POST', headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}' });
  if (!response.ok) return false;
  const data = await response.json();
  return (Array.isArray(data) ? data[0] : data)?.allowed === true;
}

async function staticAsset(request, env) {
  const pathname = new URL(request.url).pathname;
  if (pathname.endsWith('.html') || pathname.startsWith('/__protected/')) return new Response('Not found', { status: 404 });
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/connexion') return new Response(loginPage(), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
    if (url.pathname === '/connexion.js') return new Response(clientScript(env.SUPABASE_URL, env.SUPABASE_ANON_KEY), { headers: { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' } });
    if (url.pathname === '/session' && request.method === 'POST') {
      let token = '';
      try { token = String((await request.json()).access_token || ''); } catch { /* invalid request */ }
      if (!(await currentUser(token, env))) return new Response('Unauthorized', { status: 401 });
      return new Response(null, { status: 204, headers: { 'Set-Cookie': sessionCookie(token) } });
    }
    if (url.pathname === '/deconnexion') return new Response(null, { status: 302, headers: { Location: '/connexion', 'Set-Cookie': sessionCookie('', 0) } });
    if (url.pathname === '/') {
      const token = decodeURIComponent(readCookie(request, SESSION_COOKIE));
      if (!(await isAllowed(token, env))) return Response.redirect(`${url.origin}/connexion`, 302);
      return env.ASSETS.fetch(new Request(new URL(APP_ASSET, url), request));
    }
    return staticAsset(request, env);
  },
  async scheduled(_event, env) {
    await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/nutrichef_keep_alive`, { method: 'POST', headers: { apikey: env.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: '{}' });
  }
};
