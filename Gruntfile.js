//imports
const child_process = require("child_process");

//Grunt
module.exports = function(grunt) {
  //(1) configure
  grunt.config.init({
    pkg: grunt.file.readJSON("package.json"),

    test: {
      host: "localhost",
      port: 53298,
      chromeFolder: "C:\\Program Files (x86)\\Google\\Chrome\\Application",
      firefoxFolder: "C:\\Program Files (x86)\\Mozilla Firefox",
      app: "http://<%= test.host %>:<%= test.port %>/<%= pkg.name %>",
      index: "<%= test.app %>/test/index.html",
      minIndex: "<%= test.app %>/test/index.min.html",
    },

    jshint: {
      options: {
        jshintrc: true,
        all: ["Gruntfile.js", "lib/*.js", "lib/driver/*.js", "test/js/*.js"],
        force: false
      }
    },

    concat: {
      options: {
        separator: "\n\n"
      },

      "indexeddb-odba-driver.min.js": {
        src: ["lib/index.js", "lib/odba/*.js", "lib/odba/indexeddb/*"],
        dest: "indexeddb-odba-driver.min.js"
      }
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
          "indexeddb-odba-driver.min.js": ["lib/index.js", "lib/odba/*.js", "lib/odba/indexeddb/*"]
        }
      }
    },

    jsdoc: {
      "public": {
        src: ["lib/"],
        options: {
          recurse: true,
          template: "templates/default",
          destination: "doc/api/",
          "private": false
        }
      }
    },

    compress: {
      jsdoc: {
        options: {
          mode: "zip",
          archive: "doc/api.html.zip",
          level: 3,
        },

        expand: true,
        cwd: "doc/api/",
        src: "**",
        /*dest: "api"*/

      }
    },

    clean: {
      jsdoc: {
        src: ["doc/api/"]
      }
    },
  });

  //(2) enable plugins
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-compress");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-jsdoc");

  //(3) define tasks
  grunt.registerTask("minify", "Generate the min version.", ["uglify:indexeddb-odba-driver.min.js"]);
  grunt.registerTask("jspubdoc", "Generate the API JSDoc.", ["clean:jsdoc", "jsdoc:public", "compress:jsdoc", "clean:jsdoc"]);
  grunt.registerTask("minifyAndDocify", "Generate the min version and the API JSDoc.", ["jspubdoc", "minify"]);

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

