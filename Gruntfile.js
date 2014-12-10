//imports
const child_process = require("child_process");

//Grunt
module.exports = function(grunt) {
  //(1) configure
  grunt.config.init({
    pkg: grunt.file.readJSON("package.json"),

    test: {
      host: "localhost",
      port: 51792,
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

      build: {
        files: {
          "odba-indexeddb.min.js": ["lib/*.js", "lib/driver/*"]
        }
      }
    },

    jsdoc: {
      pub: {
        src: ["lib/"],
        options: {
          recurse: true,
          template: "templates/default",
          destination: "doc",
          "private": false
        }
      }
    }
  });

  //(2) enable plugins
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jsdoc");

  //(3) define tasks
  grunt.registerTask("minify", "Generate the min version.", ["uglify"]);
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

