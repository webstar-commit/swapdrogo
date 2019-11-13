const shouldLog = () => process.env.NODE_ENV !== 'production' || window.useLogger;

/**
 * Wrapper around logging.
 */
const Logger = {
  /**
   * Info
   */
  info: (...arguments) =>
    shouldLog() && console.info.apply(null, arguments),

  /**
   * Errors
   */
  error: (...arguments) =>
    shouldLog() && console.error.apply(null, arguments),
  
  /**
   * Log
   */
  log: (...arguments) =>
    shouldLog() && console.log.apply(null, arguments),
};

module.exports = Logger;
