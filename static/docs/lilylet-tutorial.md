# Lilylet Language Tutorial

A comprehensive guide to writing music notation with Lilylet, a simplified music notation language inspired by [LilyPond](https://lilypond.org/).

## Table of Contents

1. [Introduction](#introduction)
2. [Writing Pitches](#writing-pitches)
3. [Rhythms and Durations](#rhythms-and-durations)
4. [Rests](#rests)
5. [Accidentals](#accidentals)
6. [Key and Time Signatures](#key-and-time-signatures)
7. [Chords](#chords)
8. [Articulations](#articulations)
9. [Dynamics](#dynamics)
10. [Slurs, Ties, and Beams](#slurs-ties-and-beams)
11. [Ornaments](#ornaments)
12. [Grace Notes](#grace-notes)
13. [Tuplets](#tuplets)
14. [Tremolo](#tremolo)
15. [Multiple Voices](#multiple-voices)
16. [Multiple Staves](#multiple-staves)
17. [Advanced Features](#advanced-features)
18. [Complete Examples](#complete-examples)

---

## Introduction

Lilylet is a text-based music notation language designed for quick and intuitive music entry. It uses a simplified syntax inspired by LilyPond, making it easy to write music without complex boilerplate code.

**Key Features:**
- Simple, readable syntax
- Relative pitch mode (notes are relative to the previous note)
- Support for common music notation elements
- Renders to standard music notation via MEI/Verovio
- LilyPond-compatible commands (`\time`, `\key`, `\clef`, dynamics, articulations, etc.)

**Your First Score:**

```lilylet
\time 4/4 \clef "treble"
c4 d e f | g2 g | a4 a a a | g1
```

This creates a simple melody in C major with quarter notes, half notes, and a whole note.

---

## Writing Pitches

### Note Names

Lilylet uses lower letters a-g to denote pitches:

**Example - C Major Scale:**

```lilylet
\time 4/4
c4 d e f | g a b c
```

### Relative Pitch Mode

Lilylet always uses relative pitch (like LilyPond). If a note has no octave marker, its octave is chosen so the interval from the previous note is less than a fifth.
The reference pitch is middle C (C4); each note is interpreted relative to the previous one.

**Example - How Relative Mode Works:**

```lilylet
\time 4/4
c4 d e f | g a b c | c b a g | f e d c
```

In this example:
- `c d e f` - each note is a second above the previous, staying in the same octave
- `f` to `g` - a second up
- `g a b c` - continues ascending; from `b` to `c` is a second up, so we reach C5
- `c b a g` - descending by seconds from C5
- `f e d c` - continues descending back to middle C

**Example - Why Fifths Matter:**

```lilylet
\time 4/4
c4 g c g | c e g c
```

From middle C, writing `g` gives the G *below* (a fourth down), not the G above (which would be a fifth up). The rule keeps intervals small.

### Octave Markers

When you need to jump more than a fourth, use octave markers:

| Marker | Effect |
|--------|--------|
| `'` (apostrophe) | Raise one octave |
| `,` (comma) | Lower one octave |

**Example - Using Octave Markers:**

```lilylet
\time 4/4
c4 c' c' c' | c,,, c'' c, c'
```

**Example - Wide Leaps:**

```lilylet
\time 4/4
c4 g' c g, | c' e g c
```

Here `g'` explicitly jumps up a fifth, and `g,` explicitly drops down.

### Line Breaks Reset Pitch

Different from lilypond, when you insert a **line break** (newline character), the pitch base resets to **middle C**. This is unique to Lilylet:

```lilylet
\time 4/4
c4 d e f | g a b c |
c4 d e f | g a b c |
```

Both lines produce the same ascending pattern because each starts fresh from middle C.

**With explicit octave on second line:**

```lilylet
\time 4/4
c4 d e f | g a b c |
c'4 b a g | f e d c |
```

The `c'` on line 2 starts from C5 (since the line break reset to middle C, we need `'` to reach C5).

#### Why we import this discrimination against lilypond?

Unlike LilyPond’s typical workflow of writing an entire voice from start to finish,
Lilylet favors interleaved, measure‑by‑measure voice entry: write all voices for a measure before advancing to the next.
This makes multi‑voice alignment and live editing simpler and ensures relative‑pitch decisions (octave choice, small‑interval preference) are resolved locally within each measure.
Long, continuous monophonic lines remain supported but are primarily useful for educational examples;
in practical Lilylet usage, prefer short, interleaved voice segments for clearer notation and more predictable rendering.

---

## Rhythms and Durations

### Duration Values

Durations are specified by numbers after the note name:

| Number | Duration | Name |
|--------|----------|------|
| 1 | Whole note | Semibreve |
| 2 | Half note | Minim |
| 4 | Quarter note | Crotchet |
| 8 | Eighth note | Quaver |
| 16 | Sixteenth note | Semiquaver |
| 32 | Thirty-second note | Demisemiquaver |
| 64 | Sixty-fourth note | Hemidemisemiquaver |

**Example - Different Durations:**

```lilylet
\time 4/4
g'1 | g2 g2 | g4 g4 g4 g4 | g8 g8 g8 g8 g8 g8 g8 g16 g32 g64 g128 g128\rest |
```

### Duration Persistence

If you omit the duration, the previous duration is used:

```lilylet
\time 4/4
c4 d e f | g a b c
```

All notes here are quarter notes because `c4` sets the duration.

### Dotted Notes

Add a dot (`.`) after the duration to extend it by half:

| Notation | Duration |
|----------|----------|
| `c4.` | Dotted quarter (= quarter + eighth) |
| `c2.` | Dotted half (= half + quarter) |
| `c4..` | Double-dotted quarter |

**Example - Dotted Rhythms:**

```lilylet
\time 6/8
c4. d4. | e8 e e f4.
```

**Example - Compound Meter:**

```lilylet
\time 12/8
c2. e | g8. g16 g4.. g16
```

---

## Rests

### Basic Rests

Use `r` followed by a duration for rests:

```lilylet
\time 4/4
c4 r4 e4 r4 | g2 r2
```

### Full Measure Rests

Use `R` for full-measure rests (displayed centered in the measure):

```lilylet
\time 4/4
R1 | g4 a b c
```

`R` always displayed as a full rest, but it can has different durations internally:

```lilylet
\time 3/4
R2. | c4 d e
```

### Space Rests (Invisible)

Use `s` for invisible rests (useful in multi-voice notation):

```lilylet
\time 4/4 \clef "bass"
r4 d b b \\
s4 g2 e4
```

---

## Accidentals

### Sharps and Flats

Lilylet use the English dialect of lilypond for pitches and accidentals.
Add `s` for sharp, `f` for flat after the note name:

| Notation | Meaning |
|----------|---------|
| `cs` | C sharp |
| `cf` | C flat |
| `ds` | D sharp |
| `ef` | E flat |

**Example - Chromatic Scale:**

```lilylet
\time 4/4
c4 cs d ds | e f fs g | gs a as b | c1
```

### Double Accidentals

Use `ss` for double-sharp, `ff` for double-flat:

```lilylet
\time 4/4
c4 css d dff | e1
```

**Example - E Minor Melodic Scale:**

```lilylet
\key e \minor
\time 4/4
e4 fs g a | b cs ds e | e d c b | a g fs e
```

---

## Key and Time Signatures

### Time Signature

Use `\time` followed by the meter:

```lilylet
\time 3/4
c4 d e | f g a | b c d | e2.
```

**Common Time Signatures:**

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

### Key Signature

Use `\key` followed by the root note and mode:

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

**Key Signature Examples:**

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

### Clef

Use `\clef` to specify the clef:

```lilylet
\clef "bass"
\time 4/4
c4 d e f | g a b c'
```

Supported clefs: `treble`, `bass`, `alto`

---

## Chords

### Basic Chords

Enclose multiple pitches in angle brackets `< >`:

```lilylet
\time 4/4
<c e g>4 <d f a> <e g b> <f a c> | <g b d>1
```

### Chord Progressions

**Example - I-IV-V-I Progression:**

```lilylet
\time 4/4
<c e g>2 <f, a c> | <g, b d> <c e g> | <c e g>1
```

**Example - Arpeggiated Chords:**

```lilylet
\time 4/4
<cs e a cs>4 \arpeggio <b d g b>2. \arpeggio | <a cs e a>1 \arpeggio
```

### Chord with Different Durations

The duration applies to the entire chord:

```lilylet
\time 4/4
<c e g>4 <c e g>8 <c e g>8 <c e g>2
```

---

## Articulations

### Common Articulations

Lilylet supports both LilyPond-style commands and shorthand notation:

| Command | Shorthand | Name | Symbol |
|---------|-----------|------|--------|
| `\staccato` | `-.` or `.` | Staccato | Dot |
| `\tenuto` | `--` or `-` | Tenuto | Line |
| `\accent` | `->` or `>` | Accent | > |
| `\marcato` | `-^` or `^` | Marcato | ^ |
| `\staccatissimo` | `-!` or `!` | Staccatissimo | Wedge |
| `\portato` | `-_` or `_` | Portato | Line + dot |

**Important:** The dot (`.`) has two meanings depending on position:
- After a **duration number** (e.g., `c4.`) = dotted rhythm
- After a **note without duration** or at end (e.g., `c4-.` or `c.`) = staccato articulation

**Example - Staccato with explicit syntax:**

```lilylet
\time 4/4
c4-. d-. e-. f-. | g4\staccato a\staccato b\staccato c\staccato
```

**Example - Mixed Articulations:**

```lilylet
\time 4/4
c4\staccato d\tenuto e\accent f\marcato | g4-. a-- b-> c-^
```

### Placement (Above/Below)

Use `^` or `_` before an articulation mark to force placement:
- `^` places the mark above the note
- `_` places the mark below the note

```lilylet
\time 4/4
c4^. d_. e^> f_>
```

---

## Dynamics

### Dynamic Markings

| Notation | Meaning |
|----------|---------|
| `\ppp` | Pianississimo (very very soft) |
| `\pp` | Pianissimo (very soft) |
| `\p` | Piano (soft) |
| `\mp` | Mezzo-piano (medium soft) |
| `\mf` | Mezzo-forte (medium loud) |
| `\f` | Forte (loud) |
| `\ff` | Fortissimo (very loud) |
| `\fff` | Fortississimo (very very loud) |
| `\sfz` | Sforzando (sudden accent) |

**Example - Dynamic Changes:**

```lilylet
\time 4/4
c4\pp d e f | g\mf a b c | d\f e f g | a\ff b c d
```

### Hairpins (Crescendo/Diminuendo)

| Notation | Meaning |
|----------|---------|
| `\<` | Start crescendo |
| `\>` | Start diminuendo |
| `\!` | End hairpin |

**Example - Crescendo:**

```lilylet
\time 4/4
c4\p\< d e f | g a b c\f
```

**Example - Diminuendo:**

```lilylet
\time 4/4
c'4\f\> b a g | f e d c\p
```

**Example - Full Dynamic Phrase:**

```lilylet
\time 4/4
c4\pp\< d e f | g\mf a b c | d\< e f g | a\ff\> b a g | f\p e d c
```

---

## Slurs, Ties, and Beams

### Slurs

Use `(` to start a slur and `)` to end it:

```lilylet
\time 4/4
c4( d e f) | g( a b c) | c( b a g) | f1
```

### Ties

Use `~` to tie notes of the same pitch:

```lilylet
\time 4/4
c2~ c4 d | e2~ e4 f | g1~ | g2 r2
```

**Example - Syncopation with Ties:**

```lilylet
\time 4/4
c4 d8~ d c4 d | e8~ e d4~ d e | f2~ f4 g | a1
```

### Beams

Use `[` to start a beam and `]` to end it:

```lilylet
\time 4/4
c8[ d e f] g[ a b c] | c[ b a g] f4 r
```

**Example - Custom Beaming:**

```lilylet
\time 6/8
c8[ d e] f[ g a] | b[ c d] e4.
```

**A Note**: the same as the grammar of lilypond, `(`, `)`, `[`, and `]` are used as postfixes on music events, not scope signs.

---

## Ornaments

### Available Ornaments

| Notation | Name |
|----------|------|
| `\trill` | Trill |
| `\turn` | Turn |
| `\mordent` | Mordent |
| `\prall` | Pralltriller |
| `\fermata` | Fermata |
| `\shortfermata` | Short fermata |
| `\arpeggio` | Arpeggio (for chords) |

**Example - Trills:**

```lilylet
\time 4/4
c2\trill d | e4\trill f g2 | a1\trill
```

**Example - Fermata:**

```lilylet
\time 4/4
c4 d e f | g2\fermata r2 | a4 b c d | e1\fermata
```

**Example - Arpeggiated Chords:**

```lilylet
\time 4/4
<c e g>2\arpeggio <d f a>\arpeggio | <e g b>1\arpeggio
```

---

## Grace Notes

### Grace Note Syntax

Use `\grace` before a note or group of notes:

```lilylet
\time 4/4
\grace d16 c4 e g c' | \grace { b,16 c } d4 f a d'
```

**Example - Appoggiatura Style:**

```lilylet
\time 4/4
\grace e16 d4 f a d | \grace fs16 g4 b d g
```

**Example - Multiple Grace Notes:**

```lilylet
\time 4/4
\grace { c16[ d e] } f4 a c f | \grace { g16[ a] } b4 d f b
```

---

## Tuplets

### Triplets and Other Tuplets

Use `\times numerator/denominator { notes }`:

**Example - Triplets:**

```lilylet
\time 4/4
\times 2/3 { c4 d e } \times 2/3 { f g a } | b2 c
```

**Example - Eighth Note Triplets:**

```lilylet
\time 4/4
c4 \times 2/3 { d8 e f } g4 \times 2/3 { a8 b c } | d1
```

**Example - Quintuplets:**

```lilylet
\time 4/4
\times 4/5 { c8 d e f g } \times 4/5 { a b c d e } | f1
```

---

## Tremolo

### Single-Note Tremolo

Use `:` followed by the tremolo division:

```lilylet
\time 4/4
c2:16 d:16 | e1:32
```

### Two-Note Tremolo

Use `\repeat tremolo`:

```lilylet
\time 4/4
\repeat tremolo 4 { c16 e } \repeat tremolo 4 { d f } | <c e g>1
```

---

## Multiple Voices

### Voice Separator

Use `\\` to separate voices on the same staff:

```lilylet
\time 4/4 \stemUp c'2 d \\
\stemDown g2 a | % 1

\stemUp e'2 f \\
\stemDown b2 c | % 2
```

**Example - Two-Voice Counterpoint:**

```lilylet
\time 4/4 \stemUp e'4 d c b \\
\stemDown c4 g a e | % 1

\stemUp c'2 b \\
\stemDown f2 g | % 2

\stemUp c'1 \\
\stemDown c1 | % 3
```

### Stem Direction

| Command | Effect |
|---------|--------|
| `\stemUp` | Force stems up |
| `\stemDown` | Force stems down |

---

## Multiple Staves

### Staff Assignment

Use `\staff "N"` to assign notes to a specific staff:

```lilylet
\time 4/4
\staff "1" \clef "treble" c'4 e g c \\
\staff "2" \clef "bass" c4 g c g | % 1

\staff "1" d'4 f a d \\
\staff "2" d4 a d a | % 2
```

### Part Separator

Use `\\\` (triple backslash) to separate different staves/parts:

```lilylet
\staff "1" \time 4/4 \clef "treble" c'4 d e f \\
\staff "2" \clef "treble" r4 g' r g \\\
\clef "bass" <c, g' c>1 ~ | % 1

\staff "1" g'1 \\
\staff "2" r4 c r c\\\
<c, g' c>1 | % 2
```

---

## Advanced Features

### Tempo Markings

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

### Ottava (Octave Transposition)

```lilylet
\time 4/4
c4 d e f | \ottava #1 g a b c | d e f g | \ottava #0 a b c d
```

### Pedal Markings

```lilylet
\time 4/4
c4\sustainOn e g c | e g c g | e c g, e, | c,1\sustainOff
```

### Metadata Headers

Add metadata at the beginning of your score:

```lilylet
[title "Minuet in G"]
[composer "J.S. Bach"]

\key g \major
\time 3/4
d'4 g8 a b c | b4 a g
```

---

## Complete Examples

### Example 1: Simple Melody

```lilylet
[title "Twinkle Twinkle"]

\time 4/4
c4 c g g | a a g2 | f4 f e e | d d c2 | g4 g f f | e e d2 | g4 g f f | e e d2 | c4 c g g | a a g2 | f4 f e e | d d c2
```

### Example 2: Piano Style with Chords

```lilylet
[title "Simple Waltz"]

\key g \major
\time 3/4
\stemUp d'4 g' b' \\ \stemDown <g b>4 <g b> <g b> |
\stemUp d'4 a' c'' \\ \stemDown <fs a>4 <fs a> <fs a> |
\stemUp d'4 g' b' \\ \stemDown <g b>4 <g b> <g b> |
\stemUp d'2. \\ \stemDown <g b d'>2.
```

### Example 3: With Dynamics and Articulations

```lilylet
[title "Expressive Melody"]

\time 4/4
c4\p( d e f) | g2\< a | b4\mf\> a g f | e2\p d | c4\pp( e g c) | c2.\fermata r4
```

### Example 4: Two-Staff Piano Score

```lilylet
[title "Piano Exercise"]
[composer "Practice"]

\time 4/4
\staff "1" \clef "treble" \stemUp c'4 e' g' c'' | d''2 c'' \\
\staff "2" \clef "bass" c4 g c' g | g2 c' |

\staff "1" b'4 g' e' c' | d'2 c' \\
\staff "2" g4 e c g, | g,2 c
```

### Example 5: Baroque Style

```lilylet
[title "Baroque Prelude"]

\key d \minor
\time 4/4
d8[ f a d] f[ a d a] | f[ d a, f,] d,[ f, a, d] | \times 2/3 { e8 g bf } \times 2/3 { e g bf } e4 r | \grace cs16 d4 \grace e16 f4 \grace g16 a2
```

### Example 6: Modern Rhythms

```lilylet
[title "Syncopated"]

\time 4/4
c4. d8~ d4 e | f8 g4 a8~ a4 b | c8\< d4 e8 f4 g | a\ff\> g8 f~ f4\p r
```

---

## Quick Reference Card

### Notes
`c d e f g a b` - Note names
`cs ds es fs gs as bs` - Sharps
`cf df ef ff gf af bf` - Flats

### Durations
`1` whole, `2` half, `4` quarter, `8` eighth, `16` sixteenth
`.` dot, `..` double dot

### Octaves
`'` up, `,` down

### Measures
`|` bar line

### Chords
`<c e g>4` - C major chord, quarter note

### Articulations
`-.` staccato, `--` tenuto, `->` accent, `-^` marcato, `-!` staccatissimo
Or use commands: `\staccato`, `\tenuto`, `\accent`, `\marcato`, `\staccatissimo`

### Dynamics
`\pp \p \mp \mf \f \ff`
`\<` crescendo, `\>` diminuendo, `\!` end

### Slurs/Ties/Beams
`(` `)` slurs, `~` tie, `[` `]` beams

### Structure
`\\` voice separator, `\\\` staff separator

### Commands
`\key c \major`, `\time 4/4`, `\clef "treble"`, `\tempo "Allegro" 4=120`

---

## Tips for Effective Writing

1. **Start simple** - Begin with the melody, add complexity later
2. **Use duration persistence** - Set duration once, it carries forward
3. **Think in intervals** - Relative mode works best when you think about the distance between notes
4. **Use octave markers sparingly** - Only when jumping more than a fourth
5. **Add dynamics last** - Get the notes right first, then add expression
6. **Test frequently** - Use the live editor to hear your work as you write

---

*This tutorial covers the core features of Lilylet. For more advanced notation, consult the [LilyPond documentation](https://lilypond.org/doc/) which Lilylet's syntax is based upon.*
