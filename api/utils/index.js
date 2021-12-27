const jwt = require('jsonwebtoken')

// Return error with details in JSON
function handleError(err, res, status) {
  console.log(err)

  res.status(status ?? 500).json({ message: err })
}

/**
 * As mongo support for partial searches is not that good(only way is with regex
 * which does not use indexes and is slow), one of the possible solutions is
 * to build a string with possible search strings to do a full text search
 * with a text index. Since it will be applied to short strings, names and
 * surnames mostly, there's not even need to make it asynchronous.
 * Refs: https://stackoverflow.com/a/65730622/5815833
 * https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-edgengram-tokenizer.html
 * @param {string} str String to tokenize
 * @returns String to do a full search with mongo text index
 */
function createEdgeNGrams(str) {
  if (str && str.length > 1) {
    const minGram = 1
    const maxGram = str.length

    return str
      .split(' ')
      .reduce((ngrams, token) => {
        if (token.length > minGram) {
          for (let i = minGram; i <= maxGram && i <= token.length; ++i) {
            ngrams = [...ngrams, token.substr(0, i)]
          }
        } else {
          ngrams = [...ngrams, token]
        }
        return ngrams
      }, [])
      .join(' ')
  }

  return str
}

module.exports = {
  handleError,
  createEdgeNGrams,
}
