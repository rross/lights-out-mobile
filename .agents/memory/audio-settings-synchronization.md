---
name: Audio settings synchronization
description: Durable guidance for keeping persisted music and effects controls connected to gameplay audio.
---

Persisted audio settings should be reloaded when the gameplay screen regains focus, and slider completion should persist the exact final value rather than relying on a potentially stale render closure.

**Why:** Navigation can preserve screens longer than expected, and asynchronous slider callbacks can otherwise leave the active players or stored settings using older values.

**How to apply:** Treat settings storage and audio-player state as separate layers; synchronize them at screen focus and validate volume values within the 0-to-1 range.