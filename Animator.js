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
      this.requestId = this.requestAnimationFrame(this._tick.bind(this));
      if (this.tickListener)
        this.tickListener(absoluteTime);
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

  /*
   * TERMS OF USE - EASING EQUATIONS
   *
   * Open source under the BSD License.
   *
   * Copyright © 2001 Robert Penner
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without modification,
   * are permitted provided that the following conditions are met:
   *
   * Redistributions of source code must retain the above copyright notice, this list of
   * conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above copyright notice, this list
   * of conditions and the following disclaimer in the documentation and/or other materials
   * provided with the distribution.
   *
   * Neither the name of the author nor the names of contributors may be used to endorse
   * or promote products derived from this software without specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
   * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
   *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
   *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
   * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
   * OF THE POSSIBILITY OF SUCH DAMAGE.
   *
   */
  Animator.easing = {

    /*
      t: current time (position)
      b: initial value
      c: change in value
      d: duration
    */

    linear: function (t, b, c, d) {
      return c * t / d + b;
    },

    in: function (t, b, c, d) {
      return c * (t /= d) * t + b;
    },

    out: function (t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },

    inOut: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t + b;
      return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },

    inCubic: function (t, b, c, d) {
      return c * Math.pow(t / d, 3) + b;
    },

    outCubic: function (t, b, c, d) {
      return c * (Math.pow(t / d-1, 3) + 1) + b;
    },

    inOutCubic: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * Math.pow(t, 3) + b;
      return c / 2 * (Math.pow(t - 2, 3) + 2) + b;
    },

    inSine: function (t, b, c, d) {
      return c * (1 - Math.cos(t / d * (Math.PI / 2))) + b;
    },

    outSine: function (t, b, c, d) {
      return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },

    inOutSine: function (t, b, c, d) {
      return c / 2 * (1 - Math.cos(Math.PI * t / d)) + b;
    },

    inCircular: function (t, b, c, d) {
      return c * (1 - Math.sqrt(1 - (t /= d) * t)) + b;
    },

    outCircular: function (t, b, c, d) {
      return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },

    inOutCircular: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * (1 - Math.sqrt(1 - t * t)) + b;
      return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    }
  };

  var Animation = function (opts) {

    opts = opts || {};

    this.duration = (typeof opts.duration !== "undefined") ? opts.duration : 1000;
    this.easing = opts.easing || null;
    this.from = opts.from || null;
    this.to = opts.to || null;
    this.position = null;

    this.startTime = null;
    this.currentTime = null;
    this.elapsed = 0;
    this.delta = null;
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
      this.delta = 0;
      this.progress = 0;
      this.frameCount = 0;

      if (this.from) this.position = this.from;

      this._notify('start', this);
    }
    return this;
  };

  Animation.prototype.stop = function () {

    if (this.isRunning) {
      this.isRunning = false;
      this._notify('stop', this);
    }
  };

  Animation.prototype.frame = function (time) {

    if (this.isRunning) {

      var elapsed = time - this.startTime;
      var progress = elapsed / this.duration;
      var isComplete = false;

      if (progress < 0) progress = 0;
      else if (progress >= 1) {
        progress = 1;
        isComplete = true;
      }

      var delta = time - this.currentTime;

      this.currentTime = time;
      this.delta = delta;
      this.elapsed = elapsed;
      this.progress = progress;
      this.frameCount += 1;

      if (this.easing)
        this.position = this.easing(elapsed, this.from, this.to - this.from, this.duration);

      this._notify('frame', this);

      if (isComplete) {
        this.isRunning = false;
        this._notify('complete', this);
      }
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
