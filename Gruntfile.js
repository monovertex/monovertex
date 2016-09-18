module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        targets: {
            sourceBase: './',
            distBase: './dist/',
            styles: {
                src: '<%= targets.sourceBase %>styles/',
                dist: '<%= targets.distBase %>assets/styles.css'
            },
            public: {
                src: '<%= targets.sourceBase %>public/',
                dist: '<%= targets.distBase %>'
            },
            templates: {
                src: '<%= targets.sourceBase %>templates/',
                dist: '<%= targets.distBase %>index.html'
            }
        },

        clean: {
            dist: '<%= targets.distBase %>*'
        },

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= targets.public.src %>',
                        src: '**',
                        dest: '<%= targets.public.dist %>'
                    },
                    {
                        expand: true,
                        cwd: './bower_components/font-awesome/fonts/',
                        src: '**',
                        dest: '<%= targets.public.dist %>/assets/fonts/'
                    },
                ],
            },
        },

        sass: {
            dev: {
                options: {
                    outputStyle: 'expanded',
                    sourceComments: true,
                    sourceMap: true
                },
                files: {
                    '<%= targets.styles.dist %>': '<%= targets.styles.src %>main.scss'
                }
            },
            prod: {
               options: {
                    outputStyle: 'compressed',
                    sourceMap: true
               },
               files: '<%= sass.dev.files %>'
            }
        },

        postcss: {
            dev: {
                options: {
                    processors: [
                        require('autoprefixer')({ browsers: '> 1%, last 4 versions' }),
                    ]
                },
                src: '<%= targets.styles.dist %>'
            },
            prod: {
                options: {
                    processors: [
                        require('autoprefixer')({ browsers: '> 1%, last 4 versions' }),
                        require('cssnano')({
                            'zindex': false,
                            'mergeIdents': false,
                            'reduceIdents': false
                        })
                    ]
                },
                src: '<%= postcss.dev.src %>'
            }
        },

        pug: {
            dev: {
                options: {
                    pretty: true,
                    data: {
                        debug: true
                    }
                },
                files: {
                    '<%= targets.templates.dist %>':
                        ['<%= targets.templates.src %>index.pug']
                }
            },
            prod: {
                options: {
                    data: {
                        debug: false
                    }
                },
                files: '<%= pug.dev.files %>'
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    '<%= targets.distBase %>index.html': '<%= targets.distBase %>index.html',
                }
            }
        },

        watch: {
            options: {
                livereload: true,
            },
            styles: {
                files: [
                    '<%= targets.styles.src %>**/*.scss',
                ],
                tasks: ['styles']
            },
            templates: {
                files: [
                    '<%= targets.templates.src %>**/*.pug',
                ],
                tasks: ['pug:dev']
            },
            public: {
                files: [
                    '<%= targets.public.src %>**'
                ],
                tasks: ['copy']
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('styles', ['sass:dev', 'postcss:dev']);

    grunt.registerTask('default', ['clean', 'styles', 'pug:dev', 'copy']);

    grunt.registerTask('prod', ['clean', 'sass:prod', 'postcss:prod',
        'copy', 'pug:prod', 'htmlmin']);

};
