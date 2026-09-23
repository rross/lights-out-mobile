---
name: Physical iOS Expo Go
description: Authentication requirement for loading this Replit-hosted Expo project in the current physical iOS Expo Go client.
---

Physical iOS Expo Go previews require the development server to sign in with the Replit-provided Expo session before Metro starts.

**Why:** The current iOS Expo Go client rejects an otherwise valid SDK 57 development server when it is not associated with an authenticated Expo session.

**How to apply:** Preserve the guarded launch-time login in the Expo workflow command, keep it non-blocking when the session is unavailable, and validate physical iOS separately from successful web and native exports.