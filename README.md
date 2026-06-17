# Explorador Geométrico de Cónicas

Este es un aplicativo interactivo e ilustrativo en HTML5, CSS y JavaScript para la exploración y visualización didáctica de las **Secciones Cónicas** (Elipse y Parábola).

El aplicativo está diseñado con un enfoque interactivo, visual e intuitivo, eliminando textos densos y formulas cargadas con librerías pesadas para enfocarse en la comprensión directa de las propiedades de las cónicas.

## Características Principales

1. **Explicación Visual de la Directriz y Excentricidad**:
   - Visualiza por qué la directriz de la elipse está más alejada comparada con la de la parábola.
   - Muestra dinámicamente las distancias del punto móvil $P$ al foco ($d(P,F)$) y a la directriz ($d(P,d)$).
   - Comprueba que la relación (cociente) entre estas distancias es siempre constante y equivale a la excentricidad $e$ ($e = c/a < 1$ en la elipse; $e = 1$ en la parábola).

2. **Deducción de la Relación Pitagórica ($a^2 = b^2 + c^2$)**:
   - Resalta el triángulo rectángulo clave con vértices en el Centro $C$, Foco $F$ y Vértice secundario $B$ de la elipse.
   - Demuestra visualmente cómo la hipotenusa de ese triángulo mide exactamente $a$, explicando el origen de la relación geométrica.

3. **Ecuaciones con Denominadores no Evaluados**:
   - Muestra los valores de los semiejes sin calcular sus cuadrados (ej. $3^2$ y $(\sqrt{5})^2$) en los denominadores de las fracciones.
   - Ayuda a identificar de inmediato a qué parámetro corresponde cada término en la forma canónica.

4. **100% Autocontenido**:
   - Funciona sin dependencias de internet ni librerías como KaTeX o MathJax. Las ecuaciones se renderizan con HTML/CSS nativos de forma fluida y responsive.

## Cómo Ejecutar Localmente

### Con Python (Recomendado)
Para evitar bloqueos de seguridad del navegador al abrir archivos locales directamente, puedes correr el servidor web ligero incluido:

1. Abre una terminal o consola de comandos en esta carpeta.
2. Ejecuta el archivo de servidor:
   ```bash
   python run.py
   ```
3. El aplicativo se abrirá automáticamente en tu navegador predeterminado en la dirección:
   [http://localhost:8000](http://localhost:8000)

### Sin Servidor
También puedes abrir directamente el archivo `index.html` haciendo doble clic sobre él en tu explorador de archivos.
