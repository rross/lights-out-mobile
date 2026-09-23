---
name: Physical iOS Expo Go
description: Authentication requirement for loading this Replit-hosted Expo project in the current physical iOS Expo Go client.
---

Physical iOS Expo Go previews require the development server and the device to use the same Expo identity. Prefer the project owner's secure `EXPO_TOKEN`.

**Why:** The Replit-provided session authenticated Metro as an inaccessible generated private account, and Expo Go rejected the project while the device was signed into the owner's account.

**How to apply:** Let Expo CLI read `EXPO_TOKEN` from Replit Secrets, do not restore the generated private-account login helper, and validate physical iOS separately from successful web and native exports.