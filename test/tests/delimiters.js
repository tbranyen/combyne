define(function(require, exports, module) {
  "use strict";

  var combyne = require("lib/index");

  describe("Delimiters", function() {});
});

/*
    //Helper function to set the template delimiters
    function setDelimiters(tmpl){
      tmpl.delimiters = {
        START_PROP: '[[',
        END_PROP: ']]'
      };
    }

    var tmpl = combyne('[[New]]', {New: 'meow'});
    setDelimiters(tmpl);
    test.equals(tmpl.render(), 'meow', 'Basic Delimiters');
    
    var tmpl2 = combyne('[[one]] {{two}}', {one: 'meow', two: 'nothing'});
    setDelimiters(tmpl2);
    test.equals(tmpl2.render(), 'meow {{two}}', 'Delimiters mixed');

    var tmpl3 = combyne('[[one]] {{two}}', {one: 'meow', two: 'nothing'});
    test.equals(tmpl3.render(), '[[one]] nothing', 'Delimiters mixed 2');
*/
