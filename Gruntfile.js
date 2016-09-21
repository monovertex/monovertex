module.exports = function (grunt) {

    var dataPath = './data.json',
        imageminOptipng = require('imagemin-optipng');

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        targets: {
            sourceBase: './',
            dist: {
                base: './dist/',
                assets: '<%= targets.dist.base %>assets/'
            },
            styles: {
                base: '<%= targets.sourceBase %>styles/',
                src: '<%= targets.styles.base %>src/',
                build: '<%= targets.styles.base %>build/'
            },
            scripts: {
                src: '<%= targets.sourceBase %>scripts/',
                lib: './bower_components/',
                dist: '<%= targets.dist.assets %>main.js'
            },
            public: {
                src: '<%= targets.sourceBase %>public/',
                dist: '<%= targets.dist.base %>'
            },
            templates: {
                base: '<%= targets.sourceBase %>templates/',
                src: '<%= targets.templates.base %>src/',
                build: '<%= targets.templates.base %>build/',
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
            dist: '<%= targets.dist.base %>*',
            styles: '<%= targets.styles.build %>',
            templates: '<%= targets.templates.build %>'
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
                        src: '*.css',
                        dest: '<%= targets.dist.assets %>'
                    },
                    {
                        expand: true,
                        cwd: '<%= targets.templates.build %>',
                        src: '*.html',
                        dest: '<%= targets.dist.base %>'
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
                        '<%= targets.styles.src %>main.scss'
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
                    '<%= targets.styles.build %>main.css'
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
                    '<%= targets.templates.build %>index.html':
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
                    '<%= targets.dist.base %>index.html': '<%= targets.dist.base %>index.html',
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
                    cwd: '<%= targets.dist.assets %>images',
                    src: ['**/*.png'],
                    dest: '<%= targets.dist.assets %>images'
                }]
            }
        },

        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: '<%= targets.dist.base %>',
                src: ['**/*.{js,css,html}'],
                dest: '<%= targets.dist.base %>',
                ext: function (ext) {
                    return ext + '.gz';
                }
            }
        },

        critical: {
            main: {
                options: {
                    base: './',
                    css: [
                        '<%= targets.dist.assets %>main.css'
                    ],
                    dimensions: [{
                        width: 1920,
                        height: 1800
                    },
                    {
                        width: 1366,
                        height: 700
                    },
                    {
                        width: 500,
                        height: 900
                    }]
                },
                src: '<%= targets.dist.base %>index.html',
                dest: '<%= targets.dist.base %>index.html'
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
                tasks: ['styles', 'templates']
            },
            templates: {
                files: [
                    dataPath,
                    '<%= targets.templates.src %>**/*.pug',
                ],
                tasks: ['templates']
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

    grunt.registerTask('templates', ['pug:dev', 'copy']);

    grunt.registerTask('default', ['clean', 'styles', 'scripts', 'templates']);

    grunt.registerTask('prod', ['clean',
        'sass:prod', 'postcss:prod',
        'jshint:prod', 'uglify:prod',
        'pug:prod', 'copy', 'critical',
        'htmlmin', 'compress', 'imagemin']);

};
