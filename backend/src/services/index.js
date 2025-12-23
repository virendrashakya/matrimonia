const recognitionService = require('./recognitionService');
const fraudService = require('./fraudService');
const searchService = require('./searchService');

module.exports = {
    ...recognitionService,
    ...fraudService,
    ...searchService
};
