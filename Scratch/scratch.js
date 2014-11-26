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

  // 一些变量
  var canvas = document.createElement('canvas'),
      cxt;

  // 是否支持 canvas 的判断
  try {
    cxt = canvas.getContext('2d');
  } catch(e) {
    console.log('浏览器不支持canvas，程序无法向下进行...请更换IE9+浏览器');
    win.scratch = function(){};
    return;
  }

  var width = 0,
      height = 0,
      x = 0,
      y = 0,
      offLeft = 0,
      offTop = 0,
      lineWidth = 30,
      down = false,
      _this = null;

  canvas.crossOrigin = "*"; // 跨域

  // mouse和touch事件使用判断
  var _e = {
    start  : 'mousedown',
    move   : 'mousemove',
    end    : 'mouseup',
    cancel : 'mouseout'
  }
  // var start = 'mousedown', move = 'mousemove', end = 'mouseup', cancel = 'mouseout';
  doc.createTouch && (_e.start = 'touchstart', _e.move = 'touchmove', _e.end = 'touchend', _e.cancel = 'touchcancel');

  function scratch(config) {
    var defaults = {
      elem      : null,
      condition : 80,
      bg        : '#eee',
      clear     : false,
      down      : null,
      move      : null,
      enable    : true,
      callback  : null
    };

    var elem = config.elem;

    typeof elem === 'string' && (elem = document.getElementById(elem));

    if (!elem) {
      console.error('必须传入需要触发的图片或者包含图片的DOM');
      return;
    } else if (elem.nodeName.toLowerCase() !== 'img') {
      elem = elem.querySelector('img');
    }

    config.elem = elem;


    for (var i in defaults) {
      defaults.hasOwnProperty(i) && !config.hasOwnProperty(i) && (config[i] = defaults[i]);
    }
    
    this.config = config;
    _this = this;
    config.elem.addEventListener('load', this.init, false);
  };

  scratch.prototype.init = function() {
    var elem = _this.config.elem;

    width = elem.width;
    height = elem.height;
    offLeft = elem.offsetLeft;
    offTop = elem.offsetTop;

    _this.config.enable = true;
    _this.createCanvas();

  };
  
  scratch.prototype.createCanvas = function() {

    // 将canvas放置在图片上
    canvas.style.cssText = 'position: absolute; left: ' + offLeft + 'px' + '; top: ' + offTop + 'px';
    canvas.width = width;
    canvas.height = height;

    cxt.fillRect(0, 0, width, height);

    if (this.config.bg.charAt(0) === '#') {

      cxt.fillStyle = _this.config.bg;
      cxt.beginPath();
      cxt.fillRect(0, 0, width, height); // 灰度
      cxt.fill();
      cxt.closePath();

    } else {

      var bg = new Image();
      bg.crossOrigin = '*';
      bg.src = this.config.bg;
      bg.onload = function() {
        cxt.drawImage(this, 0, 0, width, height);
      };
    }

    doc.body.appendChild(canvas);
    canvas.addEventListener(_e.start, this.fnStart, false);
    canvas.addEventListener(_e.move, this.fnMove, false);
    canvas.addEventListener(_e.end, this.fnEnd, false);
    canvas.addEventListener(_e.cancel, this.fnEnd, false);
  };

  scratch.prototype.fnStart = function(e) {
    if (!_this.config.enable) return;

    e.preventDefault();
    e.changedTouches && (e = e.changedTouches[e.changedTouches.length-1]);

    down = true;

    x = e.pageX - canvas.offsetLeft;
    y = e.pageY - canvas.offsetTop;

    cxt.globalCompositeOperation = 'destination-out';
    cxt.strokeStyle = '#fff';
    cxt.lineJoin = 'round';
    cxt.lineWidth = lineWidth;
    cxt.beginPath();
    cxt.arc(x, y, lineWidth/2, 0, Math.PI*2, true);
    cxt.closePath();
    cxt.fill();

    _this.config.down && _this.config.down();
  };
  
  scratch.prototype.fnMove = function( e ) {
    if (!down) return;

    e.changedTouches && (e = e.changedTouches[e.changedTouches.length-1]);

    cxt.moveTo(x, y);
    x = e.pageX - offLeft;
    y = e.pageY - offTop;
    cxt.lineTo(x, y);
    cxt.closePath();
    cxt.stroke();

    _this.check();
  };
  
  scratch.prototype.fnEnd = function( e ) {
    if (!down) return;
    down = false;
    return this;
  };
  
  scratch.prototype.check = function() {
    
    var data = cxt.getImageData(0, 0, width, height).data;
    var i = 0, j = 0, len = data.length - 3;
    var config = this.config;

    for(; i < len; i += 4) {
      if (data[i]===0 && data[i+1]===0 && data[i+2]===0 && data[i+3]===0) {
        j++;
      }
    };

    var touchArea = (j*100/(width*height)).toFixed(2);

    this.config.move && this.config.move(touchArea);

     // 刮出的范围大于设定的百分比时清空画布并执行回调参数
    if (touchArea >= this.config.condition) {
      config.clear && this.clear();
      config.callback && config.callback.call(this);
    };

  };

  // 清空画布并移除canvas
  scratch.prototype.clear = function() {
    this.config.enable = false;
    document.body.removeChild(canvas);
  };

  scratch.prototype.enable = function() {
    this.enable = false;
  };

  win.scratch = function(config) {
    return new scratch(config);
  };

})(window, document);
