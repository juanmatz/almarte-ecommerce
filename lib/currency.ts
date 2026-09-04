/**
 * Utilidades para manejo de moneda oficial de Almarte: Pesos Colombianos (COP).
 * Garantiza consistencia en catálogo, carrito, checkout, órdenes y panel admin.
 */

export const MIN_COP_PRICE = 1000;

/**
 * Formatea un valor numérico a Pesos Colombianos (COP).
 * Ejemplo: 85000 -> "$ 85.000 COP" (o "$ 85.000" si showCode es false)
 */
export function formatCOP(
  val: number | null | undefined,
  options: { showCode?: boolean } = { showCode: true }
): string {
  if (val == null || isNaN(val)) {
    return options.showCode ? '$ 0 COP' : '$ 0';
  }
  const rounded = Math.round(val);
  const formatted = rounded.toLocaleString('es-CO');
  return options.showCode ? `$ ${formatted} COP` : `$ ${formatted}`;
}

/**
 * Parsea una entrada de precio en Pesos Colombianos a número entero.
 * Acepta strings como "85.000", "85,000", "85000", "$ 85.000 COP", "1.250.000".
 * Evita el error común donde parseFloat("85.000") produce 85 en lugar de 85000.
 */
export function parseCOPPrice(input: string | number | null | undefined): number {
  if (input == null) return 0;
  if (typeof input === 'number') {
    return isNaN(input) ? 0 : Math.round(input);
  }

  let str = input.trim();
  if (!str) return 0;

  // Remover símbolos de moneda, códigos y espacios
  str = str.replace(/[$€£]/g, '').replace(/COP/gi, '').trim();

  // Caso: múltiples puntos o comas de miles (ej: 1.250.000 o 1,250,000)
  if (/^\d{1,3}([.,]\d{3})+$/.test(str)) {
    const cleaned = str.replace(/[.,]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
  }

  // Caso con punto y coma combinados (ej: 85.000,00 o 85,000.00)
  if (str.includes('.') && str.includes(',')) {
    const lastDot = str.lastIndexOf('.');
    const lastComma = str.lastIndexOf(',');
    if (lastComma > lastDot) {
      // Formato es-CO: punto miles, coma decimales (ej: 85.000,00)
      const cleaned = str.substring(0, lastComma).replace(/\./g, '');
      const num = parseInt(cleaned, 10);
      return isNaN(num) ? 0 : num;
    } else {
      // Formato US: coma miles, punto decimales (ej: 85,000.00)
      const cleaned = str.substring(0, lastDot).replace(/,/g, '');
      const num = parseInt(cleaned, 10);
      return isNaN(num) ? 0 : num;
    }
  }

  // Caso con 3 dígitos exactos después de un punto o coma (ej: 85.000 o 85,000)
  if (/^\d+[.,]\d{3}$/.test(str)) {
    const cleaned = str.replace(/[.,]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
  }

  // Fallback general: extraer solo dígitos
  const cleaned = str.replace(/[^\d]/g, '');
  if (!cleaned) return 0;
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Valida si un valor es un precio comercialmente válido en pesos colombianos.
 * En Colombia, no existen productos comerciales a menos de $1.000 COP.
 */
export function isValidCOPPrice(val: number): boolean {
  return !isNaN(val) && isFinite(val) && val >= MIN_COP_PRICE;
}
