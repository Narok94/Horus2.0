/** Render once; the thumbnail, full preview and download use this exact PNG. */
export async function createWorkoutShareImage(photo: string, division: string, durationSeconds: number): Promise<string> {
  const image = new Image();
  image.src = photo;
  await image.decode();
  await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = Math.round(canvas.width * image.naturalHeight / image.naturalWidth);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível gerar a imagem.');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const font = getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim() || 'sans-serif';
  const margin = Math.min(60, canvas.height * .08);
  const titleSize = Math.min(52, canvas.height * .07);
  const lineHeight = titleSize * 1.2;
  ctx.font = `700 ${titleSize}px ${font}`;
  const lines: string[] = [];
  let line = '';
  for (const word of division.toLocaleUpperCase('pt-BR').split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > canvas.width - margin * 2) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);

  const bottom = canvas.height - margin;
  const durationSize = Math.min(34, canvas.height * .055);
  const titleBottom = bottom - durationSize * 1.8;
  const gradientTop = Math.max(0, titleBottom - lines.length * lineHeight - 80);
  const gradient = ctx.createLinearGradient(0, gradientTop, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,.62)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, gradientTop, canvas.width, canvas.height - gradientTop);
  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'left';
  lines.forEach((text, index) => ctx.fillText(text, margin, titleBottom - (lines.length - 1 - index) * lineHeight));
  ctx.font = `500 ${durationSize}px ${font}`;
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = Math.floor(durationSeconds % 60);
  ctx.fillText(minutes > 0 ? `${minutes} MIN${seconds ? ` ${seconds} S` : ''}` : `${seconds} S`, margin, bottom);

  // Text watermark until the approved logo asset is available.
  ctx.font = `600 ${Math.min(28, canvas.height * .045)}px ${font}`;
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.textAlign = 'right';
  ctx.fillText('HÓRUS GYM', canvas.width - margin, bottom);
  return canvas.toDataURL('image/png');
}
