// Lilylet conversion utilities
import * as lilylet from '@k-l-lambda/lilylet';

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

		return {
			success: true,
			mei,
			measureCount: doc.measures?.length || 1
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
 * Note: lilypondDecoder requires optional @k-l-lambda/lotus dependency
 */
export function lilypondToLilylet(source: string): ConversionResult {
	try {
		// lilypondDecoder is not included in the main lilylet export
		// It requires the optional @k-l-lambda/lotus dependency
		const lilypondDecoder = (lilylet as any).lilypondDecoder;
		if (!lilypondDecoder) {
			return { success: false, error: 'LilyPond decoder not available (requires @k-l-lambda/lotus)' };
		}
		const doc = lilypondDecoder.decode(source);
		const code = lilylet.serializeLilyletDoc(doc);
		return { success: true, data: code };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('LilyPond conversion error:', error);
		return { success: false, error: `LilyPond conversion failed: ${errorMessage}` };
	}
}

export { lilylet } from './highlight';
