const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.88;

/**
 * Decodes an image (a picked file or a data URL), fits it within 2048px and re-encodes it as a
 * data URL ready to be sent to the API. Photos become JPEG, which also strips their metadata;
 * images with transparency stay PNG.
 */
export async function prepareImage(source: Blob | string): Promise<string> {
	const src = typeof source === 'string' ? source : URL.createObjectURL(source);

	try {
		const image = new Image();
		image.src = src;
		await image.decode();

		const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
		const canvas = document.createElement('canvas');
		canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
		canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

		const context = canvas.getContext('2d', { willReadFrequently: true })!;
		context.imageSmoothingQuality = 'high';
		context.drawImage(image, 0, 0, canvas.width, canvas.height);

		const type = typeof source === 'string' ? source.slice(5, source.indexOf(';')) : source.type;
		const transparent = type !== 'image/jpeg' && hasTransparency(context, canvas.width, canvas.height);

		return transparent ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', JPEG_QUALITY);
	} finally {
		if (typeof source !== 'string') URL.revokeObjectURL(src);
	}
}

function hasTransparency(context: CanvasRenderingContext2D, width: number, height: number) {
	const { data } = context.getImageData(0, 0, width, height);
	for (let alpha = 3; alpha < data.length; alpha += 4) {
		if (data[alpha] < 255) return true;
	}
	return false;
}

/** Opens the share sheet on phones (to save to Photos) and downloads the file elsewhere. */
export async function saveImage(dataUrl: string) {
	const file = dataUrlToFile(dataUrl, `willchat-${Date.now()}`);

	if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
		try {
			await navigator.share({ files: [file] });
			return;
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
		}
	}

	const url = URL.createObjectURL(file);
	const link = document.createElement('a');
	link.href = url;
	link.download = file.name;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// Synchronous on purpose: Safari only allows `navigator.share` right after the user's tap.
function dataUrlToFile(dataUrl: string, name: string) {
	const comma = dataUrl.indexOf(',');
	const type = dataUrl.slice(5, dataUrl.indexOf(';'));
	const binary = atob(dataUrl.slice(comma + 1));
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

	const extension = type === 'image/jpeg' ? 'jpg' : type.split('/')[1];
	return new File([bytes], `${name}.${extension}`, { type });
}
