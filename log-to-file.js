// Import.
const fs = require('fs');

/**
 * Append zero to length.
 * @param {string} value Value to append zero.
 * @param {number} length Needed length.
 * @returns {string} String with appended zeros id need it.
 */
function appendZeroToLength(value, length) {
  return `${value}`.padStart(length, '0');
}

/**
 * Get date as text.
 * @returns {string} Date as text. Sample: "2018.12.03, 07:32:13.0162 UTC".
 */
function getDateAsText() {
  const now = new Date();
  // const nowText = appendZeroToLength(now.getUTCFullYear(), 4) + '.'
  //   + appendZeroToLength(now.getUTCMonth() + 1, 2) + '.'
  //   + appendZeroToLength(now.getUTCDate(), 2) + ', '
  //   + appendZeroToLength(now.getUTCHours(), 2) + ':'
  //   + appendZeroToLength(now.getUTCMinutes(), 2) + ':'
  //   + appendZeroToLength(now.getUTCSeconds(), 2) + '.'
  //   + appendZeroToLength(now.getUTCMilliseconds(), 4) + ' UTC';

  const nowText = appendZeroToLength(now.getFullYear(), 4) + '.'
    + appendZeroToLength(now.getMonth() + 1, 2) + '.'
    + appendZeroToLength(now.getDate(), 2) + ', '
    + appendZeroToLength(now.getHours(), 2) + ':'
    + appendZeroToLength(now.getMinutes(), 2) + ':'
    + appendZeroToLength(now.getSeconds(), 2) ;

  return nowText; //new Date().toLocaleString();
}

/**
 * Log to file.
 * @param {string} text Text to log.
 * @param {string} [file] Log file path. Default: `default.log`.
 * @param {string} [delimiter] Delimiter. Default: `\n`.
 */
function logToFile(text, file = 'default.log', delimiter = '\n') {
  // Define log text.
  const logText = getDateAsText() + ' --> ' + text + delimiter;

  // Save log to file.
  fs.appendFile(file, logText, 'utf8', function (error) {
    if (error) {
      // If error - show in console.
      console.log(getDateAsText() + ' --> ' + error);
    }
  });
}

// Export.
module.exports = logToFile;
