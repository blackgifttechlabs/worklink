i n# Service Loop landing

This is the standalone marketing site for `serviceloop.co.zw`.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Deploy this directory as its own Vercel project and attach `serviceloop.co.zw` to that project. Set `VITE_SERVICE_LOOP_APP_URL` to the deployed app origin, currently `https://service-linker-delta.vercel.app`.

The **Enter Service Loop** action opens `/home` in the app project. The app’s auth guard sends unauthenticated visitors to `/login`; authenticated visitors continue into the app.
