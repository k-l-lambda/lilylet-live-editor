// Lilylet conversion utilities
import * as lilylet from '@k-l-lambda/lilylet';

const { lilypondDecoder } = lilylet;

export type ConversionResult = {
	success: true;
	data: string;
} | {
	success: false;
	error: string;
};

export type MEIResult = {
	success: true;
	mei: string;
	measureCount: number;
	staffCount: number;
} | {
	success: false;
	error: string;
};

/**
 * Convert Lilylet code to MEI XML
 */
export function lilyletToMEI(code: string): MEIResult {
	try {
		// Parse Lilylet code to LilyletDoc
		const doc = lilylet.parseCode(code);

		// Encode to MEI XML
		const mei = lilylet.meiEncoder.encode(doc);

		// Calculate total staff count
		let staffCount = 1;
		if (doc.measures && doc.measures.length > 0) {
			const firstMeasure = doc.measures[0];
			staffCount = firstMeasure.parts.reduce((total, part) => {
				const maxStaff = part.voices.reduce((max, voice) => Math.max(max, voice.staff || 1), 1);
				return total + maxStaff;
			}, 0) || 1;
		}

		return {
			success: true,
			mei,
			measureCount: doc.measures?.length || 1,
			staffCount
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Lilylet parsing error:', error);
		return { success: false, error: errorMessage };
	}
}

/**
 * Convert MusicXML to Lilylet code
 */
export function musicXmlToLilylet(xml: string): ConversionResult {
	try {
		const doc = lilylet.musicXmlDecoder.decode(xml);
		const code = lilylet.serializeLilyletDoc(doc);
		return { success: true, data: code };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('MusicXML conversion error:', error);
		return { success: false, error: `MusicXML conversion failed: ${errorMessage}` };
	}
}

/**
 * Convert LilyPond to Lilylet code
 */
export async function lilypondToLilylet(source: string): Promise<ConversionResult> {
	try {
		const doc = lilypondDecoder.decode(source);
		const code = lilylet.serializeLilyletDoc(doc);
		return { success: true, data: code };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('LilyPond conversion error:', error);
		return { success: false, error: `LilyPond conversion failed: ${errorMessage}` };
	}
}

/**
 * Convert Lilylet code to LilyPond
 */
export function lilyletToLilyPond(code: string): ConversionResult {
	try {
		// Parse Lilylet code to LilyletDoc
		const doc = lilylet.parseCode(code);

		// Encode to LilyPond
		const ly = lilylet.lilypondEncoder.encode(doc, {
			paper: { width: 210, height: 297 },
			fontSize: 20,
			withMIDI: true,
			autoBeaming: false
		});

		return { success: true, data: ly };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('LilyPond encoding error:', error);
		return { success: false, error: `LilyPond encoding failed: ${errorMessage}` };
	}
}

/**
 * Convert Lilylet code to MusicXML
 */
export function lilyletToMusicXml(code: string): ConversionResult {
	try {
		// Parse Lilylet code to LilyletDoc
		const doc = lilylet.parseCode(code);

		// Encode to MusicXML
		const xml = lilylet.musicXmlEncoder.encode(doc);

		return { success: true, data: xml };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('MusicXML encoding error:', error);
		return { success: false, error: `MusicXML encoding failed: ${errorMessage}` };
	}
}

/**
 * Convert ABC notation to Lilylet code
 */
export function abcToLilylet(abc: string): ConversionResult {
	try {
		const doc = lilylet.abcDecoder.decode(abc);
		const code = lilylet.serializeLilyletDoc(doc);
		return { success: true, data: code };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('ABC conversion error:', error);
		return { success: false, error: `ABC conversion failed: ${errorMessage}` };
	}
}

export { lilylet } from './highlight';
