// Lilylet syntax highlighting for CodeMirror 6.
//
// Thin adapter: the language's token rules live in @k-l-lambda/lilylet/highlight
// (generated from the grammar's lexer, framework-agnostic). Here we only map
// the package's generic scopes onto CodeMirror/Lezer tags and a colour theme,
// so the highlighter stays in lock-step with the grammar instead of drifting in
// a hand-maintained copy.
import { HighlightStyle, syntaxHighlighting, StreamLanguage } from '@codemirror/language';
import { tags as t, type Tag } from '@lezer/highlight';
import { matchAt, type HighlightScope } from '@k-l-lambda/lilylet/highlight';

// Map each generic Lilylet scope to a Lezer highlight tag. Several scopes share
// a tag where the palette below would colour them identically; keeping distinct
// tags where the theme differentiates them (e.g. tuplet vs keyword).
const SCOPE_TAG: Record<HighlightScope, Tag> = {
	keyword: t.keyword,        // \clef \key \time \tempo \staff \ottava \repeat ...
	tuplet: t.keyword,         // \times \tuplet
	mode: t.typeName,          // \major \minor
	grace: t.special(t.keyword), // \grace
	markup: t.meta,            // \markup
	stem: t.operator,          // \stemUp \stemDown \stemNeutral
	header: t.meta,            // [title [composer ...
	string: t.string,          // "..."
	number: t.number,          // 4 8 16
	pitch: t.variableName,     // c d e f g a b (+accidental)
	octave: t.variableName,    // ' ,
	rest: t.comment,           // r s R \rest
	dynamic: t.labelName,      // \p \f \mf ...
	hairpin: t.labelName,      // \< \> \!
	articulation: t.labelName, // \staccato ... and -. -> etc
	ornament: t.labelName,     // \trill \turn ...
	pedal: t.labelName,        // \sustainOn \sustainOff
	navigation: t.labelName,   // \coda \segno
	tie: t.operator,           // ~
	operator: t.operator,      // / : =
	separator: t.separator,    // \\\\ \\\\\\ (part/voice)
	bar: t.separator,          // |
	comment: t.comment,        // % ...
	chordBracket: t.bracket,   // < >
	brace: t.brace,            // { }
	squareBracket: t.squareBracket, // [ ]
	paren: t.paren,            // ( )
	punctuation: t.punctuation,// . - _ ^ ! #
};

// Stable, distinct token-name strings handed to CodeMirror's tokenTable. We use
// the scope name itself as the token name, then resolve scope -> Tag below.
const tokenTable: Record<string, Tag> = Object.fromEntries(
	Object.entries(SCOPE_TAG)
) as Record<string, Tag>;

// CodeMirror StreamLanguage: at each position, ask the generated tokenizer for
// the longest matching token and emit its scope as the token name.
const lilyletLanguage = StreamLanguage.define<unknown>({
	token(stream) {
		const line = stream.string;
		const tok = matchAt(line, stream.pos);
		if (tok) {
			stream.pos = tok.end;
			return tok.scope;
		}
		// No rule matched here — consume one char, emit nothing.
		stream.next();
		return null;
	},
	tokenTable,
});

// One Dark-flavoured palette (matches the previous hand-written highlighter).
const lilyletHighlightStyle = HighlightStyle.define([
	{ tag: t.keyword, color: '#c678dd', fontWeight: 'bold' },
	{ tag: t.typeName, color: '#56b6c2' },
	{ tag: t.separator, color: '#e06c75', fontWeight: 'bold' },
	{ tag: t.comment, color: '#5c6370', fontStyle: 'italic' },
	{ tag: t.string, color: '#98c379' },
	{ tag: t.number, color: '#d19a66' },
	{ tag: t.variableName, color: '#e06c75', fontWeight: 'bold' },
	{ tag: t.bracket, color: '#61afef' },
	{ tag: t.brace, color: '#c678dd' },
	{ tag: t.paren, color: '#98c379' },
	{ tag: t.squareBracket, color: '#61afef' },
	{ tag: t.operator, color: '#56b6c2' },
	{ tag: t.labelName, color: '#98c379' },
	{ tag: t.special(t.keyword), color: '#c678dd', fontStyle: 'italic' },
	{ tag: t.meta, color: '#abb2bf' },
	{ tag: t.punctuation, color: '#abb2bf' },
	{ tag: t.invalid, color: '#e06c75', textDecoration: 'underline' },
]);

export const lilylet = () => [
	lilyletLanguage,
	syntaxHighlighting(lilyletHighlightStyle),
];

export { lilyletLanguage, lilyletHighlightStyle };
