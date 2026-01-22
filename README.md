# Task Manager

Application Angular **task-manager** (SPA) avec pages d’authentification, dashboard, tâches et utilisateurs.

---

## Démarrer vite

### Prérequis
- **Node.js** (LTS conseillé)
- **npm**

### Installer
```bash
npm install
```

### Lancer en local
```bash
ng serve
```

➡️ Ouvre : **http://localhost:4200**

---

## Routes (URLs après lancement)

Base : `http://localhost:4200`

| URL | Écran | Accès |
|---|---|---|
| `/login` | LoginComponent | Public |
| `/register` | RegisterComponent | Public |
| `/dashboard` | DashboardComponent | Protégé (**authGuard**) |
| `/tasks` | TasksListComponent | Protégé (**authGuard**) |
| `/tasks/new` | TaskFormComponent | Protégé (**authGuard**) |
| `/tasks/:id` | TaskDetailComponent | Protégé (**authGuard**) |
| `/tasks/:id/edit` | TaskFormComponent | Protégé (**authGuard**) |
| `/users` | UsersListComponent | Protégé (**authGuard** + **adminGuard**) |
| `/` | redirect → `/login` | — |
| `/**` (inconnu) | redirect → `/login` | — |

> `:id` est un paramètre dynamique (ex: `/tasks/12`, `/tasks/12/edit`).

---

## Architecture (simple)

Organisation du code (dans `src/app/`) :

- `core/` : logique transversale (services, modèles, auth, interceptors)
  - `core/auth/guards/` : `authGuard`, `adminGuard`
  - `core/auth/interceptors/` : `auth.interceptor.ts` (injecte le token / gère auth)
  - `core/*/services/` : services API (tasks/users/comments/auth)
  - `core/models/` : interfaces / modèles (`Task`, `User`, etc.)
- `features/` : pages / écrans (fonctionnalités)
  - `features/auth/` : login + register
  - `features/dashboard/` : dashboard
  - `features/tasks/` : liste / détail / formulaire
  - `features/users/` : liste utilisateurs
  - `features/comments/` : liste de commentaires
- `shared/` : composants/utilitaires réutilisables
  - `shared/navbar/` : navbar
  - `shared/utils/` : helpers (ex: `error-message.ts`)

### Routing
Les routes sont définies dans :
- `src/app/app.routes.ts` (standalone routes Angular)

### Configuration
- `src/app/app.config.ts` : providers (router, interceptors, etc.)

