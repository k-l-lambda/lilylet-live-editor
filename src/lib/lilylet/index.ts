// Lilylet conversion utilities
import * as lilylet from '@k-l-lambda/lilylet';

export type ConversionResult = {
	success: true;
	data: string;
} | {
	success: false;
	error: string;
};

export interface MEIResult {
	mei: string;
	measureCount: number;
}

/**
 * Convert Lilylet code to MEI XML
 */
export function lilyletToMEI(code: string): MEIResult | null {
	try {
		// Parse Lilylet code to LilyletDoc
		const doc = lilylet.parseCode(code);

		// Encode to MEI XML
		const mei = lilylet.meiEncoder.encode(doc);

		return {
			mei,
			measureCount: doc.measures?.length || 1
		};
	} catch (error) {
		console.error('Lilylet parsing error:', error);
		return null;
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
export function lilypondToLilylet(source: string): ConversionResult {
	try {
		const doc = lilylet.lilypondDecoder.decode(source);
		const code = lilylet.serializeLilyletDoc(doc);
		return { success: true, data: code };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('LilyPond conversion error:', error);
		return { success: false, error: `LilyPond conversion failed: ${errorMessage}` };
	}
}

export { lilylet } from './highlight';
