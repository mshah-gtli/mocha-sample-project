// How to use this
// command-line arguments
// --browsers 'name of browser config file'
// --filter 'Reg expression for matching test names'
// --url 'Base url for running test' (not tested yet)
module.exports = function(grunt) {
  grunt.initConfig({
        loopmocha: {
            src: ["./tests/deal/*.js"],
            options: {
                mocha: {
                    reporter : 'spec',
                    timeout : 30000,
                    ignoreLeaks : false,
                    logErrors : true,
                    fullTrace : true
                    //bail : true,
                    //grep : ".*"
                },
                //loop: {
                //    reportLocation: "test/report"
                //},
                iterations: [
                    /*{
                        "description": "Executing tests on Chrome",
                        "DESIRED": '{"browserName": "chrome","os":"Windows","os_version":"7","browser_version":"54"}'
                    }
                    ,*/
                    {
                        "description": "Executing tests on Firefox",
                        "DESIRED": '{"browserName": "firefox","os":"Windows","os_version":"7","browser_version":"54"}'
                    }
                ]
            }
        }
    });
    grunt.loadNpmTasks('grunt-loop-mocha');
	grunt.registerTask('test', 'loopmocha');
};
