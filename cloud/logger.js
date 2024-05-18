let logger = {
  baseStyle: `
    padding: 2px 5px;
    background-color: #124F5C;
    border-radius: 4px;
    color: white; 
  `,
  colors: {
    log: '#124F5C',
    error: '#ed2939',
    warn: '#f39c12'
  },
  log(message, secondary) {
    if (process.env.NODE_ENV == 'development' && this.config.debug > 2) {
      let style = logger.baseStyle + `background-color: ${ logger.colors.log }`
      if (secondary) {
        console.log('%c CloudBase ', style, message, secondary)
      }
      else {
        console.log('%c CloudBase ', style, message)
      }
    }
  },
  error(message, secondary) {
    if (process.env.NODE_ENV == 'development' && this.config.debug > 0 && typeof message !== 'undefined') {
      let style = logger.baseStyle + `background-color: ${ logger.colors.error }`
      console.error('%c CloudBase ', style, message)
    }
  },  
  warn(message, secondary) {
    if (process.env.NODE_ENV == 'development' && this.config.debug > 1 && typeof message !== 'undefined') {
      let style = logger.baseStyle + `background-color: ${ logger.colors.warn }`
      console.warn('%c CloudBase ', style, message)
    }
  }
}

export default logger