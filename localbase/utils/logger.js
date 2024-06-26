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
    if (process.env.NODE_ENV == 'development' && this.config.debug) {
      let style = logger.baseStyle + `background-color: ${ logger.colors.log }`
      if (secondary) {
        console.log('%cLocalbase', style, message, secondary)
      }
      else {
        console.log('%cLocalbase', style, message)
      }
    }
  },
  error(message, secondary) {
    if (process.env.NODE_ENV == 'development' && this.config.debug) {
      let style = logger.baseStyle + `background-color: ${ logger.colors.error }`
      console.error('%cLocalbase', style, message)
    }
  },  
  warn(message, secondary) {
    if (process.env.NODE_ENV == 'development' && this.config.debug) {
      let style = logger.baseStyle + `background-color: ${ logger.colors.warn }`
      console.warn('%cLocalbase', style, message)
    }
  }
}

export default logger