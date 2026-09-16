---
name: Audio settings synchronization
description: Durable guidance for keeping persisted music and effects controls connected to gameplay audio.
---

Persisted audio settings should be reloaded when the gameplay screen regains focus, and slider completion should persist the exact final value rather than relying on a potentially stale render closure.

**Why:** Navigation can preserve screens longer than expected, and asynchronous slider callbacks can otherwise leave the active players or stored settings using older values.

**How to apply:** Treat settings storage and audio-player state as separate layers; synchronize them at screen focus and validate volume values within the 0-to-1 range.

For separate music and effects sliders to feel equivalent at the same percentage, normalize the source audio assets to a common loudness target and map both player volumes directly from 0 to 1. Player-volume equality alone does not compensate for differently mastered files.

**Why:** The original music and effects files had substantially different integrated loudness, so equal numeric player volumes still produced an unbalanced mix.

**How to apply:** Calibrate source assets first, then avoid hidden per-category gain or multipliers unless the product explicitly wants different slider behavior.