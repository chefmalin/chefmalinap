# NutriChef — accès privé sans abonnement

Cette configuration remplace GitHub Pages public par un Worker Cloudflare gratuit.
Le Worker n'envoie la page NutriChef qu'après vérification d'une session Supabase
et d'un droit d'accès encore actif.

## Ce qui est gratuit

- Cloudflare Workers : hébergement et contrôle d'accès (100 000 requêtes/jour).
- Supabase Free : comptes par lien e-mail, base des droits et webhook de vente.
- GitHub : dépôt privé.

## Déploiement, dans cet ordre

1. Dans Supabase, exécuter `supabase/nutrichef-access.sql`, puis les deux migrations
   du dossier `supabase/migrations/`, dans le SQL Editor.
2. Dans Supabase > Authentication > URL Configuration, ajouter l'URL Cloudflare
   finale comme `Site URL` et `Redirect URL` : `https://VOTRE-URL/connexion`.
3. Déployer la fonction `systeme-sale-webhook` et renseigner `SYSTEME_WEBHOOK_SECRET`,
   `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` comme secrets de fonction.
4. Dans Systeme.io, créer le webhook `NEW_SALE` vers cette fonction, avec le même
   secret. Tester une vente de chaque montant : 19,99 €, 39,99 € et 59,99 €.
5. Dans `worker/`, lancer `node scripts/prepare-assets.mjs`, puis configurer les
   secrets Cloudflare `SUPABASE_URL` et `SUPABASE_ANON_KEY`. Ne jamais mettre la
   clé service-role dans Cloudflare ni dans le navigateur.
6. Déployer le Worker avec ses assets. L'URL obtenue devient le lien NutriChef
   officiel. Vérifier le parcours avec une adresse de test avant de modifier les
   pages de remerciement Systeme.io.
7. Une fois validé, rendre le dépôt GitHub privé et désactiver GitHub Pages. Les
   anciennes URL publiques ne doivent plus être communiquées.

## Contrôles de sécurité

- `/` exige une session HTTP-only et un droit actif (`nutrichef_access`).
- Le HTML de l'application est stocké sous `__protected/` et n'est jamais servi
  directement par le Worker.
- Les clients reçoivent un lien de connexion éphémère par e-mail ; ce n'est pas un
  lien permanent donnant accès à l'application.
- Le cron Cloudflare appelle une fonction sans données toutes les cinq journées,
  pour maintenir actif le projet Supabase gratuit.
