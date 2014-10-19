describe('Animator', function () {

  describe('create', function () {
    it('should create a new Animator instance', function () {
      var animator = Animator.create();
      expect(animator instanceof Animator).toBeTruthy();
    });
  });
  describe('onFrame', function () {
    it('should notify listener with time on frame', function () {
      var animator = Animator.create();
      var time = 0;
      animator.onFrame(function (t) {
        time = t;
      });
      animator.frame(42);
      expect(time).toBe(42);
    });
  });
  describe('frame', function () {
    it('should call frame method with the time on all active animations', function () {
      var animator = Animator.create();
      var a = 0, b = 0;
      animator.active = [
        { frame: function (time) { a = time; } },
        { frame: function (time) { b = time; } }
      ];
      animator.frame(100);
      expect(a).toBe(100);
      expect(b).toBe(100);
    });
  });
  describe('animate', function () {

    it('should return a new Animation instance', function () {
      var animator = Animator.create();
      var animation = animator.animate();
      expect(animation instanceof Animator.Animation).toBeTruthy();
    });

    it('should add the animation to the active list on "start"', function () {
        var animator = Animator.create();
        var animation = animator.animate();
        expect(animator.active.length).toBe(0);
        animation.start();
        expect(animator.active.length).toBe(1);
    });

    it('should remove the animation from the active on "stop" or "complete"', function () {
      var animator = Animator.create();
      var animation = animator.animate();
      animation.start();
      expect(animator.active.length).toBe(1);
      animation.stop();
      expect(animator.active.length).toBe(0);
    });

    it('should start the clock on first active animation', function () {
      var mockClock = { onTick: function () {}, start: function () {} };
      var animator = Animator.create({ clock: mockClock });
      var animation = animator.animate();
      spyOn(mockClock, 'start');
      animation.start();
      expect(mockClock.start).toHaveBeenCalled();
    });

    it('should automatically start the clock on first active animation and stop on last', function () {
      var startCount = 0;
      var stopCount = 0;
      var mockClock = {
        isRunning: false,
        onTick: function () {},
        start: function () { this.isRunning = true; startCount += 1; },
        stop: function () { this.isRunning = false; stopCount += 1; }
      };
      var animator = Animator.create({ clock: mockClock });
      var a1 = animator.animate();
      expect(startCount).toBe(0);
      expect(stopCount).toBe(0);
      a1.start();
      expect(startCount).toBe(1);
      expect(stopCount).toBe(0);
      var a2 = animator.animate();
      a2.start();
      expect(startCount).toBe(1);
      a1.stop();
      expect(stopCount).toBe(0);
      a2.stop();
      expect(stopCount).toBe(1);
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

  describe('Animation', function () {
    describe('create', function () {

      it('should return a new Animation instance', function () {
        var animation = Animator.Animation.create();
        expect(animation instanceof Animator.Animation).toBeTruthy();
      });

      it('should be possible to override the default 1000ms duration', function () {
        var animation = Animator.Animation.create();
        expect(animation.duration).toBe(1000);
        animation = Animator.Animation.create({
          duration: 500
        });
        expect(animation.duration).toBe(500);
      });
    });

    describe('start', function () {

      it('should set the animation running', function () {
        var animation = Animator.Animation.create();
        expect(animation.isRunning).toBeFalsy();
        animation.start();
        expect(animation.isRunning).toBeTruthy();
      });

      it('should fire a "start" event once to all listeners', function () {
        var animation = Animator.Animation.create();
        var countA = 0, countB = 0;
        animation.on(
          'start',
          function (e) { countA += 1; }
        ).on(
          'start',
          function (e) { countB += 1; }
        );
        animation.start().start();
        expect(countA).toBe(1);
        expect(countB).toBe(1);
      });
    });

    describe('stop', function () {

      it('should result in animation no longer running', function () {
        var animation = Animator.Animation.create();
        animation.start();
        expect(animation.isRunning).toBeTruthy();
        animation.stop();
        expect(animation.isRunning).toBeFalsy();
      });

      it('should fire a "stop" event', function () {
        var animation = Animator.Animation.create();
        var called = false;
        animation.on('stop', function (e) {
          called = true;
        });
        animation.start().stop();
        expect(called).toBeTruthy();
      });
    });
  });

  // var animator;
  //
  // beforeEach(function () {
  //   animator = Animator.create();
  // });
  //
  // describe('animation', function () {
  //
  //   it('should create a new instance', function () {
  //     var animation = animator.animate();
  //     expect(animation instanceof Animator.Animation).toBeTruthy();
  //   });
  // });
  //
  // describe('on / off', function () {
  //
  //   it('should be able to subscribe / unsubscribe to valid event types', function () {
  //     var animation = animator.animate();
  //     var called = false;
  //     var callback = function () { called = true; };
  //     animation.on('start', callback);
  //     expect(called).toBeFalsy();
  //     animation.start();
  //     expect(called).toBeTruthy();
  //     called = false;
  //     animation = animator.animate();
  //     animation.on('start', callback);
  //     animation.off('start', callback);
  //     animation.start();
  //     expect(called).toBeFalsy();
  //   });
  // });
  //
  // describe('start', function () {
  //
  //   it('should set the animation running', function () {
  //     var animation = animator.animate();
  //     expect(animation.isRunning).toBeFalsy();
  //     animation.start();
  //     expect(animation.isRunning).toBeTruthy();
  //   });
  //
  //   it('should fire a "start" event once', function () {
  //     var count = 0;
  //     var animation = animator.animate().on('start', function (e) {
  //       count += 1;
  //     });
  //     animation.start();
  //     animation.start();
  //     expect(count).toBe(1);
  //   });
  // });
  //
  // describe('stop', function () {
  //
  //   it('should result in animation no longer running', function () {
  //     var animation = animator.animate();
  //     animation.start();
  //     expect(animation.isRunning).toBeTruthy();
  //     animation.stop();
  //     expect(animation.isRunning).toBeFalsy();
  //   });
  //
  //   it('should fire a "stop" event', function () {
  //     var called = false;
  //     var animation = animator.animate().on('stop', function (e) {
  //       called = true;
  //     });
  //     animation.start();
  //     animation.stop();
  //     expect(called).toBeTruthy();
  //   });
  // });

  // describe('frame', function () {
  //
  //   it('should be called periodically (~60fps) whilst animation is running', function () {
  //     var oneSecond = 1000;
  //     var requestAnimationFrame = function (fn) {};
  //     var animation = animator.animate({
  //       requestAnimationFrame: requestAnimationFrame,
  //       duration: oneSecond
  //     });
  //     // animation.on('frame', function (e) {
  //     //
  //     // });
  //     spyOn(animation, "requestAnimationFrame");
  //     animation.start();
  //     expect(animation.requestAnimationFrame).toHaveBeenCalled();
  //
  //
  //
  //   });
  // });

});
