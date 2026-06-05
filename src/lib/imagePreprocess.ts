export async function preprocessReceiptImage(file: File) {
  const image = await loadImage(file);
  const targetWidth = 1800;
  const scale = Math.min(2, targetWidth / image.naturalWidth);
  const canvas = document.createElement('canvas');
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const contrasted = (gray - 128) * 1.55 + 128;
    const value = contrasted > 160 ? 255 : 0;
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/png');
  });
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = reject;
    image.src = url;
  });
}
