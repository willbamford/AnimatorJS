(function () {

  // =====
  // Clock
  // =====

  var Clock = function (opts) {
    opts = opts || {};
    this.callback = null;
    this.requestAnimationFrame = opts.requestAnimationFrame || window.requestAnimationFrame.bind(window);
    this.cancelAnimationFrame = opts.cancelAnimationFrame || window.cancelAnimationFrame.bind(window);
    this.requestId = null;
    // this.listeners = [];
    this.startTime = null;
    this.isRunning = false;
  };

  Clock.create = function (opts) {
    return new Clock(opts);
  };

  Clock.prototype.onTick = function (fn) {
    this.callback = fn;
  };

  // Clock.prototype.onTick = function (fn) {
  //   if (this.listeners.indexOf(fn) === -1) {
  //     this.listeners.push(fn);
  //     if (!this.isRunning)
  //       this._start();
  //   }
  //   return this;
  // };
  //
  // Clock.prototype.offTick = function (fn) {
  //   var i = this.listeners.indexOf(fn);
  //   if (i !== -1) {
  //     this.listeners.splice(i, 1);
  //     if (this.listeners.length < 1) {
  //       this._stop();
  //     }
  //   }
  //   return this;
  // };

  Clock.prototype._tick = function (time) {
    if (this.callback)
      this.callback(time);
    // this.listeners.forEach(function (listener) {
    //   listener(time);
    // });
    this.requestId = this.requestAnimationFrame(this._tick.bind(this));
  };

  Clock.prototype.start = function () {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = Date.now();
      this.requestId = this.requestAnimationFrame(this._tick.bind(this));
    }
    return this;
  };

  Clock.prototype.stop = function () {
    if (this.isRunning) {
      this.isRunning = false;
      this.cancelAnimationFrame(this.requestId);
    }
    return this;
  };






  // ========
  // Animator
  // ========

  var Animator = function (opts) {
    opts = opts || {};
    this.clock = opts.clock || Clock.create();
    if (this.clock)
      this.clock.onTick(this.update.bind(this));

    this.active = [];
  };

  Animator.create = function (opts) {
    return new Animator(opts);
  };

  Animator.prototype.update = function (time) {
    // console.log('Update...: ' + time);

  };

  Animator.prototype.tween = function (opts) {
    opts = opts || {};
    var self = this;
    var tween = Animation.create(opts);
    tween.on('start', function () {
        self._addToActive(tween);
    });
    // tween.on('stop');
    // tween.on('complete');
    return tween;
  };

  Animator.prototype._addToActive = function (tween) {
    if (this.active.indexOf(tween) === -1) {
      this.active.push(tween);
      // if ()
      // if (!this.isRunning)
      //   this._start();
    }
    return this;
  };




  // =========
  // Animation
  // =========

  var Animation = function (opts) {
    opts = opts || {};
    this.duration = (typeof opts.duration !== "undefined") ? opts.duration : 1000;
    this.isRunning = false;
    this.listeners = {
      start: [],
      stop: [],
      update: [],
      complete: []
    };
  };

  Animation.create = function (opts) {
    return new Animation(opts);
  };

  Animation.prototype.start = function () {
    if (!this.isRunning) {
      this.isRunning = true;
      this._notify('start', {});
    }
    return this;
  };

  Animation.prototype.stop = function () {
    if (this.isRunning) {
      this.isRunning = false;
      this._notify('stop', {});
    }
  };

  Animation.prototype.update = function () {
    // ...
  };

  Animation.prototype.on = function (type, fn) {
    if (this.listeners[type] && this.listeners[type].indexOf(fn) === -1)
      this.listeners[type].push(fn);
    return this;
  };

  Animation.prototype.off = function (type, fn) {
    if (this.listeners[type]) {
      var i = this.listeners[type].indexOf(fn);
      if (i !== -1) this.listeners[type].splice(i, 1);
    }
    return this;
  };

  Animation.prototype._notify = function (type, event) {
    event = event || {};
    if (this.listeners[type]) {
      this.listeners[type].forEach(function (fn) {
        fn(event);
      });
    }
  };

  Animator.Clock = Clock;
  Animator.Animation = Animation;
  window.Animator = Animator;

  // Animator.prototype.off = function ()

  // var Animator.create({
  //   ease: Animator.LINEAR,
  //   duration: 1000
  // });
} ());
