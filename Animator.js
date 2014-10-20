(function () {

  var Clock = function (opts) {
    opts = opts || {};
    this.tickListener = null;
    this.requestAnimationFrame = opts.requestAnimationFrame || window.requestAnimationFrame.bind(window);
    this.cancelAnimationFrame = opts.cancelAnimationFrame || window.cancelAnimationFrame.bind(window);
    this.requestId = null;
    this.startTime = null;
    this.isRunning = false;
  };

  Clock.create = function (opts) {
    return new Clock(opts);
  };

  Clock.prototype.onTick = function (fn) {
    this.tickListener = fn;
  };

  Clock.prototype._tick = function (time) {
    if (this.isRunning) {
      var absoluteTime = Date.now();
      if (this.tickListener)
        this.tickListener(absoluteTime);
      this.requestId = this.requestAnimationFrame(this._tick.bind(this));
    }
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

  var Animator = function (opts) {
    opts = opts || {};
    this.clock = opts.clock || Clock.create();
    if (this.clock)
      this.clock.onTick(this.frame.bind(this));

    this.frameListener = null;
    this.active = [];
  };

  Animator.create = function (opts) {
    return new Animator(opts);
  };

  Animator.prototype.onFrame = function (fn) {
    this.frameListener = fn;
    return this;
  };

  Animator.prototype.frame = function (time) {
    this.active.forEach(function (animation) { animation.frame(time); });
    if (this.frameListener) this.frameListener(time);
    return this;
  };

  Animator.prototype.animate = function (opts) {
    opts = opts || {};
    var self = this;
    var animation = Animation.create(opts);
    animation.on('start', function () { self._addToActive(animation); })
      .on('stop', function () { self._removeFromActive(animation); })
      .on('complete', function () { self._removeFromActive(animation); });
    return animation;
  };

  Animator.prototype._addToActive = function (animation) {
    if (this.active.indexOf(animation) === -1) {
      this.active.push(animation);
      if (this.clock && !this.clock.isRunning)
        this.clock.start();
    }
    return this;
  };

  Animator.prototype._removeFromActive = function (animation) {
    var index = this.active.indexOf(animation);
    if (index !== -1) {
      this.active.splice(index, 1);
      if (this.active.length < 1 && this.clock && this.clock.isRunning)
        this.clock.stop();
    }
    return this;
  };

  var Animation = function (opts) {
    opts = opts || {};

    this.duration = (typeof opts.duration !== "undefined") ? opts.duration : 1000;

    this.startTime = null;
    this.currentTime = null;
    this.elapsed = 0;
    this.progress = 0;
    this.frameCount = 0;

    this.isRunning = false;
    this.listeners = {
      start: [],
      stop: [],
      frame: [],
      complete: []
    };
  };

  Animation.create = function (opts) {
    return new Animation(opts);
  };

  Animation.prototype.start = function () {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = this.now();
      this.currentTime = this.startTime;
      this.elapsed = 0;
      this.progress = 0;
      this.frameCount = 0;
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

  Animation.prototype.frame = function (time) {
    if (this.isRunning) {

      var elapsed = time - this.startTime;
      console.log(elapsed);
      var progress = elapsed / this.duration;
      var isComplete = false;
      if (progress < 0)
        progress = 0;
      else if (progress >= 1) {
        progress = 1;
        isComplete = true;
      }

      this.currentTime = time;
      this.elapsed = elapsed;
      this.progress = progress;
      this.frameCount += 1;

      if (isComplete)
        this._complete();
    }
  };

  Animation.prototype._complete = function () {
    if (this.isRunning) {
      this.isRunning = false;
      this._notify('complete', {});
    }
  };

  Animation.prototype.now = function () {
    return Date.now();
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
} ());
