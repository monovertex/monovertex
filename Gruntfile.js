module.exports = function (grunt) {

    var dataPath = './data.json',
        imageminOptipng = require('imagemin-optipng');

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        targets: {
            sourceBase: './',
            distBase: './dist/',
            styles: {
                base: '<%= targets.sourceBase %>styles/',
                src: '<%= targets.styles.base %>src/',
                build: '<%= targets.styles.base %>build/'
            },
            scripts: {
                src: '<%= targets.sourceBase %>scripts/',
                lib: './bower_components/',
                dist: '<%= targets.distBase %>assets/scripts.js'
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

        jshint: {
            options: {
                jshintrc: true
            },
            dev: {
                options: {
                    debug: true
                },
                src: '<%= targets.scripts.src %>**/*.js'
            },
            prod: {
                options: {
                    debug: false
                },
                src: [
                    'Gruntfile.js',
                    '<%= jshint.dev.src %>'
                ],
            },
        },

        uglify: {
            dev: {
                options: {
                    compress: false,
                    mangle: false,
                    beautify: true,
                    sourceMap: true
                },
                files: {
                    '<%= targets.scripts.dist %>': [
                        '<%= targets.scripts.lib %>loadcss/src/loadCSS.js',

                        '<%= targets.scripts.src %>main.js',
                    ]
                }
            },
            prod: {
                options: {
                    mangle: {},
                    screwIE8: true,
                    preserveComments: false,
                    compress: {
                        drop_console: true
                    },
                    sourceMap: true,
                },
                files: '<%= uglify.dev.files %>'
            },
        },

        clean: {
            dist: '<%= targets.distBase %>*',
            styles: '<%= targets.styles.build %>'
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
                        cwd: '<%= targets.styles.build %>',
                        src: 'main.*',
                        dest: '<%= targets.distBase %>assets/'
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
                    '<%= targets.styles.build %>main.css':
                        '<%= targets.styles.src %>main.scss',
                    '<%= targets.styles.build %>critical.css':
                        '<%= targets.styles.src %>critical.scss'
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
                src: [
                    '<%= targets.styles.build %>main.css',
                    '<%= targets.styles.build %>critical.css'
                ]
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
                    data: function(dest, src) {
                        var data = require(dataPath);
                        data.debug = true;

                        return data;
                    },
                },
                files: {
                    '<%= targets.templates.dist %>':
                        ['<%= targets.templates.src %>index.pug']
                }
            },
            prod: {
                options: {
                    data: function(dest, src) {
                        var data = require(dataPath);
                        data.debug = false;

                        return data;
                    },
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

        imagemin: {
            dist: {
                options: {
                    optimizationLevel: 4,
                    use: [imageminOptipng()]
                },
                files: [{
                    expand: true,
                    cwd: '<%= targets.distBase %>assets/images',
                    src: ['**/*.png'],
                    dest: '<%= targets.distBase %>assets/images'
                }]
            }
        },

        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: '<%= targets.distBase %>',
                src: ['**/*.{js,css,html}'],
                dest: '<%= targets.distBase %>',
                ext: function (ext) {
                    return ext + '.gz';
                }
            }
        },

        watch: {
            options: {
                livereload: true,
            },
            scripts: {
                files: [
                    '<%= targets.scripts.src %>**/*.js',
                ],
                tasks: ['scripts']
            },
            styles: {
                files: [
                    '<%= targets.styles.src %>**/*.scss',
                ],
                tasks: ['styles']
            },
            templates: {
                files: [
                    dataPath,
                    '<%= targets.styles.build %>critical.css',
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

    grunt.registerTask('scripts', ['jshint:dev', 'uglify:dev']);

    grunt.registerTask('styles', ['sass:dev', 'postcss:dev']);

    grunt.registerTask('default', ['clean', 'styles', 'scripts', 'pug:dev', 'copy']);

    grunt.registerTask('prod', ['clean',
        'sass:prod', 'postcss:prod',
        'jshint:prod', 'uglify:prod',
        'copy', 'pug:prod',
        'htmlmin', 'compress', 'imagemin']);

};
