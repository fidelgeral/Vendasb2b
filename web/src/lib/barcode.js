// Gerador de código de barras Code128 (subconjuntos B e C) em SVG — sem
// bibliotecas externas. Produz um código escaneável por leitores USB/câmara.
// Cada padrão tem 6 larguras (barra,espaço,barra,espaço,barra,espaço) que somam 11.

const PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112",
];

const START_B = 104;
const START_C = 105;
const STOP = 106;

// Decide, por posição, se compensa usar o subconjunto C (dígitos aos pares).
function encodeData(data) {
  const codes = [];
  let i = 0;
  const isDigit = (c) => c >= "0" && c <= "9";
  // Começa em C se houver 4+ dígitos no início (ou toda a string par de dígitos).
  const allDigits = /^\d+$/.test(data) && data.length % 2 === 0;
  let mode = allDigits ? "C" : "B";
  codes.push(mode === "C" ? START_C : START_B);

  while (i < data.length) {
    if (mode === "C") {
      // Em C enquanto houver pares de dígitos.
      if (i + 1 < data.length && isDigit(data[i]) && isDigit(data[i + 1])) {
        codes.push(parseInt(data.substr(i, 2), 10));
        i += 2;
      } else {
        codes.push(100); // Code B
        mode = "B";
      }
    } else {
      // Muda para C se vierem 4+ dígitos seguidos.
      let run = 0;
      while (i + run < data.length && isDigit(data[i + run])) run++;
      if (run >= 4 && run % 2 === 0) {
        codes.push(99); // Code C
        mode = "C";
      } else {
        const code = data.charCodeAt(i) - 32;
        codes.push(code >= 0 && code < 95 ? code : 0);
        i += 1;
      }
    }
  }

  // Checksum mod 103.
  let sum = codes[0];
  for (let k = 1; k < codes.length; k++) sum += codes[k] * k;
  codes.push(sum % 103);
  codes.push(STOP);
  return codes;
}

// Devolve um SVG (string) com o código de barras. `data` é o texto a codificar.
export function code128SVG(data, { height = 60, moduleWidth = 2, showText = true, textSize = 12 } = {}) {
  const str = String(data || "");
  if (!str) return "";
  const codes = encodeData(str);
  const pattern = codes.map((c) => PATTERNS[c]).join("");

  let x = 0;
  const rects = [];
  for (let i = 0; i < pattern.length; i++) {
    const w = parseInt(pattern[i], 10) * moduleWidth;
    if (i % 2 === 0) {
      // índice par = barra (preto)
      rects.push('<rect x="' + x + '" y="0" width="' + w + '" height="' + height + '" fill="#000"/>');
    }
    x += w;
  }
  const totalW = x;
  const svgH = height + (showText ? textSize + 4 : 0);
  const texto = showText
    ? '<text x="' + (totalW / 2) + '" y="' + (height + textSize) + '" text-anchor="middle" font-family="monospace" font-size="' + textSize + '" fill="#000">' + str.replace(/[<>&]/g, "") + "</text>"
    : "";
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + totalW + '" height="' + svgH + '" viewBox="0 0 ' + totalW + " " + svgH + '">' +
    rects.join("") +
    texto +
    "</svg>"
  );
}
