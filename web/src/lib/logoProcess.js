// Processa o logótipo carregado pelo utilizador para ficar nítido na impressão
// (sobretudo em impressoras térmicas, que só imprimem a preto): aumenta o
// contraste e escurece os tons, mantendo a proporção e um tamanho adequado.
// Devolve uma data URL (PNG) com fundo transparente.
export function processarLogo(file, { maxLargura = 360, limiar = 180 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o ficheiro."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Imagem inválida."));
      img.onload = () => {
        try {
          const escala = img.width > maxLargura ? maxLargura / img.width : 1;
          const w = Math.max(1, Math.round(img.width * escala));
          const h = Math.max(1, Math.round(img.height * escala));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h);
          const px = data.data;
          for (let i = 0; i < px.length; i += 4) {
            const a = px[i + 3];
            // Pixel transparente mantém-se transparente.
            if (a < 40) {
              px[i + 3] = 0;
              continue;
            }
            // Luminância percetual.
            const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
            if (lum < limiar) {
              // Tons escuros/médios → preto sólido (muito visível ao imprimir).
              px[i] = px[i + 1] = px[i + 2] = 0;
              px[i + 3] = 255;
            } else {
              // Tons claros/fundo → transparente, para não imprimir "sujidade".
              px[i + 3] = 0;
            }
          }
          ctx.putImageData(data, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (e) {
          reject(e);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
