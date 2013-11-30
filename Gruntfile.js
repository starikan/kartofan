module.exports = function(grunt) {
    "use strict"

    var topJs = [
      "source/js_vendor/jquery.js",
      "source/js_vendor/jquery-ui.js",
      "source/js_vendor/leaflet-src.js",
      "source/js_vendor/FileSaver.js",
      "source/js_vendor/base64.js ",
      "source/js_vendor/bootstrap.js",
      "source/js_vendor/bootstrap-tour.js",
      "source/js_vendor/pouchdb.js",
      "source/js_vendor/jquery.noty.js",
      "source/js_vendor/jquery.noty.topRight.js",
      "source/js_vendor/jquery.noty.default.js",
      "source/js_vendor/bootstrap-tagsinput.js",
      "source/js_vendor/hammer.js",
      "source/js_vendor/jquery.hammer.js",
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
            src: [ "dev" ]
          },
          prod: {
            src: [ "production" ]
          },
          temp: {
            src: [ "dev/*.jade", "production/*.jade" ]
          }
         },

        copy: {
          dev: {
            cwd: "source",
            src: [ 'data/**', 'css_vendor/**', 'css/**', 'js_vendor/**', 'js/**', 'images/**' ],
            dest: "dev",
            expand: true
          },
          prod: {
            files: [
              {
                cwd: "source",
                src: [ 'data/**' ],
                dest: "production",
                expand: true
              },
              {
                cwd: "source",
                src: [ 'css_vendor/fonts/*', 'css/fonts/*' ],
                dest: "production/fonts",
                flatten: true,
                expand: true
              },
              {
                cwd: "source",
                src: [ 'css_vendor/images/**', 'css/images/**', 'images/**' ],
                dest: "production/images",
                flatten: true,
                expand: true
              },              
            ]
          },
         },

        preprocess: {
          dev: {
            src: "source/index.jade",
            dest: "dev/index.jade",
            options: {
              context: {
                production: false
              }
            }
          },
          prod: {
            src: "source/index.jade",
            dest: "production/index.jade",
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
                    cwd: "dev",
                    src: "**/*.jade",
                    dest: "dev",
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
                    cwd: "production",
                    src: "**/*.jade",
                    dest: "production",
                    expand: true,
                    ext: ".html",
                  }
              ],
          },            
         },

        concat: {
          topJs: {
              dest: "production/top.js",
              src: topJs,
          },
          bottomJs: {
              dest: "production/bottom.js",
              src: bottomJs,
          },
          appCss: {
              dest: "production/app.css",
              src: appCss,
          },
          vendorCss: {
              dest: "production/vendor.css",
              src: vendorCss,
          },
         },

        uglify: {
          topJs: { files: { "production/top.js": topJs } },
          bottomJs: { files: { "production/bottom.js": bottomJs } },
         },

        cssmin: {
          appCss: { files: { "production/app.css": appCss } },
          vendorCss: { files: { "production/vendor.css": vendorCss } },
         },

        watch: {
          options: { livereload: true },
          dev:{
            files: [ "source/**/*.*" ], 
            tasks: [ "copy:dev", "preprocess:dev", "jade:dev", "clean:temp" ],
            options: { livereload: true },
          },
          prod:{
            files: [ "source/**/*.*" ], 
            tasks: [ "copy:prod", "concat", "preprocess:prod", "jade:prod", "clean:temp" ],
            options: { livereload: true },            
          }
         },

        connect: {
          dev: {
              options: { 
                  port: 12345,
                  base: "dev",
                  open: true,
                  livereload: true,
              },
          },
         prod: {
              options: { 
                  port: 12345,
                  base: "production",
                  open: true,
                  livereload: true,
              },
          },
         },
    });

    grunt.registerTask('default', ["clean:dev", "clean:prod", "copy", "preprocess", "jade", "uglify", "cssmin", "clean:temp"]);
    grunt.registerTask('dev', ["clean:dev", "copy:dev", "preprocess:dev", "jade:dev", "clean:temp", "connect:dev", "watch:dev"]);
    grunt.registerTask('prod', ["clean:prod", "copy:prod", "uglify", "cssmin", "preprocess:prod", "jade:prod", "clean:temp", "connect:prod", "watch:prod"]);

 };