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

3. **Google Maps** (optional, for event location maps)
   - Create a project at [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the **Maps Embed API**
   - Create an API key and add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`
   - Without this, event detail modals show a fallback link to Google Maps

4. **Seed events** (optional)
   - Copy `Bristol_200_Community_Events_MASTER_V2.xlsx` to the project root or keep it in `~/Downloads`
   - Get your admin token from the InstantDB dashboard
   - Add `INSTANT_APP_ADMIN_TOKEN` to `.env.local`
   - Run `npm run seed`

5. **Add questionnaire questions**
   - Edit `src/config/questions.config.ts`
   - Add your 20 questions from the Word document

6. **Run the app**
   ```bash
   npm run dev
   ```

## Pages

- **/** – All events (Meetup-style list)
- **/calendar** – Calendar view of events
- **/login** – Sign in with email magic code
- **/questionnaire** – Find Your Events (requires sign-in, saves to your account)
- **/for-you** – Personalized recommendations (requires sign-in)
