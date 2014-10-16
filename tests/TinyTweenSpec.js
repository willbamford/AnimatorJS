describe('TinyTween', function () {

  beforeEach(function () {
    /* */
  });

  describe('create', function () {

    it('should be able to instantiate a tween', function () {
      var tween = TinyTween.create();
      expect(tween instanceof TinyTween).toBeTruthy();
    });
  });

  describe('on / off', function () {

    it('should be able to subscribe / unsubscribe to valid event types', function () {
      var tween = TinyTween.create();
      var called = false;
      var callback = function () { called = true; };
      tween.on('start', callback);
      expect(called).toBeFalsy();
      tween.start();
      expect(called).toBeTruthy();
      called = false;
      tween = TinyTween.create();
      tween.on('start', callback);
      tween.off('start', callback);
      tween.start();
      expect(called).toBeFalsy();
    });
  });

  describe('start', function () {

    it('should set the tween running', function () {
      var tween = TinyTween.create();
      expect(tween.running).toBeFalsy();
      tween.start();
      expect(tween.running).toBeTruthy();
    });

    it('should fire a "start" event once', function () {
      var count = 0;
      var tween = TinyTween.create().on('start', function (event) {
        count += 1;
      });
      tween.start();
      tween.start();
      expect(count).toBe(1);
    });
  });

  describe('stop', function () {

    it('should result in tween no longer running', function () {
      var tween = TinyTween.create();
      tween.start();
      expect(tween.running).toBeTruthy();
      tween.stop();
      expect(tween.running).toBeFalsy();
    });

    it('should fire a "stop" event', function () {
      var called = false;
      var tween = TinyTween.create().on('stop', function (event) {
        called = true;
      });
      tween.start();
      tween.stop();
      expect(called).toBeTruthy();
    });
  });

});
