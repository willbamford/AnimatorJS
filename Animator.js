(function () {

  var now = function () {
    return (
      window.performance && window.performance.now ?
      window.performance.now() :
      Date.now()
    );
  };

  var Clock = function (opts) {
    opts = opts || {};
    this.tickListener = null;
    this.requestAnimationFrame = opts.requestAnimationFrame || window.requestAnimationFrame.bind(window);
    this.cancelAnimationFrame = opts.cancelAnimationFrame || window.cancelAnimationFrame.bind(window);
    this.requestId = null;
    this.startTime = null;
    this.isRunning = false;
    this.isComplete = false;
  };

  Clock.create = function (opts) {
    return new Clock(opts);
  };

  Clock.prototype.onTick = function (fn) {
    this.tickListener = fn;
  };

  Clock.prototype._tick = function (time) {
    if (this.isRunning) {
      var absoluteTime = now();
      this.requestId = this.requestAnimationFrame(this._tick.bind(this));
      if (this.tickListener)
        this.tickListener(absoluteTime);
    }
  };

  Clock.prototype.start = function () {
    if (!this.isRunning) {
      this.isRunning = true;
      this.isComplete = false;
      this.startTime = now();
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
    animation.onStart(function () { self._addToActive(animation); })
      .onStop(function () { self._removeFromActive(animation); })
      .onComplete(function () { self._removeFromActive(animation); });
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

    cubic: {
      in: function (t, b, c, d) {
        return c * Math.pow(t / d, 3) + b;
      },
      out: function (t, b, c, d) {
        return c * (Math.pow(t / d-1, 3) + 1) + b;
      },
      inOut: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(t, 3) + b;
        return c / 2 * (Math.pow(t - 2, 3) + 2) + b;
      }
    },

    sine: {
      in: function (t, b, c, d) {
        return c * (1 - Math.cos(t / d * (Math.PI / 2))) + b;
      },

      out: function (t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
      },

      inOut: function (t, b, c, d) {
        return c / 2 * (1 - Math.cos(Math.PI * t / d)) + b;
      }
    },

    circular: {
      in: function (t, b, c, d) {
        return c * (1 - Math.sqrt(1 - (t /= d) * t)) + b;
      },

      out: function (t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
      },

      inOut: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * (1 - Math.sqrt(1 - t * t)) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
      }
    }
  };

  var Animation = function (opts) {

    opts = opts || {};

    this.duration = (opts.duration !== undefined) ? opts.duration : 1000;
    this.delay = (opts.delay !== undefined) ? opts.delay : 0;
    this.easing = opts.easing || Animator.easing.linear;
    this.repeat = opts.repeat || 1;
    this.iteration = 0;

    this.actor = opts.actor || null;
    this.to = opts.to || null;
    this.from = null;

    this.startTime = null;
    this.currentTime = null;
    this.elapsed = 0;
    this.delta = null;
    this.progress = 0;
    this.frameCount = 0;

    this.chained = null;

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

    var self = this;
    if (!this.isRunning) {
      this.isRunning = true;

      if (this.actor && this.to && !this.from) {
        this.from = {};
        for (var name in this.to)
          if (this.actor[name] !== undefined)
            this.from[name] = this.actor[name];
      }

      this.startTime = this.now();
      this.currentTime = this.startTime;
      this.elapsed = 0;
      this.delta = 0;
      this.progress = 0;
      this.frameCount = 0;

      this._notify('start');
    }
    return this;
  };

  Animation.prototype.stop = function () {

    if (this.isRunning) {
      this.isRunning = false;
      this.iteration = 0;
      this._notify('stop');
    }
  };

  Animation.prototype.chain = function (animation) {
    this.chained = animation;
    return this;
  };

  Animation.prototype.frame = function (time) {

    if (this.isRunning) {

      var elapsed = (time - this.startTime) - this.delay;
      if (elapsed < 0)
        return;

      var isComplete = false;
      if (elapsed >= this.duration) {
        elapsed = this.duration;
        isComplete = true;
      }

      var progress = elapsed / this.duration;
      var delta = time - this.currentTime;

      this.currentTime = time;
      this.delta = delta;
      this.elapsed = elapsed;
      this.progress = progress;
      this.frameCount += 1;

      if (this.actor) {
        for (var name in this.to) {
          if (this.actor[name] !== undefined) {
            this.actor[name] = this.easing(
              elapsed, this.from[name], this.to[name] - this.from[name], this.duration
            );
          }
        }
      }

      this._notify('frame');

      if (isComplete) {
        this.isRunning = false;
        if (this.iteration < this.repeat - 1) {
          this.iteration += 1;
          this.start();
        } else {
          this.iteration = 0;
          if (this.chained)
            this.chained.start();
          this._notify('complete');
        }
      }
    }
  };

  Animation.prototype.now = function () {
    return now();
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

  Animation.prototype.onStart = function (fn) { return this.on('start', fn); };
  Animation.prototype.offStart = function (fn) { return this.off('start', fn); };
  Animation.prototype.onStop = function (fn) { return this.on('stop', fn); };
  Animation.prototype.offStop = function (fn) { return this.off('stop', fn); };
  Animation.prototype.onComplete = function (fn) { return this.on('complete', fn); };
  Animation.prototype.offComplete = function (fn) { return this.off('complete', fn); };
  Animation.prototype.onFrame = function (fn) { return this.on('frame', fn); };
  Animation.prototype.offFrame = function (fn) { return this.off('frame', fn); };

  Animation.prototype._notify = function (type) {
    var self = this;
    if (this.listeners[type]) {
      this.listeners[type].forEach(function (fn) {
        fn.call(self, self.actor);
      });
    }
  };

  Animator.Clock = Clock;
  Animator.Animation = Animation;

  if (typeof define == 'function' && typeof define.amd == 'object')
    define(Animator);
  else
    window.Animator = Animator;

} ());
