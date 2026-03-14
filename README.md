# Clover – Community Events in Bristol

Discover social and community events near BS3 Bristol. Complete a questionnaire to get personalized event recommendations.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure InstantDB**
   - Create an app at [instantdb.com](https://instantdb.com)
   - Add `NEXT_PUBLIC_INSTANT_APP_ID` to `.env.local` (already set)
   - Run `npm run db:init` to link the app
   - Run `npm run db:push` to push the schema
   - Run `npm run db:perms` to push permissions
   - **Enable Magic Code auth**: In the InstantDB dashboard, go to the Auth tab and ensure Magic Code is enabled (it's on by default)

3. **Firebase Auth** (optional, for email + password sign-up/sign-in)
   - Create a project at [Firebase Console](https://console.firebase.google.com/)
   - Enable **Email/Password** sign-in under Authentication > Sign-in method
   - In Project Settings, copy your **Project ID** and **Web API Key**
   - In the InstantDB dashboard Auth tab, add a Firebase app with your Project ID
   - Add to `.env.local`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY` – Web API Key from Firebase
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` – Project ID
     - `NEXT_PUBLIC_INSTANT_FIREBASE_CLIENT_NAME` – Client name you set in InstantDB (e.g. `clover-firebase`)

4. **Google OAuth** (optional, for sign-in with Google)
   - Create an OAuth client at [Google Console](https://console.cloud.google.com/) (Credentials > Create Credentials > OAuth client ID)
   - For Web application: add `http://localhost:3002` (and your production domain) to Authorized JavaScript origins
   - Add `https://api.instantdb.com/runtime/oauth/callback` as an Authorized redirect URI
   - In the InstantDB dashboard Auth tab, add the Google client (Client ID and Secret)
   - Add to `.env.local`:
     - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` – Your Google OAuth Client ID (for popup flow)
     - `NEXT_PUBLIC_INSTANT_GOOGLE_CLIENT_NAME` – Client name you set in InstantDB (e.g. `google-web`)
   - In InstantDB Auth tab, add your app URLs to Redirect Origins (e.g. `http://localhost:3002`)

5. **Google Maps** (optional, for event location maps)
   - Create a project at [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the **Maps Embed API** (for event detail modals)
   - Enable the **Maps Static API** (for the For You page map showing 5 curated events)
   - Create an API key and add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`
   - Without this, event detail modals show a fallback link to Google Maps

6. **Weather** (optional, for homepage weather widget)
   - Create a free account at [OpenWeatherMap](https://openweathermap.org/api)
   - Get your API key from the dashboard
   - Add `OPENWEATHERMAP_API_KEY` to `.env.local`
   - Without this, the weather widget will not appear on the homepage

7. **Seed events** (optional)
   - Copy `Bristol_200_Community_Events_MASTER_V2.xlsx` to the project root or keep it in `~/Downloads`
   - Get your admin token from the InstantDB dashboard
   - Add `INSTANT_APP_ADMIN_TOKEN` to `.env.local`
   - Run `npm run seed`

8. **Add questionnaire questions**
   - Edit `src/config/questions.config.ts`
   - Add your 20 questions from the Word document

9. **Run the app**
   ```bash
   npm run dev
   ```

## Pages

- **/** – All events (Meetup-style list); sign in when logged out (magic code, email+password, or Google)
- **/calendar** – Calendar view of events
- **/signup** – Create account (Google or email+password)
- **/questionnaire** – Find Your Events (requires sign-in, saves to your account)
- **/for-you** – Personalized recommendations (requires sign-in)
