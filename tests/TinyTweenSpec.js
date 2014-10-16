describe("TinyTween", function () {

  beforeEach(function () {
    /* */
  });

  describe("create", function () {
    it("should instantiate TinyTween", function () {
      var tween = TinyTween.create();
      expect(tween instanceof TinyTween).toBeTruthy();
    });
  });

});
