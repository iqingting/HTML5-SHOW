/**
 * 刮刮卡
 * Update 2014/11/26
 * @param config {object}
 * @param config.elem      {string|object} <img>或者包含<img>的id或者DOM
 * @param config.condition {number}  触发条件，刮出的百分比大于此值的时候触发回调
 * @param config.callback  {function} 达到触发条件时的回调函数
 */
(function(win, doc) {

  'user strict';

  // mouse和touch事件使用判断
  var _e = {
    start  : 'mousedown',
    move   : 'mousemove',
    end    : 'mouseup',
    cancel : 'mouseout'
  }
  doc.createTouch && (_e.start = 'touchstart', _e.move = 'touchmove', _e.end = 'touchend', _e.cancel = 'touchcancel');

  var scratch = function() {};

  scratch.prototype.init = function(config) {

    this.defaults = {
      elem      : null,
      condition : 80,
      lineWidth : 30,
      bg        : '#eee',
      clear     : false,
      down      : null,
      move      : null,
      callback  : null
    };

    // 一些变量
    this.canvas = document.createElement('canvas');
    this.canvas.crossOrigin = "*"; // 跨域

    // 是否支持 canvas 的判断
    try {
      this.cxt = this.canvas.getContext('2d');
    } catch(e) {
      console.log('浏览器不支持canvas，程序无法向下进行...请更换IE9+浏览器');
      win.scratch = function(){};
      return;
    }

    config = config || {};

    var defaults = this.defaults;

    for (var i in defaults) {
      defaults.hasOwnProperty(i) && !config.hasOwnProperty(i) && (config[i] = defaults[i]);
    }

    var elem = config.elem;

    typeof elem === 'string' && (elem = document.getElementById(elem));

    config.elem = elem;
    
    this.config = config;

    this.isImage = (elem.nodeName.toLowerCase() === 'img');


    var _this = this;

    if (!elem) {
      console.error('必须传入需要触发的DOM');
      return;
    } else if (this.isImage) {

      var imgOjbect = new Image();
      imgOjbect.src = elem.src;
      imgOjbect.addEventListener('load', function() {
        _this.createCanvas.call(_this);
      }, false);

    } else {
      this.createCanvas();
    }

  };

  scratch.prototype.createCanvas = function() {

    var elem = this.config.elem,
        canvas = this.canvas,
        cxt = this.cxt;

    var width = elem.offsetWidth,
        height = elem.offsetHeight,
        offLeft = elem.offsetLeft,
        offTop = elem.offsetTop;

    this.width = width;
    this.height = height;
    this.offLeft = offLeft;
    this.offTop = offTop;

    // 将canvas覆盖在DOM上
    canvas.style.cssText = 'position: absolute; left: ' + offLeft + 'px' + '; top: ' + offTop + 'px';
    canvas.width = width;
    canvas.height = height;

    cxt.fillRect(0, 0, width, height);


    // 背景可以是单纯颜色也可以是图片
    var bg = this.config.bg;

    if (bg.charAt(0) === '#') {

      cxt.fillStyle = bg;
      cxt.beginPath();
      cxt.fillRect(0, 0, width, height); // 灰度
      cxt.fill();
      cxt.closePath();

    } else {

      var bgObeject = new Image();
      bgObeject.crossOrigin = '*';
      bgObeject.src = bg;
      bgObeject.onload = function() {
        cxt.drawImage(this, 0, 0, width, height);
      };
    }

    doc.body.appendChild(canvas);

    var _this = this;

    this.on(_e.start, this.fnStart);
    this.on(_e.move, this.fnMove);
    this.on(_e.end, this.fnEnd);
    this.on(_e.cancel, this.fnEnd);
  };

  scratch.prototype.on = function(type, fn) {
    var _this = this;
    this.canvas.addEventListener(type, function(e) {
      e.preventDefault();
      e.changedTouches && (e = e.changedTouches[e.changedTouches.length-1]);
      fn.call(_this, e);
    }, false);
  };

  scratch.prototype.fnStart = function(e) {
    this.down = true;

    var canvas = this.canvas,
        cxt = this.cxt,
        config = this.config;

    this.x = e.pageX - this.offLeft;
    this.y = e.pageY - this.offTop;

    // 绘制圆
    cxt.globalCompositeOperation = 'destination-out';
    cxt.strokeStyle = '#fff';
    cxt.lineJoin = 'round';
    cxt.lineWidth = config.lineWidth;
    cxt.beginPath();
    cxt.arc(this.x, this.y, config.lineWidth/2, 0, Math.PI*2, true);
    cxt.closePath();
    cxt.fill();

    config.down && config.down();
  };
  
  scratch.prototype.fnMove = function(e) {
    if (!this.down) return;

    var cxt = this.cxt;

    cxt.moveTo(this.x, this.y);
    this.x = e.pageX - this.offLeft;
    this.y = e.pageY - this.offTop;
    cxt.lineTo(this.x, this.y);
    cxt.closePath();
    cxt.stroke();

    this.check();
  };
  
  scratch.prototype.fnEnd = function(e) {
    this.down = false;
  };
  
  scratch.prototype.check = function() {
    
    var data = this.cxt.getImageData(0, 0, this.width, this.height).data,
        i = 0, j = 0, len = data.length - 3,
        config = this.config;

    for(; i < len; i += 4) {
      if (data[i]===0 && data[i+1]===0 && data[i+2]===0 && data[i+3]===0) {
        j++;
      }
    }

    var touchArea = (j*100/(this.width*this.height)).toFixed(2);

    config.move && config.move(touchArea);

     // 刮出的范围大于设定的百分比时清空画布并执行回调参数
    if (touchArea >= config.condition) {
      config.clear && this.clear();
      config.callback && config.callback.call(this);
    }

  };

  // 清空画布并移除canvas
  scratch.prototype.clear = function() {
    doc.body.removeChild(this.canvas);
  };

  

  var entry = function() {
    var stch = new scratch();
    return stch.init.apply(stch, arguments);
  };

  if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(function(require, exports, module) {
      module.exports = entry;
    })
  } else {
    win.scratch = entry;
  }

})(window, document);
