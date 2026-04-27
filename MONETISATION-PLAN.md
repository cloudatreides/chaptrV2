# Chaptr — Monetisation Plan

## Core Insight

The trip completion screen is the highest-emotion moment in the entire product. The user has spent hours building a relationship with their companion, exploring a city together, accumulating shared memories. They don't want it to end. This is the conversion moment.

---

## The Trip Complete Screen — Monetisation Surface

The trip complete screen is the ONLY place monetisation surfaces. No paywalls during the trip. No premium gates on companions or destinations. The free experience is complete and satisfying. Monetisation happens when the user is emotionally invested and voluntarily wants MORE.

### Screen Flow (top to bottom):

1. **Hero image + companion portrait** — emotional anchor, reminds them what they're leaving behind
2. **Stats** (time, scenes, messages) — quantifies the investment they've made
3. **Bond indicator** — "Close friends" with affinity bar. Shows the relationship they built
4. **Companion farewell** — personal, in-character goodbye. The emotional peak
5. **Trip summary** — journal-style narrative of their journey
6. **Highlights** — specific shared memories. Save to Album option
7. **--- monetisation break ---**
8. **"Stay 2 more days" CTA** — the impulse offer (Phase 1)
9. **"Plan another trip" button** — free, always available
10. **"Back to home" link** — exit

The monetisation CTA sits between the emotional content (farewell, memories) and the exit actions. The user has just read their companion's goodbye, seen their shared highlights, and felt the weight of what they're leaving behind. The "Stay 2 more days" button is the emotional escape hatch.

### Copy Direction

Don't say "buy" or "purchase". Frame it as a continuation of the experience:
- "Not ready to leave? Stay 2 more days with {companion}"
- "{companion} wants to show you something"
- "Your story doesn't have to end here"

The CTA should feel like an invitation from the companion, not a paywall from the app.

### Visual Treatment

- Button sits above "Plan another trip" but visually distinct — subtle gradient border, not solid fill
- Small price tag ($2.99) shown inline, not hidden
- No aggressive styling. No countdown timers. No "limited offer" manipulation
- The emotion does the selling, not the design

---

## Phase 1: "Stay Longer" (Launch First)

**What:** Add 2 extra days to the current trip in the same city with the same companion.

**Price:** $2.99 per extension (consumable one-time purchase)

**Why this first:**
- Impulse buy at emotional peak — highest conversion moment in the app
- Simple to implement — append 2 days to existing trip state, same itinerary generation infra
- Validates willingness to pay before building anything more complex
- Comparable model: dating sim "buy the next chapter", Chai/Character.AI pay-to-keep-chatting
- Low price ($2.99) feels like nothing after a 2+ hour emotional experience

**What happens when they pay:**
- Trip phase reverts from `complete` back to `day`
- 2 new itinerary days generated (days 6-7) using existing `generateDayItinerary()`
- `destination.tripDays` overridden for this trip to include extension days
- All state carries forward: memories, affinity, chat history, scene images
- Companion's first message in the extension acknowledges the decision: "I was hoping you'd say that"
- Extension days get fresh themes and new locations within the same city

**What happens at the end of the extension:**
- Same trip complete screen appears again
- Can extend ONCE more (max 2 extensions = 4 extra days)
- After second extension, "Stay Longer" CTA is replaced with "Come back anytime" teaser (Phase 2 seed)

**Revenue math:**
- Extension purchase rate (estimate): 5-15% of trip completions
- Revenue per paying user per trip: $2.99-5.98
- Natural ceiling prevents staleness — 9 days max in one city

**Payment infra:** Stripe Checkout session. One API route. No subscription state. No account management.

---

## Phase 2: "Return Trip" (Add After Validation)

**What:** Revisit the same city with the same companion. Different itinerary, but companion remembers everything from the first trip.

**Price:** $4.99 per return trip OR bundle into $9.99/mo "Companion Pass" for unlimited returns

**Where it surfaces:**
- NOT on the trip complete screen (Phase 1 owns that moment)
- Instead: on the Travel Home page, completed trips show a "Return" option
- Companion card shows "remembers you" badge after a completed trip
- Optional: companion sends a "ping" days later — "Miss Kyoto? I found a tea house we missed last time"

**Why this is the retention engine:**
- Every completed trip seeds a future return
- Library of companions + cities grows over time — more reasons to come back
- Companion memory recall creates emotional lock-in (they remember your jokes, your preferences)
- This is where the real money is in parasocial apps — the long-term bond
- Comparable model: Replika Pro ($49.99/yr), gacha games collecting/revisiting characters

**What happens on a return trip:**
- Companion's opening message references the first trip: "Remember that ramen place in Shibuya?"
- All previous `companionMemories` loaded into context
- Affinity score starts where it left off (no relationship reset)
- Brand new itinerary — different theme, different spots, but companion knows your preferences
- Feels like reconnecting with an old friend, not starting over

**Implementation requires:**
- Persist `companionMemories` and `travelAffinityScore` per companion per city (beyond single trip state)
- "Past trips" library UI on Travel Home
- Fresh itinerary generation that avoids repeating locations from previous visits
- "Welcome back" companion opening using memory context

**Revenue model:**
- Start with per-trip ($4.99) — simple, no subscription overhead
- Migrate to "Companion Pass" ($9.99/mo) once return rate data justifies it
- Subscription unlocks: unlimited returns + priority image generation + exclusive destinations

---

## Sequencing

**Do not launch both simultaneously.** Two purchase options at trip completion splits attention and kills impulse conversion.

| Phase | Purpose | Timing |
|-------|---------|--------|
| Phase 1: Stay Longer | Validate willingness to pay | Launch |
| Phase 2: Return Trip | Build recurring revenue | After 100+ trip completions with Phase 1 data |

Phase 1 answers: "Do users pay at all?"
Phase 2 answers: "Do users come back?"

---

## Comparable App Monetisation

| App | Model | Revenue driver |
|-----|-------|---------------|
| Replika | Free hooks, Pro subscription ($49.99/yr) | Ongoing relationship — the bond IS the product |
| Character.AI | c.ai+ subscription ($9.99/mo) | Volume of ongoing conversations, priority access |
| Chai | Freemium + premium ($13.99/mo) | Extended conversations, premium characters |
| Dating sims | Chapter unlocks ($1.99-4.99 each) | "What happens next?" at cliffhangers |
| Gacha games | Dual: impulse IAP + battle pass subscription | Impulse buys fund acquisition, subscription funds retention |

**Pattern:** The impulse purchase hooks them. The subscription retains them. Build in that order.

---

## Pricing Psychology

- $2.99 for "Stay Longer" — below the "do I really want this?" threshold
- Don't offer a free extension. The first purchase is the hardest — once they've paid once, the second is easy
- Price anchoring: the $2.99 sits next to a companion farewell message. The cost feels trivial compared to what they're losing
- "Last chance" framing: this CTA only appears at trip completion. Scarcity + emotion = conversion
- Showing the price upfront (not hidden behind a button) reduces friction — no surprise, no bait-and-switch

---

## Solo Builder Considerations

- Skip subscription infrastructure at launch. Stripe Checkout for one-time purchases
- Web-only avoids the 30% Apple/Google cut
- RevenueCat if/when adding mobile app
- The winning solo-builder pattern: **consumable IAP** rather than subscription management overhead
- Three metrics that matter: completion rate, extension purchase rate, return rate

---

## What's Live (GTM Testing)

**Phase 1: "Stay Longer" — implemented, free for now**

- "Stay 2 more days" CTA appears on the trip complete screen, between highlights and exit buttons
- $2.99 shown in strikethrough with a "Free" badge — GTM testers see the intended price point without being blocked
- Copy: "Not ready to leave? Stay 2 more days with {companion}"
- Max 2 extensions per trip (4 extra days, 9 days total)
- After 2 extensions, CTA is replaced with "Come back anytime, {companion} will remember you"
- Extension days use the same itinerary generation — fresh themes, new locations, all memories and affinity carry forward
- No payment infra yet. Stripe integration when conversion data justifies it

---

## Future Monetisation Angles (Post-Validation)

- **Premium companions** — new personalities with unique backstories, $2.99 to unlock
- **Premium destinations** — exclusive cities with richer location knowledge, $1.99 to unlock
- **Photo album exports** — shareable trip journal with AI-generated images, $0.99 per export
- **Gift a trip** — send a friend a pre-planned trip with a companion, $4.99
