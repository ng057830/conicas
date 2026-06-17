const $ = id => document.getElementById(id);

// Configuración de colores (coincidentes con el CSS)
const COLORS = {
  bg: '#f5efe6',
  paper: '#fffcf9',
  ink: '#2b2520',
  muted: '#756c64',
  line: '#e8ded2',
  accent: '#c45b30',
  blue: '#296bb0',
  green: '#388056',
  red: '#c93b3b',
  purple: '#834aa8',
  gold: '#d48e15'
};

const canvas = $('plotCanvas');
let ctx = canvas.getContext('2d');
let w, h;
let xmin = -8, xmax = 8, ymin = -6, ymax = 6;

// Mapeo de coordenadas virtuales a píxeles en pantalla
function map(x, y) {
  return {
    x: ((x - xmin) / (xmax - xmin)) * w,
    y: h - ((y - ymin) / (ymax - ymin)) * h
  };
}

// Redimensionar para pantallas Retina (HiDPI)
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  w = rect.width;
  h = rect.height;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Formatear números para legibilidad
function fmt(n) {
  if (Math.abs(n) < 1e-10) return "0";
  const r = Math.round(n * 100) / 100;
  return String(r);
}

function point(x, y) {
  return `(${fmt(x)}, ${fmt(y)})`;
}

// Formatear denominador al cuadrado sin evaluar
function formatDenominatorSquare(val) {
  // Ejercicio específico de la elipse: b = sqrt(5) ~ 2.24
  if (Math.abs(val - Math.sqrt(5)) < 0.05) return `(√5)²`;
  if (Math.abs(val - Math.sqrt(2)) < 0.05) return `(√2)²`;
  if (Math.abs(val - Math.sqrt(3)) < 0.05) return `(√3)²`;
  if (Math.abs(val - Math.sqrt(7)) < 0.05) return `(√7)²`;
  
  if (Number.isInteger(Math.round(val * 100) / 100)) {
    return `${Math.round(val)}²`;
  }
  return `(${fmt(val)})²`;
}

// Formatear numerador (x - h)^2
function formatNumeratorSquare(variable, val) {
  if (Math.abs(val) < 0.01) return `<span class="eq-var">${variable}</span>²`;
  let sign = val > 0 ? "−" : "+";
  return `(<span class="eq-var">${variable}</span> ${sign} ${fmt(Math.abs(val))})²`;
}

// Formatear término lineal (x - h)
function formatLinearTerm(variable, val) {
  if (Math.abs(val) < 0.01) return `<span class="eq-var">${variable}</span>`;
  let sign = val > 0 ? "−" : "+";
  return `(<span class="eq-var">${variable}</span> ${sign} ${fmt(Math.abs(val))})`;
}

// Verificar si un checkbox está activo
const isChecked = id => $(id) && $(id).checked;

// Dibujar un punto en el Canvas
function drawPoint(x, y, color, label) {
  const p = map(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = "bold 12px sans-serif";
  ctx.fillText(label, p.x + 8, p.y - 6);
}

// Dibujar una línea recta segmentada o continua
function drawLine(x1, y1, x2, y2, color, width = 1.5, isDashed = false) {
  const p1 = map(x1, y1);
  const p2 = map(x2, y2);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (isDashed) {
    ctx.setLineDash([6, 5]);
  }
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.restore();
}

// Dibujar una curva (polyline)
function drawCurve(pts, color, width = 2.5) {
  if (pts.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  let first = true;
  for (const [x, y] of pts) {
    const p = map(x, y);
    if (first) {
      ctx.moveTo(p.x, p.y);
      first = false;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
  ctx.stroke();
}

// Dibujar un arco de ángulo recto
function drawRightAngle(x, y, dx, dy, color) {
  const p = map(x, y);
  const p1 = map(x + dx, y);
  const p2 = map(x, y + dy);
  const p3 = map(x + dx, y + dy);
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

// Dibujar rejilla y ejes del plano cartesiano
function drawPlane() {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fffbf7";
  ctx.fillRect(0, 0, w, h);

  // Rejilla fina
  ctx.strokeStyle = "#efe5d7";
  ctx.lineWidth = 0.8;
  for (let x = Math.ceil(xmin); x <= Math.floor(xmax); x++) {
    drawLine(x, ymin, x, ymax, "#efe5d7");
  }
  for (let y = Math.ceil(ymin); y <= Math.floor(ymax); y++) {
    drawLine(xmin, y, xmax, y, "#efe5d7");
  }

  // Ejes X e Y principales
  ctx.strokeStyle = "#40362f";
  ctx.lineWidth = 1.5;
  drawLine(xmin, 0, xmax, 0, "#40362f");
  drawLine(0, ymin, 0, ymax, "#40362f");

  // Números en los ejes
  ctx.fillStyle = "#756c64";
  ctx.font = "11px sans-serif";
  for (let x = -7; x <= 7; x++) {
    if (x !== 0) {
      const p = map(x, 0);
      ctx.fillText(String(x), p.x - 5, p.y + 14);
    }
  }
  for (let y = -5; y <= 5; y++) {
    if (y !== 0) {
      const p = map(0, y);
      ctx.fillText(String(y), p.x + 8, p.y + 4);
    }
  }
  const origin = map(0, 0);
  ctx.fillText("0", origin.x + 8, origin.y + 14);
}

// Función principal de dibujo y actualización
function updateApp() {
  const type = $('ctype').value;
  const orient = $('orient').value;

  // Mostrar u ocultar controles específicos
  if (type === 'ellipse') {
    $('ellipse-controls').style.display = 'block';
    $('parabola-controls').style.display = 'none';
    $('chk-vertices-sec-label').style.display = 'flex';
    $('chk-triangle-label').style.display = 'flex';
  } else {
    $('ellipse-controls').style.display = 'none';
    $('parabola-controls').style.display = 'block';
    $('chk-vertices-sec-label').style.display = 'none';
    $('chk-triangle-label').style.display = 'none';
  }

  // Dibujar fondo
  drawPlane();

  let eqHTML = "";
  let detailsHTML = "";

  if (type === 'ellipse') {
    let x0 = +$('x0').value;
    let y0 = +$('y0').value;
    let a = +$('param-a').value;
    let b = +$('param-b').value;
    let ell_p = +$('ell-p').value;

    // Asegurar que a >= b
    if (b > a) {
      [a, b] = [b, a];
      $('param-a').value = a;
      $('param-b').value = b;
    }

    $('x0-val').textContent = fmt(x0);
    $('y0-val').textContent = fmt(y0);
    $('a-val').textContent = fmt(a);
    $('b-val').textContent = fmt(b);
    $('ell-p-val').textContent = ell_p + "°";

    const c = Math.sqrt(Math.max(0, a * a - b * b));
    const e = a > 0 ? c / a : 0; // Excentricidad

    // Puntos de referencia
    const C = [x0, y0];
    let V1, V2, B1, B2, F1, F2;

    if (orient === 'horizontal') {
      V1 = [x0 - a, y0];
      V2 = [x0 + a, y0];
      B1 = [x0, y0 - b];
      B2 = [x0, y0 + b];
      F1 = [x0 - c, y0];
      F2 = [x0 + c, y0];
    } else {
      V1 = [x0, y0 - a];
      V2 = [x0, y0 + a];
      B1 = [x0 - b, y0];
      B2 = [x0 + b, y0];
      F1 = [x0, y0 - c];
      F2 = [x0, y0 + c];
    }

    // Dibujar Curva Elipse
    const pts = [];
    for (let i = 0; i <= 360; i++) {
      const theta = (i * Math.PI) / 180;
      const x = orient === 'horizontal' ? x0 + a * Math.cos(theta) : x0 + b * Math.cos(theta);
      const y = orient === 'horizontal' ? y0 + b * Math.sin(theta) : y0 + a * Math.sin(theta);
      pts.push([x, y]);
    }
    drawCurve(pts, COLORS.accent, 3);

    // Ejes de simetría
    if (isChecked('chk-axes')) {
      drawLine(xmin, y0, xmax, y0, COLORS.muted, 1, true);
      drawLine(x0, ymin, x0, ymax, COLORS.muted, 1, true);
    }

    // Caja Auxiliar
    if (isChecked('chk-box')) {
      const wBox = orient === 'horizontal' ? a : b;
      const hBox = orient === 'horizontal' ? b : a;
      ctx.save();
      ctx.strokeStyle = '#b8a693';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      const pTL = map(x0 - wBox, y0 + hBox);
      const pBR = map(x0 + wBox, y0 - hBox);
      ctx.strokeRect(pTL.x, pTL.y, pBR.x - pTL.x, pBR.y - pTL.y);
      ctx.restore();
    }

    // Centro, Focos y Vértices
    if (isChecked('chk-center')) drawPoint(C[0], C[1], COLORS.green, "C");
    if (isChecked('chk-vertices')) {
      drawPoint(V1[0], V1[1], COLORS.blue, "V₁");
      drawPoint(V2[0], V2[1], COLORS.blue, "V₂");
    }
    if (isChecked('chk-vertices-sec')) {
      drawPoint(B1[0], B1[1], COLORS.purple, "B₁");
      drawPoint(B2[0], B2[1], COLORS.purple, "B₂");
    }
    if (isChecked('chk-foci') && c > 0.01) {
      drawPoint(F1[0], F1[1], COLORS.red, "F₁");
      drawPoint(F2[0], F2[1], COLORS.red, "F₂");
    }

    // Directrices
    // Distancia del centro a la directriz = a/e = a^2/c
    let dDist = 0;
    if (c > 0.05) {
      dDist = (a * a) / c;
      if (isChecked('chk-directrix')) {
        if (orient === 'horizontal') {
          drawLine(x0 - dDist, ymin, x0 - dDist, ymax, COLORS.purple, 2, true);
          drawLine(x0 + dDist, ymin, x0 + dDist, ymax, COLORS.purple, 2, true);
          labelAt(x0 - dDist, ymax - 0.5, "d₁", COLORS.purple);
          labelAt(x0 + dDist, ymax - 0.5, "d₂", COLORS.purple);
        } else {
          drawLine(xmin, y0 - dDist, xmax, y0 - dDist, COLORS.purple, 2, true);
          drawLine(xmin, y0 + dDist, xmax, y0 + dDist, COLORS.purple, 2, true);
          labelAt(xmin + 0.3, y0 - dDist, "d₁", COLORS.purple);
          labelAt(xmin + 0.3, y0 + dDist, "d₂", COLORS.purple);
        }
      }
    }

    // Relación Geométrica a^2 = b^2 + c^2 (Triángulo rectángulo)
    if (isChecked('chk-triangle') && c > 0.05) {
      // Dibujamos el triángulo C -> F2 -> B2
      const triF = orient === 'horizontal' ? F2 : F2;
      const triB = orient === 'horizontal' ? B2 : B2;
      
      // Rellenar triángulo con color suave
      ctx.save();
      ctx.fillStyle = 'rgba(41, 107, 176, 0.08)';
      ctx.beginPath();
      const pC = map(x0, y0);
      const pF = map(triF[0], triF[1]);
      const pB = map(triB[0], triB[1]);
      ctx.moveTo(pC.x, pC.y);
      ctx.lineTo(pF.x, pF.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Dibujar lados
      drawLine(x0, y0, triF[0], triF[1], COLORS.red, 2.2); // cateto c
      drawLine(x0, y0, triB[0], triB[1], COLORS.green, 2.2); // cateto b
      drawLine(triF[0], triF[1], triB[0], triB[1], COLORS.blue, 2.2); // hipotenusa a

      // Ángulo recto en el Centro
      const signX = triF[0] >= x0 ? 0.25 : -0.25;
      const signY = triB[1] >= y0 ? 0.25 : -0.25;
      if (orient === 'horizontal') {
        drawRightAngle(x0, y0, signX, signY, COLORS.ink);
      } else {
        drawRightAngle(x0, y0, signY, signX, COLORS.ink);
      }

      // Etiquetas de los lados
      if (orient === 'horizontal') {
        labelAt(x0 + c/2, y0 + 0.15, "c", COLORS.red);
        labelAt(x0 - 0.25, y0 + b/2, "b", COLORS.green);
        labelAt((x0 + triF[0])/2 - 0.1, (y0 + triB[1])/2 + 0.2, "a (hipotenusa)", COLORS.blue);
      } else {
        labelAt(x0 - 0.25, y0 + c/2, "c", COLORS.red);
        labelAt(x0 + b/2, y0 + 0.15, "b", COLORS.green);
        labelAt((x0 + triB[0])/2 + 0.2, (y0 + triF[1])/2 - 0.1, "a (hipotenusa)", COLORS.blue);
      }
    }

    // Cotas de los ejes principales (si no se está mostrando el triángulo)
    if (isChecked('chk-params') && !isChecked('chk-triangle')) {
      if (orient === 'horizontal') {
        drawLine(x0, y0 - 0.2, x0 + a, y0 - 0.2, COLORS.blue, 2.5);
        labelAt(x0 + a / 2, y0 - 0.2, "a", COLORS.blue);

        drawLine(x0 - 0.2, y0, x0 - 0.2, y0 + b, COLORS.green, 2.5);
        labelAt(x0 - 0.2, y0 + b / 2, "b", COLORS.green);

        if (c > 0.1) {
          drawLine(x0, y0 - 0.4, x0 + c, y0 - 0.4, COLORS.red, 2.5);
          labelAt(x0 + c / 2, y0 - 0.4, "c", COLORS.red);
        }
      } else {
        drawLine(x0 - 0.2, y0, x0 - 0.2, y0 + a, COLORS.blue, 2.5);
        labelAt(x0 - 0.2, y0 + a / 2, "a", COLORS.blue);

        drawLine(x0, y0 - 0.2, x0 + b, y0 - 0.2, COLORS.green, 2.5);
        labelAt(x0 + b / 2, y0 - 0.2, "b", COLORS.green);

        if (c > 0.1) {
          drawLine(x0 - 0.4, y0, x0 - 0.4, y0 + c, COLORS.red, 2.5);
          labelAt(x0 - 0.4, y0 + c / 2, "c", COLORS.red);
        }
      }
    }

    // Calcular Punto móvil P
    const tRad = (ell_p * Math.PI) / 180;
    const P = orient === 'horizontal'
      ? [x0 + a * Math.cos(tRad), y0 + b * Math.sin(tRad)]
      : [x0 + b * Math.cos(tRad), y0 + a * Math.sin(tRad)];

    // Selección de foco y directriz correspondiente al lado de P
    let activeF, activeDVal, distPF, distPd, Q;
    const isRight = orient === 'horizontal' ? P[0] >= x0 : P[1] >= y0;

    if (orient === 'horizontal') {
      activeF = isRight ? F2 : F1;
      activeDVal = isRight ? x0 + dDist : x0 - dDist;
      Q = [activeDVal, P[1]];
    } else {
      activeF = isRight ? F2 : F1;
      activeDVal = isRight ? y0 + dDist : y0 - dDist;
      Q = [P[0], activeDVal];
    }

    distPF = Math.hypot(P[0] - activeF[0], P[1] - activeF[1]);
    distPd = Math.hypot(P[0] - Q[0], P[1] - Q[1]);

    if (isChecked('chk-point')) {
      // Dibujar punto Q en la directriz
      if (c > 0.05) {
        drawPoint(Q[0], Q[1], COLORS.purple, "Q");
        // Línea P -> Q
        drawLine(P[0], P[1], Q[0], Q[1], COLORS.gold, 2, true);
        // Distancia a directriz texto
        labelAt((P[0] + Q[0])/2, (P[1] + Q[1])/2 + 0.15, `d(P,d)=${fmt(distPd)}`, COLORS.gold);
      }
      // Línea P -> Foco
      drawLine(P[0], P[1], activeF[0], activeF[1], COLORS.gold, 2);
      labelAt((P[0] + activeF[0])/2 + 0.15, (P[1] + activeF[1])/2, `d(P,F)=${fmt(distPF)}`, COLORS.gold);
      
      // Dibujar punto P
      drawPoint(P[0], P[1], COLORS.gold, "P");
    }

    // Ecuación en HTML
    eqHTML = getEllipseEquationHTML(x0, y0, a, b, orient === 'horizontal');

    // Detalles informativos
    detailsHTML = `
      <h3>Relaciones Geométricas</h3>
      <ul>
        <li><span class="highlight">Centro:</span> C = ${point(C[0], C[1])}</li>
        <li><span class="highlight">Focos:</span> F₁ = ${point(F1[0], F1[1])}, F₂ = ${point(F2[0], F2[1])} (semidistancia <span class="highlight">c = ${fmt(c)}</span>)</li>
        <li><span class="highlight">Ejes:</span> Mayor <span class="highlight">a = ${fmt(a)}</span>, Menor <span class="highlight">b = ${fmt(b)}</span></li>
        ${c > 0.05 ? `
          <li><span class="highlight">Directrices:</span> ${orient === 'horizontal' ? `x = ${fmt(x0 - dDist)} y x = ${fmt(x0 + dDist)}` : `y = ${fmt(y0 - dDist)} y y = ${fmt(y0 + dDist)}`}</li>
          <li><span class="highlight">Excentricidad (e):</span> <span class="math-text">e = c / a</span> = ${fmt(c)} / ${fmt(a)} = <span class="highlight">${fmt(e)}</span></li>
          <li><span class="highlight">Propiedad de la Directriz:</span> La distancia de P al foco es menor que a la directriz. Su cociente es la excentricidad:
            <br>
            <span class="math-text">d(P, F) / d(P, d)</span> = ${fmt(distPF)} / ${fmt(distPd)} = <span class="highlight">${fmt(distPF / distPd)}</span> (constante e igual a <span class="math-text">e</span>)
          </li>
        ` : '<li><span class="highlight">Circunferencia:</span> a = b, por lo tanto c = 0, e = 0. No tiene directriz definida en el plano real.</li>'}
        <li><span class="highlight">Relación pitagórica:</span> Mira el triángulo rectángulo resaltado. La hipotenusa mide exactamente <span class="math-text">a</span>.
          <br>
          De ahí se define: <span class="math-text">a² = b² + c²</span> &rarr; <span class="math-text">c² = a² − b²</span>
        </li>
      </ul>
    `;
  }

  if (type === 'parabola') {
    let x0 = +$('px0').value;
    let y0 = +$('py0').value;
    let c = +$('param-c').value;
    let par_p = +$('par-p').value;

    // Evitar que c sea exactamente 0
    if (Math.abs(c) < 0.25) {
      c = c >= 0 ? 0.25 : -0.25;
      $('param-c').value = c;
    }

    $('px0-val').textContent = fmt(x0);
    $('py0-val').textContent = fmt(y0);
    $('c-val').textContent = fmt(c);
    $('par-p-val').textContent = fmt(par_p);

    const V = [x0, y0];
    let F, dval, P, Q;

    // Curva Parábola
    const pts = [];
    for (let i = -260; i <= 260; i++) {
      const s = i / 22; // parámetro s
      if (orient === 'horizontal') {
        // (y-y0)^2 = 4c(x-x0) -> x = x0 + (y-y0)^2 / 4c
        pts.push([x0 + (s * s) / (4 * c), y0 + s]);
      } else {
        // (x-x0)^2 = 4c(y-y0) -> y = y0 + (x-x0)^2 / 4c
        pts.push([x0 + s, y0 + (s * s) / (4 * c)]);
      }
    }
    drawCurve(pts, COLORS.accent, 3);

    // Eje de simetría
    if (isChecked('chk-axes')) {
      if (orient === 'horizontal') {
        drawLine(xmin, y0, xmax, y0, COLORS.muted, 1, true);
      } else {
        drawLine(x0, ymin, x0, ymax, COLORS.muted, 1, true);
      }
    }

    // Foco y Directriz
    if (orient === 'horizontal') {
      F = [x0 + c, y0];
      dval = x0 - c;
      P = [x0 + (par_p * par_p) / (4 * c), y0 + par_p];
      Q = [dval, P[1]];
    } else {
      F = [x0, y0 + c];
      dval = y0 - c;
      P = [x0 + par_p, y0 + (par_p * par_p) / (4 * c)];
      Q = [P[0], dval];
    }

    if (isChecked('chk-center')) drawPoint(V[0], V[1], COLORS.green, "V");
    if (isChecked('chk-foci')) drawPoint(F[0], F[1], COLORS.red, "F");

    if (isChecked('chk-directrix')) {
      if (orient === 'horizontal') {
        drawLine(dval, ymin, dval, ymax, COLORS.purple, 2, true);
        labelAt(dval, ymax - 0.55, "directriz", COLORS.purple);
      } else {
        drawLine(xmin, dval, xmax, dval, COLORS.purple, 2, true);
        labelAt(xmin + 0.3, dval, "directriz", COLORS.purple);
      }
    }

    // Cotas de c
    if (isChecked('chk-params')) {
      if (orient === 'horizontal') {
        // Vértice al Foco
        drawLine(V[0], V[1] - 0.2, F[0], F[1] - 0.2, COLORS.red, 2);
        labelAt((V[0] + F[0]) / 2, V[1] - 0.2, "|c|", COLORS.red);
        // Vértice a Directriz
        drawLine(V[0], V[1] - 0.2, dval, V[1] - 0.2, COLORS.purple, 2);
        labelAt((V[0] + dval) / 2, V[1] - 0.2, "|c|", COLORS.purple);
      } else {
        // Vértice al Foco
        drawLine(V[0] - 0.2, V[1], F[0] - 0.2, F[1], COLORS.red, 2);
        labelAt(V[0] - 0.2, (V[1] + F[1]) / 2, "|c|", COLORS.red);
        // Vértice a Directriz
        drawLine(V[0] - 0.2, V[1], V[0] - 0.2, dval, COLORS.purple, 2);
        labelAt(V[0] - 0.2, (V[1] + dval) / 2, "|c|", COLORS.purple);
      }
    }

    const distPF = Math.hypot(P[0] - F[0], P[1] - F[1]);
    const distPd = Math.hypot(P[0] - Q[0], P[1] - Q[1]);

    if (isChecked('chk-point')) {
      drawPoint(Q[0], Q[1], COLORS.purple, "Q");
      // Línea P -> Q
      drawLine(P[0], P[1], Q[0], Q[1], COLORS.gold, 2, true);
      labelAt((P[0] + Q[0])/2, (P[1] + Q[1])/2 + 0.15, `d(P,d)=${fmt(distPd)}`, COLORS.gold);

      // Línea P -> Foco
      drawLine(P[0], P[1], F[0], F[1], COLORS.gold, 2);
      labelAt((P[0] + F[0])/2 + 0.15, (P[1] + F[1])/2, `d(P,F)=${fmt(distPF)}`, COLORS.gold);

      drawPoint(P[0], P[1], COLORS.gold, "P");
    }

    // Ecuación en HTML
    eqHTML = getParabolaEquationHTML(x0, y0, c, orient === 'horizontal');

    // Detalles
    const openText = c > 0 
      ? (orient === 'horizontal' ? "abre hacia la derecha" : "abre hacia arriba")
      : (orient === 'horizontal' ? "abre hacia la izquierda" : "abre hacia abajo");

    detailsHTML = `
      <h3>Relaciones Geométricas</h3>
      <ul>
        <li><span class="highlight">Vértice:</span> V = ${point(V[0], V[1])}</li>
        <li><span class="highlight">Foco:</span> F = ${point(F[0], F[1])}</li>
        <li><span class="highlight">Directriz:</span> ${orient === 'horizontal' ? `Recta vertical x = ${fmt(dval)}` : `Recta horizontal y = ${fmt(dval)}`}</li>
        <li><span class="highlight">Parámetro c:</span> c = <span class="highlight">${fmt(c)}</span> (dirección y distancia con signo del vértice al foco). La parábola ${openText}.</li>
        <li><span class="highlight">Excentricidad (e):</span> En la parábola, <span class="highlight">e = 1</span> siempre.</li>
        <li><span class="highlight">Definición de la Directriz:</span> El vértice queda exactamente en medio del foco y la directriz (distancia <span class="highlight">|c|</span> a ambos). 
          <br>
          Cualquier punto P cumple la igualdad de distancias:
          <br>
          <span class="highlight">d(P, F) = d(P, directriz)</span> &rarr; ${fmt(distPF)} = ${fmt(distPd)}
        </li>
      </ul>
    `;
  }

  $('equationReadout').innerHTML = eqHTML;
  $('detailsReadout').innerHTML = detailsHTML;
}

// Etiquetar textos en el Canvas
function labelAt(x, y, text, color) {
  const p = map(x, y);
  ctx.fillStyle = color;
  ctx.font = "bold 12px sans-serif";
  ctx.fillText(text, p.x + 5, p.y - 5);
}

// Escuchas de eventos
window.addEventListener('resize', () => {
  resize();
  updateApp();
});

// Registrar eventos en todos los inputs
const inputIds = [
  'ctype', 'orient', 
  'x0', 'y0', 'param-a', 'param-b', 'ell-p',
  'px0', 'py0', 'param-c', 'par-p',
  'chk-center', 'chk-foci', 'chk-vertices-sec', 'chk-directrix', 'chk-triangle', 'chk-axes', 'chk-params', 'chk-point'
];

inputIds.forEach(id => {
  const el = $(id);
  if (el) {
    const eventType = el.tagName === 'INPUT' && el.type === 'range' ? 'input' : 'change';
    el.addEventListener(eventType, updateApp);
  }
});

// Inicializar la app
window.addEventListener('load', () => {
  resize();
  updateApp();
});
