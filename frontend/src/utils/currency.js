// Formato de moneda para Colombia (COP)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Parsear string de moneda a número
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''));
};

// Validar que el valor sea un número válido
export const isValidCurrency = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};