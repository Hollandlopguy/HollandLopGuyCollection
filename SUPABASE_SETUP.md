# Supabase Setup

1. Create a Supabase project at https://supabase.com.
2. Open the Supabase SQL Editor.
3. Paste and run the SQL from `supabase-schema.sql`.
4. Go to Project Settings > API.
5. Copy your Project URL and anon public key.
6. Paste them into `supabase-config.js`:

```js
window.KOOL_AID_SUPABASE = {
  url: "https://YOUR-PROJECT.supabase.co",
  anonKey: "YOUR-ANON-PUBLIC-KEY",
};
```

7. Upload `supabase-config.js`, `supabase-schema.sql`, and this updated site to GitHub.
8. Vercel will redeploy automatically.

Important: the provided SQL allows public reads and anon-key writes so your current owner passcode can keep working from a static website. That is convenient, but it is not strong database security because a technical visitor could inspect the site and use the anon key. For true owner-only database writes, use Supabase Auth and row-level policies tied to your user account.
