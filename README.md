# IoT-Based-Telecom-Equipment-Tracking-and-Management-System
This project proposes the design and development of an integrated platform for telecom equipment tracking and management based on Internet of Things (IoT) technologies. The system combines a mobile application dedicated to drivers and technicians with a web-based administrative dashboard for mission supervision and resource management.

## Integrated Development Setup

1. Start backend dependencies:
   - `cd backend`
   - `npm install`
   - `docker compose up -d`

2. Create a backend `.env` file from `backend/.env.example`.

3. Run services from the repository root:
   - `npm install`
   - `npm run start:backend`
   - `npm run start:web`
   - `npm run start:mobile`

4. The web admin UI will proxy `/api` requests to the backend during development.

5. For the mobile app, set `EXPO_PUBLIC_API_URL` in `mobile_app/.env.example` or your `.env` to point to the backend API.
