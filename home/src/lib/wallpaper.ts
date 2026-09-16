// The wallpaper lives in localStorage, which is a handful of megabytes shared with every other app
// on the origin, so the picked photo is shrunk and re-encoded before it is stored.
const MAX_DIMENSION = 1600;
const MAX_LENGTH = 1_500_000;
const QUALITY = 0.82;

/**
 * Decodes a picked image, fits it within `MAX_DIMENSION` and re-encodes it as a JPEG data URL small
 * enough to keep in localStorage. Large photos are re-encoded smaller until they fit.
 */
export async function prepareWallpaper(file: Blob): Promise<string> {
	const url = URL.createObjectURL(file);

	try {
		const image = new Image();
		image.src = url;
		await image.decode();

		let dataUrl = encode(image, MAX_DIMENSION, QUALITY);
		for (let attempt = 1; dataUrl.length > MAX_LENGTH && attempt <= 4; attempt++) {
			dataUrl = encode(image, MAX_DIMENSION * 0.75 ** attempt, QUALITY - 0.08 * attempt);
		}

		return dataUrl;
	} finally {
		URL.revokeObjectURL(url);
	}
}

function encode(image: HTMLImageElement, dimension: number, quality: number) {
	const scale = Math.min(1, dimension / Math.max(image.naturalWidth, image.naturalHeight));
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
	canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

	const context = canvas.getContext('2d')!;
	context.imageSmoothingQuality = 'high';
	// JPEG has no alpha: paint the home screen's base colour behind transparent pixels.
	context.fillStyle = '#1c1446';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.drawImage(image, 0, 0, canvas.width, canvas.height);

	return canvas.toDataURL('image/jpeg', quality);
}
