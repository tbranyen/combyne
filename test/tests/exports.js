define(function(require, exports, module) {
  "use strict";

  var combyne = require("lib/index");

  describe("The exported Combyne function", function() {
    it("is a function", function() {
      expect(combyne).to.be.a("function");
    });
  });
});

//exports.ctor = function(test) {
//  test.expect(4);
//
//  // Test for constructor function
//  helper.testFunction(test.equals, combyne, "combyne");
//
//  // Ensure we get an instance of combyne
//  test.ok(new combyne() instanceof combyne, "Invocation with new returns an instance of combyne");
//  test.ok(combyne() instanceof combyne, "Invocation without new returns an instance of combyne");
//
//  // Test for filters property
//  test.ok(combyne().filters, "Property exists for adding custom filters");
//
//  test.done();
//};
//
//})(typeof global !== "undefined" ? global : this);
//
