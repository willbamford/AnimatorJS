describe('Animator', function () {

  describe('create', function () {
    it('should create a new Animator instance', function () {
      var tt = Animator.create();
      expect(tt instanceof Animator).toBeTruthy();
    });
  });
  describe('tween', function () {

    it('should return a new Tween instance', function () {
      var tt = Animator.create();
      var tween = tt.tween();
      expect(tween instanceof Animator.Animation).toBeTruthy();
    });

    it('should add the tween to the active list on "start"', function () {
        var tt = Animator.create();
        var tween = tt.tween();
        expect(tt.active.length).toBe(0);
        tween.start();
        expect(tt.active.length).toBe(1);
    });

    xit('should remove the tween from the active on "stop" or "complete"', function () {

    });
  });

  describe('Clock', function () {

    var Clock = Animator.Clock;
    var clock;

    beforeEach(function () {
      clock = Clock.create({
        requestAnimationFrame: function () {},
        cancelAnimationFrame: function () {}
      });
    });

    describe('create', function () {

      it('should create a new Clock instance', function () {
        expect(clock instanceof Clock).toBeTruthy();
      });
    });

    describe('start', function () {
      it('should start the clock running', function () {
        expect(clock.isRunning).toBeFalsy();
        clock.start();
        expect(clock.isRunning).toBeTruthy();
      });
    });

    describe('stop', function () {
      it('should stop the clock running', function () {
        expect(clock.start().stop().isRunning).toBeFalsy();
      });
    });

    // describe('onTick/offTick', function () {
    //
    //   it('should allow subscription/unsubscription to/from tick events', function () {
    //
    //     var a = function (time) {};
    //     var b = function (time) {};
    //
    //     clock.onTick(a).onTick(b).onTick(b);
    //     expect(clock.listeners.length).toBe(2);
    //     expect(clock.listeners[0]).toBe(a);
    //     expect(clock.listeners[1]).toBe(b);
    //
    //     clock.offTick(a);
    //     expect(clock.listeners.length).toBe(1);
    //     expect(clock.listeners[0]).toBe(b);
    //     clock.offTick(a).offTick(b);
    //     expect(clock.listeners.length).toBe(0);
    //   });

      // it('should run automatically if there are one or more listeners', function () {
      //   var a = function () {};
      //   var b = function () {};
      //   expect(clock.isRunning).toBeFalsy();
      //   clock.onTick(a).onTick(b);
      //   expect(clock.isRunning).toBeTruthy();
      //   clock.offTick(a).offTick(b);
      //   expect(clock.isRunning).toBeFalsy();
      // });
    // });
  });

  describe('Tween', function () {
    describe('create', function () {

      it('should return a new Tween instance', function () {
        var tween = Animator.Animation.create();
        expect(tween instanceof Animator.Animation).toBeTruthy();
      });

      it('should be possible to override the default 1000ms duration', function () {
        var tween = Animator.Animation.create();
        expect(tween.duration).toBe(1000);
        tween = Animator.Animation.create({
          duration: 500
        });
        expect(tween.duration).toBe(500);
      });
    });

    describe('start', function () {

      it('should set the tween running', function () {
        var tween = Animator.Animation.create();
        expect(tween.isRunning).toBeFalsy();
        tween.start();
        expect(tween.isRunning).toBeTruthy();
      });

      it('should fire a "start" event once to all listeners', function () {
        var tween = Animator.Animation.create();
        var countA = 0, countB = 0;
        tween.on(
          'start',
          function (e) { countA += 1; }
        ).on(
          'start',
          function (e) { countB += 1; }
        );
        tween.start().start();
        expect(countA).toBe(1);
        expect(countB).toBe(1);
      });
    });

    describe('stop', function () {

      it('should result in tween no longer running', function () {
        var tween = Animator.Animation.create();
        tween.start();
        expect(tween.isRunning).toBeTruthy();
        tween.stop();
        expect(tween.isRunning).toBeFalsy();
      });

      it('should fire a "stop" event', function () {
        var tween = Animator.Animation.create();
        var called = false;
        tween.on('stop', function (e) {
          called = true;
        });
        tween.start().stop();
        expect(called).toBeTruthy();
      });
    });
  });

  // var tt;
  //
  // beforeEach(function () {
  //   tt = Animator.create();
  // });
  //
  // describe('tween', function () {
  //
  //   it('should create a new instance', function () {
  //     var tween = tt.tween();
  //     expect(tween instanceof Animator.Animation).toBeTruthy();
  //   });
  // });
  //
  // describe('on / off', function () {
  //
  //   it('should be able to subscribe / unsubscribe to valid event types', function () {
  //     var tween = tt.tween();
  //     var called = false;
  //     var callback = function () { called = true; };
  //     tween.on('start', callback);
  //     expect(called).toBeFalsy();
  //     tween.start();
  //     expect(called).toBeTruthy();
  //     called = false;
  //     tween = tt.tween();
  //     tween.on('start', callback);
  //     tween.off('start', callback);
  //     tween.start();
  //     expect(called).toBeFalsy();
  //   });
  // });
  //
  // describe('start', function () {
  //
  //   it('should set the tween running', function () {
  //     var tween = tt.tween();
  //     expect(tween.isRunning).toBeFalsy();
  //     tween.start();
  //     expect(tween.isRunning).toBeTruthy();
  //   });
  //
  //   it('should fire a "start" event once', function () {
  //     var count = 0;
  //     var tween = tt.tween().on('start', function (e) {
  //       count += 1;
  //     });
  //     tween.start();
  //     tween.start();
  //     expect(count).toBe(1);
  //   });
  // });
  //
  // describe('stop', function () {
  //
  //   it('should result in tween no longer running', function () {
  //     var tween = tt.tween();
  //     tween.start();
  //     expect(tween.isRunning).toBeTruthy();
  //     tween.stop();
  //     expect(tween.isRunning).toBeFalsy();
  //   });
  //
  //   it('should fire a "stop" event', function () {
  //     var called = false;
  //     var tween = tt.tween().on('stop', function (e) {
  //       called = true;
  //     });
  //     tween.start();
  //     tween.stop();
  //     expect(called).toBeTruthy();
  //   });
  // });

  // describe('update', function () {
  //
  //   it('should be called periodically (~60fps) whilst animation is running', function () {
  //     var oneSecond = 1000;
  //     var requestAnimationFrame = function (fn) {};
  //     var tween = tt.tween({
  //       requestAnimationFrame: requestAnimationFrame,
  //       duration: oneSecond
  //     });
  //     // tween.on('update', function (e) {
  //     //
  //     // });
  //     spyOn(tween, "requestAnimationFrame");
  //     tween.start();
  //     expect(tween.requestAnimationFrame).toHaveBeenCalled();
  //
  //
  //
  //   });
  // });

});
