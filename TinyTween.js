
var TinyTween = function () {

  this.running = false;

  this.listeners = {
    start: [],
    stop: []
  };
};

TinyTween.create = function () {
  return new TinyTween();
};

TinyTween.prototype.on = function (type, fn) {
  if (this.listeners[type] && this.listeners[type].indexOf(fn) === -1)
    this.listeners[type].push(fn);
  return this;
};

TinyTween.prototype.off = function (type, fn) {
  if (this.listeners[type]) {
    var i = this.listeners[type].indexOf(fn);
    if (i !== -1) this.listeners[type].splice(i, 1);
  }
  return this;
};

TinyTween.prototype.start = function () {
  if (!this.running) {
    this.running = true;
    this._notify('start', {});
  }
  return this;
};

TinyTween.prototype.stop = function () {
  if (this.running) {
    this.running = false;
    this._notify('stop', {});
  }
};

TinyTween.prototype._notify = function (type, event) {
  event = event || {};
  if (this.listeners[type]) {
    this.listeners[type].forEach(function (fn) {
      fn(event);
    });
  }
};

// TinyTween.prototype.off = function ()

// var TinyTween.create({
//   ease: TinyTween.LINEAR,
//   duration: 1000
// });
