# FamTrack — setup

1. Install Node.js 20+ (nodejs.org) and VS Code.
2. In this folder: `npm install`
3. Copy `.env.example` to `.env.local` and fill the 3 values (see below).
4. `npm run dev` then open http://localhost:3000

## MongoDB Atlas
Create free cluster > Database Access: add a user + password > Network Access: add your IP (use 0.0.0.0/0 for Vercel) > Connect > Drivers > copy the string, replace <password>, add `/famtrack` before the `?`.

## JWT secret
Run: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and paste the result.

## Google Maps key
console.cloud.google.com > new project > enable billing (free monthly credit) > APIs: enable "Maps JavaScript API" > Credentials > Create API key > restrict to that API and to websites: `http://localhost:3000/*` plus your live domain `https://YOUR-APP.vercel.app/*`.

## Go live (Vercel)
1. `git init && git add . && git commit -m "init"`, push to a new GitHub repo (.env.local is ignored).
2. vercel.com > Add New Project > import repo > add the same 3 env vars > Deploy.
3. Add the Vercel URL to the Google key referrers. Keep Atlas open to 0.0.0.0/0.
Geolocation needs HTTPS; Vercel provides it.
