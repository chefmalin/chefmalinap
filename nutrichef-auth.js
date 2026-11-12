(() => {
  // NutriChef is currently public: no email sign-in or subscription check is required.
  const root = document.documentElement;
  root.classList.remove('nc-auth-pending');
  root.classList.add('nc-auth-ready');
  document.querySelector('.nc-auth-gate')?.remove();
})();
