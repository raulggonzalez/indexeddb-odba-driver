//imports
var child_process = require("child_process");

//Grunt
module.exports = function(grunt) {
  //(1) configure
  grunt.config.init({
    pkg: grunt.file.readJSON("package.json"),

    clean: {
      doc: {
        src: ["doc/api/"]
      }
    },

    compress: {
      "api.html": {
        options: {
          mode: "zip",
          archive: "doc/api.html.zip",
          level: 3,
        },

        expand: true,
        cwd: "doc/api/",
        src: "**"
      }
    },

    concat: {
      options: {
        banner: "/*! <%= pkg.name %> - <%= pkg.version %> (<%= grunt.template.today('yyyy-mm-dd') %>) */\n",
        separator: "\n\n"
      },

      "indexeddb-odba-driver.js": {
        src: ["lib/browser-odba-core.js", "lib/index.js", "lib/odba/indexeddb/**"],
        dest: "indexeddb-odba-driver.js"
      }
    },

    jsdoc: {
      "api.html": {
        src: ["lib/"],
        options: {
          recurse: true,
          template: "templates/default",
          destination: "doc/api/",
          "private": false
        }
      }
    },

    jshint: {
      grunt: {
        files: {
          src: ["Gruntfile.js"]
        }
      },

      lib: {
        options: {
          jshintrc: true
        },

        files: {
          src: ["lib/***"]
        }
      },

      test: {
        options: {
          ignores: ["test/vendor/**", "test/**.html"]
        },

        files: {
          src: ["test/**"]
        }
      }
    },

    test: {
      host: "localhost",
      port: 59611,
      chromeFolder: "C:\\Program Files (x86)\\Google\\Chrome\\Application",
      firefoxFolder: "C:\\Program Files (x86)\\Mozilla Firefox",
      app: "http://<%= test.host %>:<%= test.port %>/<%= pkg.name %>",
      index: "<%= test.app %>/test/index.html",
      minIndex: "<%= test.app %>/test/index.min.html",
    },

    uglify: {
      options: {
        banner:  "/*! <%= pkg.name %> - <%= pkg.version %> (<%= grunt.template.today('yyyy-mm-dd') %>) */",
        mangle: false,
        compress: {
          drop_console: true,
          drop_debugger: true,
          properties: true,
          dead_code: true,
          conditionals: true,
          comparisons: true,
          booleans: true,
          loops: true,
          warnings: true
        },
        preserveComments: false
      },

      "indexeddb-odba-driver.min.js": {
        files: {
          "indexeddb-odba-driver.min.js": ["indexeddb-odba-driver.js"]
        }
      }
    }
  });

  //(2) enable plugins
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-compress");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-jsdoc");

  //(3) define tasks
  grunt.registerTask("all", "Generate all modules.", [
    "jshint:grunt",
    "jshint:lib",
    "jshint:test",
    "clean:doc",
    "jsdoc:api.html",
    "compress:api.html",
    "clean:doc",
    "concat:indexeddb-odba-driver.js",
    "uglify:indexeddb-odba-driver.min.js",
    "test:chrome:true"
  ]);

  grunt.registerTask("test", "Perform the unit testing.", function test(browser, min) {
    var chrome = (browser == "chrome" || !browser);
    var firefox = (browser == "firefox" || !browser);
    var index = grunt.config.get(min ? "test.minIndex" : "test.index");

    if (chrome) {
      process.env.PATH += ";" + grunt.config.get("test.chromeFolder");
      child_process.exec("chrome --new-window " + index, undefined, this.async());
    }

    if (firefox) {
      process.env.PATH += ";" + grunt.config.get("test.firefoxFolder");
      child_process.exec("firefox -new-window " + index, undefined, this.async());
    }
  });
};

