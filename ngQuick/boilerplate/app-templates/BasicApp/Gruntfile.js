/**
 * Created by ganapate on 12/2/2014.
 */
/*jslint node: true */
"use strict";
module.exports = function (grunt) {
    var taskLoader = require("load-grunt-tasks");
    taskLoader(grunt,{ pattern: ['grunt-*'] });

    var config = loadConfig('.grunt/config');
    config.pkg = grunt.file.readJSON('./package.json');
    grunt.initConfig(config);

    grunt.registerTask('unittest',['karma'])
    grunt.registerTask('minhtml',['htmlmin']);
    grunt.registerTask('css',['cssmin','concat:cssmin']);
    grunt.registerTask('checkcode',['jshint:all']);
    grunt.registerTask('email',['nodemailer']);
    grunt.registerTask('dev', ['bower', 'connect:server', 'watch:dev']);
    grunt.registerTask('test', ['karma:continuous']);
    grunt.registerTask('minified', ['bower', 'connect:server', 'watch:min','clean:ngmin']);
    grunt.registerTask('package', ['ngmin:app','concat:dist','htmlmin','uglify:dist','jshint:all','cssmin','concat:cssmin','clean:temp']);// 'jshint','compress:dist'
    grunt.registerTask('default',['package']);
};

function loadConfig(configDir){
    var config = {},
        fs = require("fs"),
        path = require("path"),
        taskName;

    fs.readdirSync(configDir).forEach(function(taskConfig){
        if(taskConfig.indexOf(".js")!=-1){
            taskName = taskConfig.replace(/\.js$/, '');
            config[taskName] = require('./' + path.join(configDir, taskName));
        }
    });
    return config;
}


