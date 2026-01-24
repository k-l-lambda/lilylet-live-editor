// Lilylet syntax highlighting for CodeMirror 6
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { StreamLanguage } from '@codemirror/language';

// Define the Lilylet language
const lilyletLanguage = StreamLanguage.define({
	token(stream) {
		// Skip whitespace
		if (stream.eatSpace()) return null;

		// Comments: % to end of line
		if (stream.match('%')) {
			stream.skipToEnd();
			return 'comment';
		}

		// Bar line: |
		if (stream.match('|')) {
			return 'separator';
		}

		// Commands starting with backslash
		if (stream.match(/^\\[a-zA-Z]+/)) {
			const cmd = stream.current();
			// Context commands
			if (/^\\(key|time|clef|tempo|ottava|staff)$/.test(cmd)) {
				return 'keyword';
			}
			// Mode commands
			if (/^\\(major|minor)$/.test(cmd)) {
				return 'typeName';
			}
			// Articulation and expressive commands
			if (/^\\(trill|turn|mordent|prall|fermata|shortfermata|arpeggio)$/.test(cmd)) {
				return 'labelName';
			}
			// Dynamic commands
			if (/^\\(ppp|pp|p|mp|mf|f|ff|fff|sfz|rfz)$/.test(cmd)) {
				return 'labelName';
			}
			// Hairpin commands
			if (/^\\(<|>|!)$/.test(cmd)) {
				return 'labelName';
			}
			// Stem direction
			if (/^\\(stemUp|stemDown|stemNeutral)$/.test(cmd)) {
				return 'operator';
			}
			// Tuplet
			if (/^\\times$/.test(cmd)) {
				return 'keyword';
			}
			// Repeat/tremolo
			if (/^\\repeat$/.test(cmd)) {
				return 'keyword';
			}
			// Grace note
			if (/^\\grace$/.test(cmd)) {
				return 'special';
			}
			// Rest marker
			if (/^\\rest$/.test(cmd)) {
				return 'comment';
			}
			// Pedal
			if (/^\\(sustainOn|sustainOff|sostenutoOn|sostenutoOff|unaCorda|treCorde)$/.test(cmd)) {
				return 'labelName';
			}
			// Other commands
			return 'meta';
		}

		// Chord: < ... >
		if (stream.match('<')) {
			return 'bracket';
		}
		if (stream.match('>')) {
			return 'bracket';
		}

		// Tuplet braces
		if (stream.match('{')) {
			return 'brace';
		}
		if (stream.match('}')) {
			return 'brace';
		}

		// Quoted strings (for clef names, titles, etc.)
		if (stream.match(/"[^"]*"/)) {
			return 'string';
		}

		// Numbers (for time signature, duration, etc.)
		if (stream.match(/^\d+/)) {
			return 'number';
		}

		// Tie ~
		if (stream.match('~')) {
			return 'operator';
		}

		// Slur ( )
		if (stream.match('(') || stream.match(')')) {
			return 'paren';
		}

		// Beam [ ]
		if (stream.match('[') || stream.match(']')) {
			return 'squareBracket';
		}

		// Articulation marks: -. -! -_ -^ ->
		if (stream.match(/^[-_^][.!_^>]/)) {
			return 'labelName';
		}

		// Pitch names with optional accidentals and octave marks
		// Pitch: c, d, e, f, g, a, b followed by optional s/f/ss/ff/! and '/,
		if (stream.match(/^[a-g](s|f|ss|ff|!)?[',]*/)) {
			return 'variableName';
		}

		// Rest types: r, s, R (full measure)
		if (stream.match(/^[rsR]/)) {
			return 'comment';
		}

		// Dots after duration
		if (stream.match('.')) {
			return 'punctuation';
		}

		// Tremolo marker :
		if (stream.match(':')) {
			return 'operator';
		}

		// Fraction for tuplet ratio
		if (stream.match('/')) {
			return 'operator';
		}

		// Skip any other character
		stream.next();
		return null;
	}
});

// Custom highlight style for Lilylet
const lilyletHighlightStyle = HighlightStyle.define([
	{ tag: t.keyword, color: '#c678dd', fontWeight: 'bold' },           // \key, \time, \clef
	{ tag: t.typeName, color: '#56b6c2' },                               // \major, \minor
	{ tag: t.separator, color: '#e06c75', fontWeight: 'bold' },         // |
	{ tag: t.comment, color: '#5c6370', fontStyle: 'italic' },          // %, r, s, R
	{ tag: t.string, color: '#98c379' },                                 // "..."
	{ tag: t.number, color: '#d19a66' },                                 // 4, 8, 16
	{ tag: t.variableName, color: '#e06c75', fontWeight: 'bold' },      // c, d, e, f, g, a, b
	{ tag: t.bracket, color: '#61afef' },                                // < >
	{ tag: t.brace, color: '#c678dd' },                                  // { }
	{ tag: t.paren, color: '#98c379' },                                  // ( )
	{ tag: t.squareBracket, color: '#61afef' },                          // [ ]
	{ tag: t.operator, color: '#56b6c2' },                               // ~, :, /
	{ tag: t.labelName, color: '#98c379' },                              // articulations, dynamics
	{ tag: t.special(t.keyword), color: '#c678dd', fontStyle: 'italic' }, // \grace
	{ tag: t.meta, color: '#abb2bf' },                                   // other commands
	{ tag: t.punctuation, color: '#abb2bf' },                            // .
	{ tag: t.invalid, color: '#e06c75', textDecoration: 'underline' }   // Unknown
]);

// Export the language and highlighting
export const lilylet = () => [
	lilyletLanguage,
	syntaxHighlighting(lilyletHighlightStyle)
];

export { lilyletLanguage, lilyletHighlightStyle };
