export default function page(page = 1) {
  if (typeof page !== 'number') {
    this.userErrors.push('Valor a buscar no es valido');
    return this
  } else if (page < 1) {
    this.userErrors.push('Valor a buscar no es valido');
    return this
  } else {
    this.current = page;
    return this
  }
}