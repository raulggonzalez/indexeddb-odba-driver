//imports
const child_process = require("child_process");

//Grunt
module.exports = function(grunt) {
  //(1) configure
  grunt.config.init({
    pkg: grunt.file.readJSON("package.json"),

    app: {
      host: "localhost",
      port: 51792,
      chromeFolder: "C:\\Program Files (x86)\\Google\\Chrome\\Application",
      firefoxFolder: "C:\\Program Files (x86)\\Mozilla Firefox",
      app: "http://<%= app.host %>:<%= app.port %>/<%= pkg.name %>",
      index: "<%= app.app %>/test/index.html",
      minIndex: "<%= app.app %>/test/index.min.html",
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
    }
  });

  //(2) enable plugins
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-jshint");

  //(3) define tasks
  grunt.registerTask("test", "Performs the unit testing.", function(browser, min) {
    var chrome = (browser == "chrome" || !browser);
    var firefox = (browser == "firefox" || !browser);

    if (chrome) {
      process.env.PATH += ";" + grunt.config.get("app.chromeFolder");
      child_process.exec("chrome --new-window " + grunt.config.get(min ? "app.minIndex" : "app.index"), undefined, this.async());
    }

    if (firefox) {
      process.env.PATH += ";" + grunt.config.get("app.firefoxFolder");
      child_process.exec("firefox -new-window " + grunt.config.get(min ? "app.minIndex" : "app.index"), undefined, this.async());
    }
  });
};