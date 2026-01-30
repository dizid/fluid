# Fluid Intimacy - TODO

## To Run

1. Create `.env` with your Firebase + Anthropic keys:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
ANTHROPIC_API_KEY=...
```

2. Install dependencies:
```bash
npm install
```

3. Start dev server:
```bash
npm run dev
```

App runs at `localhost:3000` with Netlify Functions emulated by the Vite plugin.

## Setup Required

- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Enable Email/Password and Google auth providers
- [ ] Create Firestore database
- [ ] Add Firestore security rules
- [ ] Get Anthropic API key from https://console.anthropic.com

## Future Enhancements

- [ ] Stripe integration for premium tier
- [ ] Interactive SVG anatomy diagrams
- [ ] Couple mode with partner linking
- [ ] Journal entries with encryption
- [ ] PWA icons (192x192, 512x512)
