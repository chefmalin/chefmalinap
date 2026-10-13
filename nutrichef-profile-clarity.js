/* Keep the profile screen readable when users navigate with the back button. */
(()=>{const tune=()=>{const app=document.querySelector('#app');if(!app||location.hash!=='#profil')return;app.querySelectorAll('.nc-profile-dashboard button,.nc-profile-dashboard a').forEach(el=>{el.style.touchAction='manipulation';});};addEventListener('hashchange',tune);addEventListener('pageshow',tune);new MutationObserver(tune).observe(document.documentElement,{childList:true,subtree:true});tune();})();

