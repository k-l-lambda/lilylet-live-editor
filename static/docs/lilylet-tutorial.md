# Lilylet Language Tutorial

A comprehensive guide to writing music notation with Lilylet, a simplified music notation language inspired by [LilyPond](https://lilypond.org/).

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Notes](#basic-notes)
3. [Relative Pitch and Line Breaks](#relative-pitch-and-line-breaks)
4. [Rhythms and Durations](#rhythms-and-durations)
5. [Rests](#rests)
6. [Accidentals](#accidentals)
7. [Octaves](#octaves)
8. [Key and Time Signatures](#key-and-time-signatures)
9. [Chords](#chords)
10. [Articulations](#articulations)
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
\time 4/4
c4 d e f | g2 g | a4 a a a | g1
```

This creates a simple melody in C major with quarter notes, half notes, and a whole note.

---

## Basic Notes

### Note Names

Lilylet uses the standard note letter names:

| Letter | Note |
|--------|------|
| c | C (Do) |
| d | D (Re) |
| e | E (Mi) |
| f | F (Fa) |
| g | G (Sol) |
| a | A (La) |
| b | B (Ti) |

**Example - C Major Scale:**

```lilylet
\time 4/4
c4 d e f | g a b c
```

---

## Relative Pitch and Line Breaks

Understanding how Lilylet handles pitch across measures and line breaks is essential for writing correct music notation.

### Pitch Base

The pitch base (reference point for relative pitch calculation) starts at **middle C** (C4). Each subsequent note is calculated relative to the previous note.

### Continuous Pitch Across Measures

When notes are on the **same line** (no line breaks), the pitch remains continuous across bar lines. This is ideal for writing scales and melodies that span multiple measures:

**Example - Ascending Scale (Single Line):**

```lilylet
\time 4/4
c4 d e f | g a b c | d e f g | a b c b | a g f e | d c b a | g f e d | c1
```

Notice how the pitch naturally ascends and descends across all measures because everything is on one line.

### Line Breaks Reset Pitch (Lilylet-specific)

When you insert a **line break** (newline character), the pitch base resets to **middle C**. This behavior is unique to Lilylet and differs from standard LilyPond. It is useful for:

- Starting a new phrase from a known reference point
- Writing music where each line represents an independent musical idea
- Avoiding complex octave calculations

**Example - With Line Break (Pitch Resets):**

```lilylet
\time 4/4
c4 d e f | g a b c
c4 d e f | g a b c
```

Each line starts fresh from middle C, so both lines produce the same ascending pattern.

### Comparing Behaviors

**Without line break** - continuous pitch:
```lilylet
\time 4/4
c4 d e f | g a b c | c b a g | f e d c
```

**With line break** - pitch resets at each line:
```lilylet
\time 4/4
c4 d e f | g a b c
c' b a g | f e d c
```

In the second example, the newline resets the reference pitch to middle C, so `c'` is explicitly needed on line 2 to start from C5 (since without the marker, `c` would be middle C).

### Practical Tips

1. **For continuous melodies**: Write on a single line to maintain pitch continuity across measures
2. **For independent phrases**: Use line breaks to reset the pitch base
3. **For readability**: You can use line breaks for visual organization, but remember that pitch will reset
4. **For complex passages**: Consider using explicit octave markers (`'` or `,`) when crossing line breaks

**Example - Multi-line with Explicit Octaves:**

```lilylet
\time 4/4
c4 d e f | g a b c
c'4 d e f | g a b c
```

Each line starts with an explicit octave marker (`c'` on line 2) because the line break reset the pitch base to middle C. Subsequent notes flow naturally from there.

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
c1 | c2 c2 | c4 c4 c4 c4 | c8 c8 c8 c8 c8 c8 c8 c8
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
c4. d e f | g4 g8 a4. g
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
c4 d e f | R1 | g4 a b c
```

### Space Rests (Invisible)

Use `s` for invisible rests (useful in multi-voice notation):

```lilylet
\time 4/4
c4 s4 e4 s4
```

---

## Accidentals

### Sharps and Flats

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
e4 fs g a | b cs ds e | e ds cs b | a g fs e
```

---

## Octaves

### Relative Pitch Mode

Lilylet uses **relative pitch mode**. Each note is interpreted relative to the previous note, choosing the **closest pitch** by default:

- Notes within a **fourth** of the previous note stay in the expected octave
- For **fifths or larger intervals**, Lilylet may choose an unexpected octave
- Use `'` or `,` markers to force the correct octave when needed

### Octave Markers

| Marker | Effect |
|--------|--------|
| `'` (apostrophe) | Raise one octave |
| `,` (comma) | Lower one octave |

**Example - Octave Changes:**

```lilylet
\time 4/4
c4 c' c'' c''' | c,, c, c c'
```

**Example - Understanding Relative Mode:**

```lilylet
\time 4/4
c4 d e f | g a b c | c b a g | f e d c
```

Note: From `b` (B4), the closest `c` is C5 (up a half step), not C4 (down 11 half steps). So `c` after `b` naturally goes up to C5 without needing any octave marker.

**Example - Wide Intervals:**

```lilylet
\time 4/4
c4 g c g | c e g c | c g e c
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
c8 e g c e g c g | e c g, e, c,4 r
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
\grace e16 d4 f a d' | \grace fs16 g4 b d' g'
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
\time 4/4
\stemUp c'2 d' \\ \stemDown g2 a | \stemUp e'2 f' \\ \stemDown b2 c'
```

**Example - Two-Voice Counterpoint:**

```lilylet
\time 4/4
\stemUp e'4 d' c' b \\ \stemDown c4 g a e | \stemUp c'2 b \\ \stemDown f2 g | \stemUp c'1 \\ \stemDown c1
```

### Stem Direction

| Command | Effect |
|---------|--------|
| `\stemUp` | Force stems up |
| `\stemDown` | Force stems down |
| `\stemNeutral` | Automatic |

---

## Multiple Staves

### Part Separator

Use `\\\` (triple backslash) to separate different staves/parts:

```lilylet
\time 4/4
\clef "treble" c'4 d' e' f' | g'1 \\\
\clef "bass" c4 g, c g, | c1
```

### Staff Assignment

Use `\staff "N"` to assign notes to a specific staff:

```lilylet
\time 4/4
\staff "1" \clef "treble" c'4 e' g' c'' \\
\staff "2" \clef "bass" c4 g c' g |
\staff "1" d'4 f' a' d'' \\
\staff "2" d4 a d' a
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
