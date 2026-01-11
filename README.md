.
├── README.md
├── app
│   ├── dashboard
│   │   ├── page.tsx
│   │   └── styles.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── settings
│       ├── page.tsx
│       └── styles.css
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── public
│   ├── favicon.ico
│   └── index.html
├── types
│   └── next-auth.d.ts
├── .env.local
└── yarn.lock



This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


CommentAI est une application Next.js qui permet de gérer les commentaires YouTube avec l'aide de l'IA. Elle offre les fonctionnalités suivantes :

- Authentification avec NextAuth et Google Provider
- Gestion des commentaires YouTube via l'API YouTube Data
- Génération automatique de réponses aux commentaires avec l'IA de Google
- Filtrage des commentaires selon les règles d'automatisation définies
- Ajout et suppression des mots-clés de la liste noire

## Pré-requis

Avant de commencer, vous devez vous assurer d'avoir les éléments suivants installés sur votre machine :

- Node.js (version 16.0.0 ou ultérieure)
- npm ou Yarn

## Installation

1. Cloner le dépôt Git : `git clone https://github.com/your-username/commentai.git`
2. Accéder au répertoire du projet : `cd commentai`
3. Installer les dépendances : `npm install` ou `yarn install`

## Démarrage

1. Lancer le serveur de développement : `npm run dev` ou `yarn dev`
2. Accéder à l'application en ouvrant votre navigateur à l'adresse [http://localhost:3000](http://localhost:3000)
3. Vous pouvez commencer à éditer la page en modifiant le fichier [app/page.tsx](cci:7://file:///c:/Users/Lenovo/Documents/commentai/app/page.tsx:0:0-0:0). La page se mettra automatiquement à jour à mesure que vous éditez le fichier.

## Configuration

Avant de pouvoir utiliser l'application, vous devez configurer les informations d'authentification pour l'API YouTube Data et NextAuth. Vous pouvez le faire en modifiant le fichier `.env.local` à la racine du projet. Voici les variables d'environnement nécessaires :

- `GOOGLE_CLIENT_ID` : L'ID client de votre application Google
- `GOOGLE_CLIENT_SECRET` : Le secret client de votre application Google
- `NEXTAUTH_SECRET` : Le secret pour NextAuth

## Autres informations

- Pour générer des réponses automatiques, vous devez avoir une clé d'API pour l'IA de Google. Vous pouvez la générer en suivant les instructions de la [documentation de Google Generative AI](https://cloud.google.com/ai/docs/generative-ai).

- Pour gérer les commentaires YouTube, vous devez avoir les autorisations appropriées dans votre compte YouTube. Vous pouvez les gérer en accédant à la page "Gérer les autorisations" dans votre compte YouTube.

- Pour ajouter ou supprimer des mots-clés de la liste noire, vous pouvez accéder à la page "Paramètres" de l'application.

