export default function porPage(por=10){
  if(typeof por !== 'number'){
    this.userErrors.push('Valor a buscar no es valido');
    return this
  } else {
    this.porPag = por;
    return this
  }
}