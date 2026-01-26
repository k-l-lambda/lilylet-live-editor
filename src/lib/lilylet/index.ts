// Lilylet to MEI conversion
import * as lilylet from '@k-l-lambda/lilylet';

/**
 * Convert Lilylet code to MEI XML
 */
export function lilyletToMEI(code: string): string | null {
	try {
		// Parse Lilylet code to LilyletDoc
		const doc = lilylet.parseCode(code);

		// Encode to MEI XML
		const mei = lilylet.meiEncoder.encode(doc);

		return mei;
	} catch (error) {
		console.error('Lilylet parsing error:', error);
		return null;
	}
}

export { lilylet } from './highlight';
