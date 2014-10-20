describe('Animator', function () {

  var mockClock = null;

  beforeEach(function () {
    mockClock = {
      onTick: function () {},
      start: function () {},
      stop: function () {}
    };
  });

  describe('create', function () {
    it('should create a new Animator instance', function () {
      var animator = Animator.create();
      expect(animator instanceof Animator).toBeTruthy();
    });
  });

  describe('onFrame', function () {
    it('should notify listener with time on frame', function () {
      var animator = Animator.create({clock: mockClock});
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
      var animator = Animator.create({clock: mockClock});
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
      var animator = Animator.create({clock: mockClock});
      var animation = animator.animate();
      expect(animation instanceof Animator.Animation).toBeTruthy();
    });

    it('should add the animation to the active list on "start"', function () {
        var animator = Animator.create({clock: mockClock});
        var animation = animator.animate();
        expect(animator.active.length).toBe(0);
        animation.start();
        expect(animator.active.length).toBe(1);
    });

    it('should remove the animation from the active on "stop" or "complete"', function () {
      var animator = Animator.create({clock: mockClock});
      var animation = animator.animate();
      animation.start();
      expect(animator.active.length).toBe(1);
      animation.stop();
      expect(animator.active.length).toBe(0);
    });

    it('should start the clock on first active animation', function () {
      var animator = Animator.create({clock: mockClock});
      var animation = animator.animate();
      spyOn(mockClock, 'start');
      animation.start();
      expect(mockClock.start).toHaveBeenCalled();
    });

    it('should stop the clock when there are no more active animations', function () {
      var startCount = 0;
      var stopCount = 0;
      mockClock = {
        isRunning: false,
        onTick: function () {},
        start: function () { this.isRunning = true; startCount += 1; },
        stop: function () { this.isRunning = false; stopCount += 1; }
      };
      var animator = Animator.create({clock: mockClock});
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

      it('should fire a "start" event (once only)', function () {
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

      it('should fire a "stop" event (once only)', function () {
        var animation = Animator.Animation.create();
        var called = false;
        animation.on('stop', function (e) {
          called = true;
        });
        animation.start().stop();
        expect(called).toBeTruthy();
      });
    });

    describe('frame', function () {
      it('should update the "currentTime", "elapsed", "progress" and "frameCount" properties', function () {
        var animation = Animator.Animation.create({
          duration: 200
        });
        animation.now = function () { return 5000; };
        animation.start();
        expect(animation.startTime).toBe(5000);
        expect(animation.currentTime).toBe(5000);
        expect(animation.elapsed).toBe(0);
        expect(animation.progress).toBe(0);
        expect(animation.frameCount).toBe(0);
        animation.frame(5080);
        expect(animation.currentTime).toBe(5080);
        expect(animation.elapsed).toBe(80);
        expect(animation.progress).toBe(0.4);
        expect(animation.frameCount).toBe(1);
      });
      it('should fire "frame" event', function () {
        var animation = Animator.Animation.create({
          duration: 200
        });
        var calledA = false;
        var calledB = false;
        animation.now = function () { return 100; };
        animation.on('frame', function () { calledA = true; });
        animation.on('frame', function () { calledB = true; });
        animation.start();
        animation.frame(101);
        expect(calledA).toBeTruthy();
        expect(calledB).toBeTruthy();
      });
      it('should stop running and fire a "complete" event when progress complete', function () {
        var called = false;
        var animation = Animator.Animation.create({
          duration: 600
        });
        animation.on('complete', function () {
          called = true;
        });
        animation.now = function () { return 1000 };
        animation.start();
        animation.frame(1400);
        expect(called).toBeFalsy();
        expect(animation.isRunning).toBeTruthy();
        animation.frame(1660);
        expect(called).toBeTruthy();
        expect(animation.isRunning).toBeFalsy();
      });
    });
  });


});
