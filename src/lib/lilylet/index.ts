// Lilylet to MEI conversion
import * as lilylet from '@k-l-lambda/lilylet';

/**
 * Convert Lilylet code to MEI XML
 */
export async function lilyletToMEI(code: string): Promise<string | null> {
	try {
		// Parse Lilylet code to LilyletDoc
		const doc = await lilylet.parseCode(code);

		// Encode to MEI XML
		lilylet.meiEncoder.resetIdCounter();
		const mei = lilylet.meiEncoder.encode(doc);

		return mei;
	} catch (error) {
		console.error('Lilylet parsing error:', error);
		return null;
	}
}

export { lilylet } from './highlight';
