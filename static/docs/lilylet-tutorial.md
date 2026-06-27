# Lilylet Language Tutorial

Lilylet is a text-based music notation language inspired by [LilyPond](https://lilypond.org/). It uses a simplified syntax optimized for embedding music snippets in Markdown documents—ideal for tutorials, analyses, exercises, and documentation where music examples appear alongside explanatory text.

**Audience:** readers with music theory background who understand Markdown. Some may know LilyPond; others may not.
**Goal:** learn Lilylet basics quickly and use it effectively inside Markdown documents.

---

## Table of Contents

1. [Quick Start: Lilylet inside Markdown](#quick-start-lilylet-inside-markdown)
2. [Pitches](#pitches)
3. [Rhythms and Durations](#rhythms-and-durations)
4. [Rests](#rests)
5. [Accidentals](#accidentals)
6. [Key and Time Signatures](#key-and-time-signatures)
7. [Barlines](#barlines)
8. [Chords](#chords)
9. [Articulations](#articulations)
10. [Fingering](#fingering)
11. [Dynamics](#dynamics)
12. [Slurs, Ties, and Beams](#slurs-ties-and-beams)
13. [Ornaments](#ornaments)
14. [Grace Notes](#grace-notes)
15. [Tuplets](#tuplets)
16. [Tremolo](#tremolo)
17. [Multiple Voices](#multiple-voices)
18. [Multiple Staves](#multiple-staves)
19. [Advanced Features](#advanced-features)
20. [Complete Examples](#complete-examples)
21. [Practical Writing Tips](#practical-writing-tips)

---

## Quick Start: Lilylet inside Markdown

Lilylet is a text-based music notation language with a LilyPond-like command style, but optimized for quick entry and editing. The typical workflow is to embed Lilylet snippets in Markdown code blocks (```lilylet), next to explanations, analyses, exercises, or version comparisons.

**Your first score:**

```lilylet
\time 4/4 \clef "treble"
c4 d e f | g2 g | a4 a a a | g1
```

Notes:
- Commands like `\time`, `\key`, `\clef`, articulations, and dynamics follow familiar LilyPond conventions.
- Bar lines `|` help you explain or revise music **measure by measure**, which fits well with Markdown-based teaching materials and documentation.

---

## Pitches

### Note names

Use lowercase `a`–`g`:

```lilylet
\time 4/4
c4 d e f | g a b c
```

### Relative pitch (default)

Lilylet always uses relative pitch (similar to LilyPond): if you omit octave markers, Lilylet picks the octave so the interval from the previous note is **less than a fifth** (keeps motion local and predictable).

- Reference pitch at the start: **middle C (C4)**
- Each next pitch is interpreted relative to the previous one

```lilylet
\time 4/4
c4 d e f | g a b c | c b a g | f e d c
```

### Why "less than a fifth" matters

```lilylet
\time 4/4 \clef "C"
c4 e c f | c g c a
```

From middle C, writing `g` after `c` selects the nearer G (the one below, a fourth down) rather than jumping up a fifth. This rule reduces unintended octave jumps.

### Octave markers

Use octave markers to force larger leaps:

| Marker | Effect |
|--------|--------|
| `'` (apostrophe) | Raise one octave |
| `,` (comma) | Lower one octave |

```lilylet
\time 4/4
c4 c' c' c' | c,,, c'' c, c'
```

```lilylet
\time 4/4
c4 g' c g | c' g e c
```

### Newlines reset pitch (Lilylet-specific)

Different from LilyPond: inserting a **line break** (newline) resets the relative-pitch reference to **middle C**. This is useful when your Markdown is organized as "one line = one bar/phrase", because moving or inserting lines won't unexpectedly shift later octaves.

```lilylet
\time 4/4
c4 d e f | g a b c |
c4 b a g | f e d c |
```

If you want the second line to start higher, specify it explicitly:

```lilylet
\time 4/4
c4 d e f | g a b c |
c'4 b a g | f e d c |
```

#### Why Lilylet differs from LilyPond here

Unlike LilyPond's typical workflow of writing an entire voice from start to finish, Lilylet favors interleaved, measure-by-measure voice entry: write all voices for a measure before advancing to the next. This makes multi-voice alignment and live editing simpler, and ensures relative-pitch decisions (octave choice, small-interval preference) are resolved locally within each measure.

Resetting the pitch reference on newlines keeps short snippets stable when copied, reordered, or edited inside a Markdown document. Long, continuous monophonic lines remain supported but are primarily useful for educational examples; in practical Lilylet usage, prefer short, interleaved voice segments for clearer notation and more predictable rendering.

---

## Rhythms and Durations

### Duration values

Append a number to a note name:

| Number | Duration | Name |
|--------|----------|------|
| 1 | Whole note | Semibreve |
| 2 | Half note | Minim |
| 4 | Quarter note | Crotchet |
| 8 | Eighth note | Quaver |
| 16 | Sixteenth note | Semiquaver |
| 32 | Thirty-second note | Demisemiquaver |
| 64 | Sixty-fourth note | Hemidemisemiquaver |

```lilylet
\time 4/4
g'1 | g2 g2 | g4 g4 g4 g4 | g8 g8 g8 g8 g8 g8 g8 g16 g32 g64 g128 g128\rest |
```

### Duration persistence

If you omit the duration, Lilylet reuses the previous one:

```lilylet
\time 4/4
c4 d e f | g a b c
```

### Dotted notes

Add dots after the duration:

| Notation | Duration |
|----------|----------|
| `c4.` | Dotted quarter |
| `c2.` | Dotted half |
| `c4..` | Double-dotted quarter |

```lilylet
\time 6/8
c4. d4. | e8 e e f4.
```

```lilylet
\time 12/8
c2. e | g8. g16 g4.. g16
```

---

## Rests

### Basic rests

Use `r` plus a duration:

```lilylet
\time 4/4
c4 r4 e4 r4 | g2 r2
```

### Full-measure rests

Use `R` for a centered full-measure rest (display style), while duration may vary:

```lilylet
\time 4/4
R1 | g'4 a b c
```

```lilylet
\time 3/4
R2. | c4 d e
```

### Space rests (invisible)

Use `s` to reserve rhythmic space without printing a rest (common in multi-voice alignment):

```lilylet
\time 4/4 \clef "bass"
r4 d, b b \\
s4 g,2 e4
```

---

## Accidentals

Lilylet uses LilyPond's English pitch spelling:
- `s` for sharp
- `f` for flat

| Notation | Meaning |
|----------|---------|
| `cs` | C sharp |
| `cf` | C flat |
| `ds` | D sharp |
| `ef` | E flat |

```lilylet
\time 4/4
c4 cs d ds | e f fs g | gs a as b | c1
```

Double accidentals:
- `ss` double-sharp
- `ff` double-flat

```lilylet
\time 4/4
c4 css d dff | e1
```

```lilylet
\key e \minor
\time 4/4
e4 fs g a | b cs ds e | e d c b | a g fs e
```

---

## Key and Time Signatures

### Time signature: `\time`

```lilylet
\time 3/4
c4 d e | f g a | b c d | e2.
```

Common meters:

```lilylet
\time 4/4
c4 d e f | g1
```

```lilylet
\time 3/4
c4 d e | f2.
```

```lilylet
\time 6/8
c4. d | e4. f
```

```lilylet
\time 2/2
c2 d | e f | g1
```

### Key signature: `\key`

Use `\key` + tonic + mode:

```lilylet
\key g \major
\time 4/4
g4 a b c | d e fs g
```

```lilylet
\key d \minor
\time 4/4
d4 e f g | a bf cs d
```

More examples:

```lilylet
\key c \major
\time 4/4
c4 d e f | g a b c
```

```lilylet
\key f \major
\time 4/4
f4 g a bf | c d e f
```

```lilylet
\key a \minor
\time 4/4
a4 b c d | e f gs a
```

### Clef: `\clef`

```lilylet
\clef "bass"
\time 4/4
c,4 d e f | g a b c
```

```lilylet
\clef "alto"
\time 4/4
c4 d e f | g a b c
```

Supported clefs: `treble`, `bass`, `alto`

---

## Barlines

By default, Lilylet uses standard single barlines `|` to separate measures. For special barlines, use the `\bar` command.

### Barline types

| Notation | Meaning |
|----------|---------|
| `\bar "\|\|"` | Double barline |
| `\bar "\|."` | Final barline (end of piece) |
| `\bar ":\|."` | End repeat |
| `\bar ".\|:"` | Start repeat |

```lilylet
\time 4/4
c4 d e f \bar "||" | g a b c
```

```lilylet
\time 4/4
c4 d e f | g a b c \bar "|."
```

### Repeat barlines

```lilylet
\time 4/4
c4 d e f \bar ".|:" | g a b c | d e f g \bar ":|."
```

---

## Chords

### Basic chords

Enclose pitches in angle brackets `< >`:

```lilylet
\time 4/4
<c e g>4 <d f a> <e g b> <f a c> | <g b d>1
```

### Progressions / texture examples

```lilylet
\time 4/4
<c e g>2 <f, a c> | <g b d> <c e g> | <c e g>1
```

```lilylet
\time 4/4
<cs e a cs>4 \arpeggio <b d g b>2. \arpeggio | <a cs e a>1 \arpeggio
```

**Note**: only the first pitch in a chord will pass the relative pitch base to next music event. And inside a chord, pitches also follow relative pitch rules.

```
Example: <c e g>  <d f a>  <e g b>

         Chord 1      Chord 2      Chord 3
           g            a            b
           ↓            ↓            ↓
           e            f            g      (relative to previous pitch in chord)
           ↓            ↓            ↓
           c ←───────── d ←───────── e      (relative pitch bass passing by the root pitch in chords)
```

### Chord duration

The duration applies to the entire chord:

```lilylet
\time 4/4
<c e g>4 <c e g>8 <c e g>8 <c e g>2
```

### Chord symbols (lead sheet style)

Use `\chords "symbol"` to add chord symbols above the staff, commonly used in lead sheets and jazz charts:

```lilylet
\time 4/4
c'4 \chords "C" e g c | a, \chords "Am" c e a
```

```lilylet
\time 4/4
c'4 \chords "Cmaj7" d e f | g \chords "G7" a b c
```

---

## Articulations

Lilylet supports LilyPond-style commands and common shorthand:

| Command | Shorthand | Name |
|---------|-----------|------|
| `\staccato` | `-.` or `.` | Staccato |
| `\tenuto` | `--` or `-` | Tenuto |
| `\accent` | `->` or `>` | Accent |
| `\marcato` | `-^` or `^` | Marcato |
| `\staccatissimo` | `-!` or `!` | Staccatissimo |
| `\portato` | `-_` or `_` | Portato |

**Dot warning (`.`):**
- After a duration number: `c4.` = dotted rhythm
- As an articulation: `c4-.` or `c.` = staccato

```lilylet
\time 4/4
c4-. d-. e-. f-. | g4\staccato a\staccato b\staccato c\staccato
```

```lilylet
\time 4/4
c4\staccato d\tenuto e\accent f\marcato | g4-. a-- b-> c-^
```

### Placement (above/below)

Prefix the articulation with:
- `^` above
- `_` below

```lilylet
\time 4/4
c4^. d_. e^> f_>
```

---

## Fingering

Use `-1` through `-5` to add fingering numbers to notes, commonly used in piano and guitar music:

```lilylet
\time 4/4
c'4-1 d-2 e-3 f-4 | g-5 a-3 b-2 c-1
```

Fingering can also be applied to chords:

```lilylet
\time 4/4
<c e c'>2-1-2-5 <e g c>-2-3-5 | <e g b>-1-2-4 <f a c>-1-2-3
```

### Fingering placement

Use `^` for above or `_` for below.

```lilylet
\time 4/4
c'4^1 d^2 e^3 f^4 | g_5 a_3 b_2 c_1
```

---

## Dynamics

### Dynamic markings

| Notation | Meaning |
|----------|---------|
| `\ppp` | Pianississimo |
| `\pp` | Pianissimo |
| `\p` | Piano |
| `\mp` | Mezzo-piano |
| `\mf` | Mezzo-forte |
| `\f` | Forte |
| `\ff` | Fortissimo |
| `\fff` | Fortississimo |
| `\sfz` | Sforzando |

```lilylet
\time 4/4
c4\pp d e f | g\mf a b c | d\f e f g | a\ff b c d\sfz
```

### Hairpins (crescendo/diminuendo)

| Notation | Meaning |
|----------|---------|
| `\<` | Start crescendo |
| `\>` | Start diminuendo |
| `\!` | End hairpin |

```lilylet
\time 4/4
c4\< d e f | g a b c\!
```

```lilylet
\time 4/4
c'4\> b a g | f e d c\!
```

```lilylet
\time 4/4
c4\pp\< d e f | g\mf a b c | d e f g\! | a\ff\> b a g | f\p\! e d c
```

---

## Slurs, Ties, and Beams

### Slurs

Use `(` to start and `)` to end:

```lilylet
\time 4/4
c4( d e f) | g( a b c) | c( b a g) | f1
```

### Ties

Use `~` between the same pitch:

```lilylet
\time 4/4
c2~ c4 d | e2~ e4 f | g1~ | g2 r2
```

```lilylet
\time 4/4
c4 d8~ d c4 d | e8~ e d4~ d e | f2~ f4 g | a1
```

### Beams

Use `[` and `]`:

```lilylet
\time 4/4
c8[ d e f] g[ a b c] | c[ b a g] f4 r
```

```lilylet
\time 6/8
c8[ d e] f[ g a] | b[ c d] e4.
```

**Note**: As in LilyPond, `(` `)` `[` `]` are postfixes on musical events, not scope delimiters.

### Auto-Beam

By default, Lilylet automatically groups eighth notes and shorter into beams following standard engraving rules (e.g., beam by beat in 4/4, by dotted-quarter groups in 6/8). This means you often don't need manual `[`/`]` at all—notes will be beamed correctly for the current time signature.

Auto-beam activates automatically when no manual beam marks exist in the score. If you add any `[`/`]` marks, auto-beam is disabled to respect your explicit beaming.

You can control this behavior with the `[auto-beam]` metadata header:

| Setting | Effect |
|---------|--------|
| `[auto-beam "auto"]` | Default. Auto-beam if no manual beams exist |
| `[auto-beam "on"]` | Always auto-beam (even if manual beams exist) |
| `[auto-beam "off"]` | Never auto-beam; only use manual `[`/`]` beams |

```lilylet
[auto-beam "auto"]
\time 4/4 \clef "treble"
c8 d e f g a b c
```

Force auto-beam on alongside manual beams:

```lilylet
[auto-beam "on"]
\time 6/8 \clef "treble"
c8[ d e] f g a
```

Disable auto-beam entirely:

```lilylet
[auto-beam "off"]
\time 4/4 \clef "treble"
c8 d e f g a b c
```

---

## Ornaments

| Notation | Name |
|----------|------|
| `\trill` | Trill |
| `\turn` | Turn |
| `\mordent` | Mordent |
| `\prall` | Pralltriller |
| `\fermata` | Fermata |
| `\shortfermata` | Short fermata |
| `\arpeggio` | Arpeggio (for chords) |

```lilylet
\time 4/4
c2\trill d | e4\trill f g2 | a1\trill
```

```lilylet
\time 4/4
c4 d e f | g2\fermata r2 | a4 b c d | e1\fermata
```

```lilylet
\time 4/4
<c e g>2\arpeggio <d f a>\arpeggio | <e g b>1\arpeggio
```

---

## Grace Notes

Use `\grace` before a note or a group:

```lilylet
\time 4/4
\grace d16 c4 e g c | \grace { b,16 c } d4 f a d
```

```lilylet
\time 4/4
\grace e16 d4 f a d | \grace fs16 g4 b d g
```

```lilylet
\time 4/4
\grace { c16[ d e] } f4 a c f | \grace { g16[ a] } b4 d f b
```

---

## Tuplets

Use `\times numerator/denominator { notes }`:

```lilylet
\time 4/4
\times 2/3 { c4 d e } \times 2/3 { f g a } | b2 c
```

```lilylet
\time 4/4
c4 \times 2/3 { d8[ e f] } g4 \times 2/3 { a8[ b c] } | d1
```

```lilylet
\time 4/4
\times 4/5 { c8[ d e f g] } \times 4/5 { a[ b c d e] } | f1
```

---

## Tremolo

### Single-note tremolo

Use `:` followed by the tremolo division:

```lilylet
\time 4/4
c2:16 d:16 | e1:32
```

### Two-note tremolo

Use `\repeat tremolo`:

```lilylet
\time 4/4
\repeat tremolo 4 { c16 e } \repeat tremolo 4 { d f } | <c e g>1
```

---

## Multiple Voices

### Voice separator: `\\`

Use `\\` to separate voices on the same staff:

```lilylet
\time 4/4 \stemUp c'2 d \\
\stemDown g2 a | % 1

\stemUp e'2 f \\
\stemDown b2 c | % 2
```

```lilylet
\time 4/4 \stemUp e'4 d c b \\
\stemDown c4 g a e | % 1

\stemUp c'2 b \\
\stemDown f2 g | % 2

\stemUp c'1 \\
\stemDown c1 | % 3
```

### Stem direction

| Command | Effect |
|---------|--------|
| `\stemUp` | Force stems up |
| `\stemDown` | Force stems down |

---

## Multiple Staves

### Staff assignment: `\staff "N"`

```lilylet
\time 4/4
\staff "1" \clef "treble" c'4 e g c \\
\staff "2" \clef "bass" c4 g c g | % 1

\staff "1" d'4 f a d \\
\staff "2" d4 a d a | % 2
```

### Part separator: `\\\` (triple backslash)

Use `\\\` to separate different staves/parts:

```lilylet
\staff "1" \time 4/4 \clef "treble" c'4 d e f \\
\staff "2" \clef "treble" r4 g' r g \\\
\clef "bass" <c, g' c>1 ~ | % 1

\staff "1" g'1 \\
\staff "2" r4 c r c \\\
<c, g' c>1 | % 2
```

### Staff groups: `[staves "..."]`

`\staff "N"` assigns notes to a staff, but it does not say how those staves are *grouped* on the page (a piano grand staff with a brace, a string section with a bracket, etc.). The `[staves "..."]` header declares that grouping. Each leaf in the layout string is one staff, in order; brackets group them and the connector between two leaves sets the barline join:

| Symbol | Meaning |
|--------|---------|
| `{ }` | Brace group (typical piano grand staff) |
| `< >` | Bracket group (instrument family, e.g. strings) |
| `[ ]` | Square-bracket group |
| `,` | Blank join (staves not barline-connected) |
| `-` | Solid join (barlines run through) |
| `.` | Dashed join |

Leaf names (`pl`, `va`, …) are optional ids you can reference from `[instrument-...]`; an empty slot is an anonymous staff numbered `1`, `2`, …

```lilylet
[staves "{pl-pr} <va-vc>"]
\staff "1" \clef "treble" c1 \\
\staff "2" \clef "bass" c,1 \\\
\clef "C" e1 \\\
\clef "bass" c,1 |
```

Here `{pl-pr}` braces the first two staves into a grand staff and `<va-vc>` brackets the next two — four staves in two groups.

### Instrument names: `[instrument-<key> "Name" "Short"]`

Attach an instrument label to a staff or a whole group. `<key>` is a staff id (or an id range like `pl-pr`) from the `[staves]` layout, so the name lands at the right level: a single id labels one staff, a range labels the group. The short name (second string) is optional and shows on later systems.

```lilylet
[staves "{pl-pr} <va-vc>"]
[instrument-pl-pr "Piano"]
[instrument-va "Viola" "Va."]
[instrument-vc "Cello" "Vc."]
\staff "1" \clef "treble" c1 \\
\staff "2" \clef "bass" c,1 \\\
\clef "C" e1 \\\
\clef "bass" c,1 |
```

`[instrument-pl-pr "Piano"]` names the braced grand-staff group once, while `va` and `vc` get their own names plus abbreviations.

---

## Advanced Features

### Tempo markings

```lilylet
\tempo "Allegro" 4=120
\time 4/4
c4 d e f | g a b c
```

```lilylet
\tempo "Andante" 4=72
\time 3/4
c4 e g | c2.
```

### Ottava (octave transposition)

```lilylet
\time 4/4
c''4 d e f | \ottava #1 g a b c | b a g f | \ottava #0 e d c2
```

### Navigation marks

Use `\segno` and `\coda` to add navigation symbols to your score:

| Notation | Symbol | Meaning |
|----------|--------|---------|
| `\segno` | 𝄋 | Segno (repeat from here) |
| `\coda` | 𝄌 | Coda (jump to ending) |

```lilylet
\time 4/4 \clef "treble"
c4\segno d e f | g a b c | d e f g\coda | a b c d
```

### Pedal markings

```lilylet
\time 4/4
c4\sustainOn e g c\sustainOff | d\sustainOn fs a d\sustainOff |
```

### Text markup

Use `\markup "text"` to add text annotations to your score. Control placement with `^` (above) or `_` (below):

```lilylet
\time 4/4
c'4 \markup "dolce" d e f | g a b c
```

```lilylet
\time 4/4
c'4^\markup "espressivo" d e f | g_\markup "cantabile" a b c
```

Markup is useful for expressive indications, technique instructions, or any text that doesn't fit standard dynamic or tempo markings.

### Metadata headers

Put metadata at the top of a snippet. This works well in Markdown collections (handouts, chapters, indexes).

```lilylet
[title "Minuet in G"]
[subtitle "BWV-114"]
[composer "J.S. Bach"]

\key g \major \time 3/4 \clef "treble" \stemDown d'4(\p \stemUp g,8[ a b c] | \stemDown d4) \stemUp g, g
```

### Repeat & performance order: `[measures "..."]`

Repeat barlines (`\bar ":|."`) show *where* a repeat is, but `[measures "..."]` declares the actual *playback order* of measures — which bars are repeated, and in what sequence. It compiles to an MEI `<expansion>`, so the score still prints compactly while MIDI playback unfolds the repeats.

By default the layout is **index-wise**: each leaf is a 1-based measure number. The building blocks are:

| Construct | Meaning |
|-----------|---------|
| `N` | Play measure `N` |
| `A..B` | Inclusive range, e.g. `1..8` |
| `[ ... ]` | A block (grouping) |
| `N*[body]` | Play `body` `N` times |
| `N*[body]{alt1, alt2}` | Volta: repeat `body`, taking a different ending each pass |
| `<main, rest>` | ABA / da capo: play `main`, then `rest`, then `main` again |

A simple two-pass volta — measures 1–4 repeat, with bar 5 as the first ending and bar 6 as the second (performed order `1 2 3 4 5 | 1 2 3 4 6`):

```lilylet
[measures "2*[1..4]{5,6}"]
c1 | d1 | e1 | f1 | g1 | a1 |
```

A da-capo (ABA) form — section A (1–4), section B (5–8), then A again (performed order `1 2 3 4 | 5 6 7 8 | 1 2 3 4`):

```lilylet
[measures "<[1,2,3,4],[5,6,7,8]>"]
c1 | d1 | e1 | f1 | g1 | a1 | b1 | c1 |
```

A leading `s:` switches to **segment-wise** mode, where leaves are segment *lengths* instead of indices (e.g. `s: 2*[4]` repeats the first 4-bar segment) — handy when you think in phrase lengths rather than bar numbers.

---

## Complete Examples

### Example 1: Simple Melody

```lilylet
[title "Twinkle Twinkle"]

\time 4/4
c4 c g' g | a a g2 | f4 f e e | d d c2 | g'4 g f f | e e d2 | g4 g f f | e e d2 | c4 c g' g | a a g2 | f4 f e e | d d c2 \bar "|."
```

### Example 2: Piano Style with Chords

```lilylet
[title "Simple Waltz"]

\key g \major
\time 3/4
\stemUp d'4 g b \\ \stemDown <g b>4 <g b> <g b> |
\stemUp d'4 a c' \\ \stemDown <fs a>4 <fs a> <fs a> |
\stemUp d'4 g b \\ \stemDown <g b>4 <g b> <g b> |
\stemUp d'2. \\ \stemDown <g b d'>2.
```

### Example 3: With Dynamics and Articulations

```lilylet
[title "Expressive Melody"]

\time 4/4
c4\p( d e f) | g2\< a | b4\mf\> a g f | e2\p d | c4\pp( e g c) | c2.\fermata r4
```

### Example 4: Two-Staff Piano Score

Expressive etude in E Major with complex texture.

```lilylet
[title "Etude in E Major (excerpt)"]
[subtitle "Tristesse"]
[composer "Chopin"]

\staff "1" \key e \major \time 2/4 \clef "treble" \stemUp b8\p \\
\staff "2" \clef "bass" g8\rest | %1

\staff "1" \clef "treble" \stemUp e8[ ds16 e] fs4~ \\
\staff "1" \clef "treble" s4 \stemDown ds~ \\
\staff "2" \stemUp \clef "bass" e,,4 b \\
\staff "2" \stemDown \clef "bass" e,,16[ b'8 b16] b,[ b'8 b16] \\
\staff "2" \stemUp \clef "bass" gs16[ b gs b] a[ b a b] | %2

\staff "1" \clef "treble" \stemUp fs16([ gs] gs[ fs)] gs4~ \\
\staff "1" \clef "treble" \stemDown ds8[ ds] e4 \\
\staff "2" \clef "bass" \stemUp b,,4 e \\
\staff "2" \clef "bass" \stemDown b,,16[ b'8 b16] e,[ b'8 b16] \\
\staff "2" \clef "bass" \stemUp a16[ b a b] gs[ b gs b] | %3

\staff "1" \clef "treble" \stemUp gs'16([ a] a[ gs)] cs8.([ b16] \\
\staff "1" \clef "treble" \stemDown gs16[ e' b e] ds[ a' b, ds] \\
\staff "2" \clef "bass" \stemDown e,,16[ b'8 b16] b,[ b'8 b16] \\
\staff "2" \clef "bass" \stemUp e,,4 b | %4

\staff "1" \clef "treble" \stemUp a'16[ gs ds e)] fs4~ \\
\staff "1" \clef "treble" \stemDown b16[ e gs, b] \stemUp <a cs>[ <b ds> <a cs> <b ds>] \\
\staff "2" \clef "bass" \stemDown e,,16[ b'8 b16] b,[ b'8 b16] \\
\staff "2" \clef "bass" \stemUp e,,4 b | %5

\staff "1" \clef "treble" \stemUp fs16([ gs] gs[ fs)] e4 \\
\staff "2" \clef "bass" \stemUp b,,4 e \\
\staff "2" \clef "bass" \stemDown b,,16[ b'8 b16] e,[ b'8 b16] \\
\staff "2" \clef "bass" \stemUp <a cs>16[ <b ds>] <a cs>[ <b ds>] gs[ b gs b] | %6

\staff "1" \clef "treble" \stemUp gs'16([ a fs gs] a[ b gs a)] \\
\staff "1" \stemDown \clef "treble" d16[ e d e] cs[ e cs e] \\
\staff "2" \clef "bass" \stemDown e,,16[ e'8 e16] a,[ e'8 e16] \\
\staff "2" \clef "bass" \stemUp e,,4 a | %7

\staff "1" \clef "treble" \stemUp cs'8 fs,4 \stemUp \grace as8( \stemUp gs16)([ fs)]~ \\
\staff "1" \clef "treble" \stemDown cs16[ e cs e] b[ e b e] \\
\staff "2" \clef "bass" \stemDown a,16[ fs'8 fs16] b,[ fs'8 fs16] \\
\staff "2" \clef "bass" \stemUp a,4 b | %8
```

### Example 5: Baroque Style

Complex contrapuntal writing with three independent voices.

```lilylet
[title "Sinfonia No.1 C Major (excerpt)"]
[arranger "BWV787"]

\staff "1" \key c \major \time 4/4 \clef "treble" g'16\rest \stemUp g([ a b] \stemDown c[ d e f] g[ f g a] f[ a g f] \\
\staff "2" \clef "bass" \stemUp c,4 d8 \stemDown c'( b[ g] a[ b] | %1

\staff "1" \stemUp \clef "treble" e'2)~ e4 fs( \\
\staff "1" \clef "treble" g'16 \stemUp c,[ d e] f[ \stemDown g a b] c[ b c d] c[ e d c] \\
\staff "2" \clef "bass" \stemDown c4)( c8\rest b a[ g] a)[ d,(] | %2

\staff "1" \clef "treble" \stemUp g''8[ f] e4 d8[ e16 f] d4~ \\
\staff "1" \clef "treble" \stemDown b'8([ d]~ d[ c]~ c4 b~ \\
\staff "2" \clef "bass" \stemDown g,16)[ g'( a b] \clef "treble" \stemUp c[ d e f] g[ f g a] f[ a g f] | %3

\staff "1" \clef "treble" \stemUp d'8\f[ g16 f] e4)~ e8[ e] d4~ \\
\staff "1" \clef "treble" \stemDown b'4) g16 d'([ c b] a4.) a8( \\
\staff "2" \clef "treble" \stemUp e16)[ f( e d] \clef "bass" \stemDown c[ b a g] f[ g f e] f[ d e f] | %4
```

### Example 6: Modern Rhythms

```lilylet
[title "Syncopated"]

\time 4/4
c4. d8~ d4 e | f8 g4 a8~ a4 b | c8\< d4 e8 f4 g | a\ff\> g8 f~ f4\p r
```

---

## Practical Writing Tips

1. **Put setup first**: start each snippet/section with `\time`, `\key`, `\clef` so the fragment is portable in Markdown.
2. **Write in short lines**: one bar/phrase per line works well with Lilylet's newline pitch reset and reduces "octave drift".
3. **Use duration persistence**: set the rhythmic unit once (e.g., `c4`) and omit repeated numbers to keep lines readable.
4. **Add octave markers only when needed**: let relative pitch handle defaults; use `'`/`,` for intentional wide leaps.
5. **Align voices with `s`**: in multi-voice examples, place invisible rests to lock rhythm before adding details.

---

*This tutorial covers Lilylet's core notation features. For rarer engraving cases and deeper notation concepts, the corresponding sections of the [LilyPond documentation](https://lilypond.org/doc/) are often helpful, since Lilylet follows similar command conventions.*
