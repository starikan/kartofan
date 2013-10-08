//Стандартный экспорт модуля в nodejs
module.exports = function(grunt) {

     // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Инициализация конфига GruntJS
    grunt.initConfig({

        //Например проверка кода javascript с помощью утилиты jshint
        jshint: {},

        //Склеивание файлов
        concat: {},

        jade: {
            compile: {
                options: {
                    data: {
                        debug: false,
                    },
                    pretty: true,
                },
                files: {
                    "index.html": ["index.jade"]
                }
            }
        },

        watch: {

            options: { 
                livereload: true 
            },   
                     
            // all: {
            //     options: { 
            //         livereload: true 
            //     },
            //     files: ['*index.jade', "*index.html"],
            //     tasks: ['jade'],
            // },

            html: {
                files: ['index.html'],
                livereload: true,
            },            
        },

        connect: {
            server: {
                options: {
                    // port: 35729,
                    // base: ".",
                    open: true,
                    livereload: true,
                },
            }
        },
    });

    //Эти задания будут выполнятся сразу же когда вы в консоли напечатание grunt, и нажмете Enter
    // grunt.registerTask('default', ['jshint', 'concat']);
    grunt.registerTask('default', ["jade"]);
    // grunt.registerTask('default', ["watch"]);

    // Creates the `server` task
    grunt.registerTask('server', [
        "connect",
        "watch",
    ]);    
 };