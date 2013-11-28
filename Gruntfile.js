module.exports = function(grunt) {
    "use strict"

    var sourceFolder = "source";
    var devFolder = "dev";
    var prodFolder = "production";

    var topJs = [
      "source/js_vendor/jquery.js",
      "source/js_vendor/lodash.js",
      "source/js_vendor/leaflet-src.js",
      "source/js_vendor/FileSaver.js",
      "source/js_vendor/base64.js ",
      "source/js_vendor/bootstrap.js",
      "source/js_vendor/bootstrap-tour.js",
      "source/js_vendor/pouchdb.js",
     ];

    var bottomJs = [
      "source/js/starik.kartofan.fn.js",
      "source/js/starik.kartofan.leaflet.js",
      "source/js/starik.kartofan.options.js",
      "source/js/starik.kartofan.stages.js",
      "source/js/starik.kartofan.forms.js",
      "source/js/starik.kartofan.events.js",
      "source/js/starik.kartofan.trip.js",
      "source/js/starik.kartofan.main.js",
     ];
     
    var vendorCss = [
      "source/css_vendor/leaflet.css",
      "source/css_vendor/bootstrap.css",
      "source/css_vendor/bootstrap-tour.css",
    ];
    var appCss = [
      "source/css/starik.kartofan.main.css",
      "source/css/starik.kartofan.menu.css",
      "source/css/starik.kartofan.forms.css",
    ];

     // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        clean: {
          dev: {
            src: [ devFolder ]
          },
          prod: {
            src: [ prodFolder ]
          },
          temp: {
            src: [ devFolder+"/*.jade", prodFolder+"/*.jade" ]
          }
         },

        copy: {
          dev: {
            cwd: sourceFolder,
            src: [ 'data/**', 'css_vendor/**', 'css/**', 'js_vendor/**', 'js/**', 'images/**' ],
            dest: devFolder,
            expand: true
          },
          prod: {
            files: [
              {
                cwd: sourceFolder,
                src: [ 'data/**' ],
                dest: prodFolder,
                expand: true
              },
              {
                cwd: sourceFolder,
                src: [ 'css_vendor/fonts/*', 'css/fonts/*' ],
                dest: prodFolder+"/fonts",
                flatten: true,
                expand: true
              },
              {
                cwd: sourceFolder,
                src: [ 'css_vendor/images/**', 'css/images/**', 'images/**' ],
                dest: prodFolder+"/images",
                flatten: true,
                expand: true
              },              
            ]
          },
         },

        preprocess: {
          dev: {
            src: sourceFolder+"/index.jade",
            dest: devFolder+"/index.jade",
            options: {
              context: {
                production: false
              }
            }
          },
          prod: {
            src: sourceFolder+"/index.jade",
            dest: prodFolder+"/index.jade",
            options: {
              context: {
                production: true
              }
            }
          },          
         },

        jade: {
          dev: {
              options: {
                  data: { debug: false },
                  pretty: true,
              },
              files: [
                  {
                    cwd: devFolder,
                    src: "**/*.jade",
                    dest: devFolder,
                    expand: true,
                    ext: ".html",
                  }
              ],
          },
          prod: {
              options: {
                  data: { debug: false },
                  pretty: true,
              },
              files: [
                  {
                    cwd: prodFolder,
                    src: "**/*.jade",
                    dest: prodFolder,
                    expand: true,
                    ext: ".html",
                  }
              ],
          },            
         },

        concat: {
          topJs: {
              dest: prodFolder+"/top.js",
              src: topJs,
          },
          bottomJs: {
              dest: prodFolder+"/bottom.js",
              src: bottomJs,
          },
          cssApp: {
              dest: prodFolder+"/app.css",
              src: appCss,
          },
          cssVendor: {
              dest: prodFolder+"/vendor.css",
              src: vendorCss,
          },
         },

        watch: {
          options: { livereload: true },
          dev:{
            files: [ sourceFolder+'/**/*.*' ], 
            tasks: [ "copy:dev", "preprocess:dev", "jade:dev", "clean:temp" ],
            options: { livereload: true },
          },
          prod:{
            files: [ sourceFolder+'/**/*.*' ], 
            tasks: [ "copy:prod", "concat", "preprocess:prod", "jade:prod", "clean:temp" ],
            options: { livereload: true },            
          }
         },

        connect: {
            dev: {
                options: { 
                    port: 12345,
                    base: devFolder,
                    open: true,
                    livereload: true,
                },
            },
           prod: {
                options: { 
                    port: 12345,
                    base: prodFolder,
                    open: true,
                    livereload: true,
                },
            },
         },
    });

    grunt.registerTask('default', ["clean", "copy", "preprocess", "jade", "concat", "clean:temp"]);
    // grunt.registerTask('default', ["jade", "concat"]);
    grunt.registerTask('dev', ["clean:dev", "copy:dev", "preprocess:dev", "jade:dev", "clean:temp", "connect:dev", "watch:dev"]);
    grunt.registerTask('prod', ["clean:prod", "copy:prod", "concat", "preprocess:prod", "jade:prod", "clean:temp", "connect:prod", "watch:prod"]);

 };