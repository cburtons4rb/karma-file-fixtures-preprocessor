/* eslint-disable no-var */

// Dependencies
// =============================================================================
var fs   = require('fs');
var path = require('path');
var util = require('util');


// Constants & Variables
// =============================================================================
var DEFAULTS = {
    // Set the global fixtures variable name
    globalName: '__FIXTURES__',
    // Remove the base path from each fixture key
    stripBasePath: true,
    // Remove from each fixture key
    stripPrefix: null,
    // Transform each fixture key (file path)
    transformKey: function(key) {
        return key;
    },
    // Transform each fixture value (file content)
    transformValue: function(key, value) {
        return value;
    }
};
var FILENAME = 'karma-file-fixtures.js';
var FILEPATH = path.join(__dirname, FILENAME);


// Functions
// =============================================================================
function fileFixtures(args, config, logger, basePath) {
    var log      = logger.create('preprocessor.file-fixtures');
    var output   = '';
    var settings = Object.assign({}, DEFAULTS, config.fileFixtures);

    var GLOBALVAR = 'window.' + settings.globalName;

    config.files.unshift({
        pattern : FILEPATH,
        included: true,
        served  : true,
        watched : true
    });

    output += util.format('%s = %s || {};\n', GLOBALVAR, GLOBALVAR);

    return function(content, file, done) {
        var basePath = path.normalize(config.basePath + '/');
        var filePath = file.originalPath
            .replace(settings.stripBasePath ? basePath : '', '')
            .replace(settings.stripPrefix || '', '');
        var key = util.format('%s[\'%s\']', GLOBALVAR, settings.transformKey(filePath) || filePath);

        if (output.indexOf(key) === -1) {
            var val = content.replace(/([\\\r\n'])/g, '\\$1');

            val = settings.transformValue(key, val) || val;

            log.debug('Processing', file.originalPath);
            output += util.format('\n%s = \'%s\';\n', key, val);
            fs.writeFileSync(FILEPATH, output);
        }

        done(content);
    };
}

fileFixtures.$inject = ['args', 'config', 'logger', 'config.basePath'];


// Export
// =============================================================================
module.exports = {
    'preprocessor:file-fixtures': ['factory', fileFixtures]
};