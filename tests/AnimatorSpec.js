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
    it('should notify listener with the time each frame', function () {
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
    it('should call the "frame" method with the time on all active animations', function () {
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

  // See: http://www.robertpenner.com/easing
  //   t: current time (position)
  //   b: beginning value
  //   c: change in value
  //   d: duration
  describe('easing', function () {

    var testCases = [
      {t: 0, b: 0, c: 100, d: 1000},
      {t: 100, b: 0, c: 1, d: 400},
      {t: 500, b: 0, c: 1, d: 1000},
      {t: 300, b: 0, c: 1, d: 400},
      {t: 50, b: 99, c: 1, d: 50}
    ];
    var testEasing = function (easingFn, expected) {
      var testCase = null;
      var t, e;
      for (var i = 0; i < testCases.length; i++) {
        t = testCases[i];
        e = expected[i];
        var actual = easingFn(t.t, t.b, t.c, t.d);
        expect(e).toBeCloseTo(actual);
      }
    }

    it('linear', function () {
      testEasing(Animator.easing.linear, [0, 0.25, 0.5, 0.75, 100]);
    });

    it('in (quad)', function () {
      testEasing(Animator.easing.in, [0, 0.0625, 0.25, 0.5625, 100]);
    });

    it('out (quad)', function () {
      testEasing(Animator.easing.out, [0, 0.4375, 0.75, 0.9375, 100]);
    });

    it('inOut (quad)', function () {
      testEasing(Animator.easing.inOut, [0, 0.125, 0.5, 0.875, 100]);
    });

    describe('cubic', function () {

      it('in', function () {
        testEasing(Animator.easing.cubic.in, [0, 0.015625, 0.125, 0.421875, 100]);
      });

      it('out', function () {
        testEasing(Animator.easing.cubic.out, [0, 0.578125, 0.875, 0.984375, 100]);
      });

      it('inOut', function () {
        testEasing(Animator.easing.cubic.inOut, [0, 0.0625, 0.5, 0.9375, 100]);
      });
    });

    describe('sine', function () {
      it('in', function () {
        testEasing(Animator.easing.sine.in, [0, 0.076120, 0.292893, 0.617317, 100]);
      });

      it('out', function () {
        testEasing(Animator.easing.sine.out, [0, 0.382683, 0.707107, 0.923880, 100]);
      });

      it('inOut', function () {
        testEasing(Animator.easing.sine.inOut, [0, 0.146447, 0.5, 0.853553, 100]);
      });
    });

    describe('circular', function () {
      it('in', function () {
        testEasing(Animator.easing.circular.in, [0, 0.031754, 0.133974, 0.338562, 100]);
      });

      it('out', function () {
        testEasing(Animator.easing.circular.out, [0, 0.661438, 0.866025, 0.968246, 100]);
      });

      it('inOut', function () {
        testEasing(Animator.easing.circular.inOut, [0, 0.066987, 0.5, 0.933013, 100]);
      });
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

      it('should have a default linear easing which can be overridden', function () {
        var animation = Animator.Animation.create();
        expect(animation.easing).toBe(Animator.easing.linear);
        animation = Animator.Animation.create({
          easing: Animator.easing.cubic.inOut
        });
        expect(animation.easing).toBe(Animator.easing.cubic.inOut);
      });

      it('should override the default 1000ms duration and delay 0ms', function () {
        var animation = Animator.Animation.create();
        expect(animation.duration).toBe(1000);
        expect(animation.delay).toBe(0);
        animation = Animator.Animation.create({
          duration: 500,
          delay: 800
        });
        expect(animation.duration).toBe(500);
        expect(animation.delay).toBe(800);
      });

      it('should initialise the "actor" and "to" properties', function () {
        var easing = function () {};
        var actor = {};
        var to = {};
        var animation = Animator.Animation.create();
        expect(animation.actor).toBeNull();
        expect(animation.to).toBeNull();
        animation = Animator.Animation.create({
          actor: actor,
          to: to
        });
        expect(animation.actor).toBe(actor);
        expect(animation.to).toBe(to);
      });
    });

    describe('notify', function () {

      it('should call listeners with itself as "this" and the "actor" as first argument (if set)', function () {
        var actor = {};
        var animation = Animator.Animation.create({
          actor: actor
        });
        var countA = 0, countB = 0;
        var actualThis = null;
        var actualActor = null;
        animation.on(
          'start',
          function (a) {
            actualThis = this;
            actualActor = a;
          }
        );
        animation.start();
        expect(actualThis).toBe(animation);
        expect(actualActor).toBe(actor);
      });
    });

    describe('start', function () {

      it('should initialise "from" properties with values in "actor" matching "to" object keys', function () {
        var actor = { one: 10, two: "twinsen", three: 5, four: 88};
        var to = { doesNotExist: 20, one: 100, four: 50};
        var animation = Animator.Animation.create({
          actor: actor,
          to: to
        });
        animation.start();
        expect(animation.from).toEqual({one: 10, four: 88});
      });

      it('should initialise animation properties', function () {
        var animation = Animator.Animation.create();
        animation.now = function () { return 42; };
        animation.start();
        expect(animation.startTime).toBe(42);
        expect(animation.currentTime).toBe(42);
        expect(animation.elapsed).toBe(0);
        expect(animation.delta).toBe(0);
        expect(animation.progress).toBe(0);
        expect(animation.frameCount).toBe(0);
      });

      it('should start the animation running', function () {
        var animation = Animator.Animation.create();
        expect(animation.isRunning).toBeFalsy();
        animation.start();
        expect(animation.isRunning).toBeTruthy();
      });

      it('should fire a "start" event (once only)', function () {
        var animation = Animator.Animation.create();
        var countA = 0, countB = 0;
        animation
          .on('start', function () { countA += 1; })
          .on('start', function () { countB += 1; });
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

      it('should update the animation properties', function () {
        var animation = Animator.Animation.create({
          duration: 200
        });
        animation.now = function () { return 5000; };
        animation.start();
        expect(animation.startTime).toBe(5000);
        expect(animation.currentTime).toBe(5000);
        expect(animation.elapsed).toBe(0);
        expect(animation.delta).toBe(0);
        expect(animation.progress).toBe(0);
        expect(animation.frameCount).toBe(0);
        animation.frame(5080);
        expect(animation.currentTime).toBe(5080);
        expect(animation.elapsed).toBe(80);
        expect(animation.delta).toBe(80);
        expect(animation.progress).toBe(0.4);
        expect(animation.frameCount).toBe(1);
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

      it('should apply the easing function to each "actor" property matching "to" property', function () {
        var actor = {x: 100, y: 200};
        var animation = Animator.Animation.create({
          duration: 500,
          actor: actor,
          to: {x: 200, y: 150},
          easing: Animator.easing.in
        });

        animation.now = function () { return 1000; };
        animation.start();
        expect(actor).toEqual({x: 100, y: 200});
        animation.frame(1250);
        expect(actor).toEqual({x: 125, y: 187.5});
        animation.frame(2000);
        expect(actor).toEqual({x: 200, y: 150});
      });
    });

    describe('chain', function () {

      it('should be able to chained animation should be started on complete (but before "complete" event fired)', function () {
        var s = '';
        var a = Animator.Animation.create({duration: 1000});
        a.onComplete(function () {s += '[a.onComplete]';});
        a.now = function () {return 0;};
        var b = Animator.Animation.create({duration: 1000});
        b.onStart(function () {s += '[b.onStart]';});
        b.now = function () {return 1000;};
        var c = a.chain(b);
        expect(c).toBe(a);
        a.start();
        expect(s).toEqual('');
        a.frame(1000);
        expect(s).toEqual('[b.onStart][a.onComplete]');
      });
    });

    describe('repeat', function () {

      it('should be able to repeat an animation "n" times', function () {
        var a = Animator.Animation.create({
          duration: 100,
          repeat: 3
        });
        spyOn(a, 'start').and.callThrough();
        a.now = function () { return 0 };
        a.start();
        expect(a.start.calls.count()).toBe(1);
        a.now = function () { return 100 };
        a.frame(100);
        expect(a.start.calls.count()).toBe(2);
        a.now = function () { return 200 };
        a.frame(250);
        expect(a.start.calls.count()).toBe(3);
        a.now = function () { return 350 };
        a.frame(350);
        expect(a.start.calls.count()).toBe(3);
      });
    });
  });
});
