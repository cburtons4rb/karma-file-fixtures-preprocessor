/* eslint-disable no-var */

// Dependencies
// =============================================================================
var fs   = require('fs');
var path = require('path');
var util = require('util');


// Constants & Variables
// =============================================================================
var DEFAULTS = {
    globalName: '__FIXTURES__',
    stripBasePath: true,
    stripPrefix: null,
    transformKey: function(path) {
        return path;
    },
    transformContent: function(path, content) {
        return content;
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

        filePath = settings.transformKey(filePath) || filePath;

        var key = util.format('%s[\'%s\']', GLOBALVAR, filePath);

        if (output.indexOf(key) === -1) {
            log.debug('Processing', file.originalPath);
            content = settings.transformContent(filePath, content) || content;
            content = content.replace(/([\\\r\n'])/g, '\\$1');
            output += util.format('\n%s = \'%s\';\n', key, content);
            fs.writeFileSync(FILEPATH, output);
        }

        done(content);
    };
}

fileFixtures.$inject = ['args', 'config', 'logger', 'config.basePath'];


// Init
// =============================================================================
fs.writeFileSync(FILEPATH, '');


// Export
// =============================================================================
module.exports = {
    'preprocessor:file-fixtures': ['factory', fileFixtures]
};
