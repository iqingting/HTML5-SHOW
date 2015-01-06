/**
 * HTML5消息通知
 * Author: rguanghui.stupid@gmail.com, https://github.com/rguanghui/
 * Update: 2014.11.12
 * 添加对webkit前缀的支持
 * @param config {Object}
 * config.title {String}        消息通知的标题
 * config.body  {String}        消息通知的内容
 * config.icon  {String}        消息通知的展示图片
 * config.tag   {String}        标签，使用一致的tag不会让消息通知一层层的累加而是替换之前tag一样的消息通知
 * congis.show   {Function}      消息通知展示时的函数，默认不做什么响应
 * config.click {Function}      点击弹出的消息通知后执行的函数
 * config.close {Function}      关闭消息通知后执行的函数
 * config.timeout {Number}      是否自动关闭，以及自动关闭的时间间隔(s)        
 */

(function(win, doc, undefined) {

  'use strict';

  var deskNotification = function() {
    
    this.defaults = {
      title: 'html5 notification',
      body: '',
      icon: 'http://renguanghui.qiniudn.com/gongqijun-qingting.jpg',
      dir: 'ltr',
      click: null,
      error: this.error,
      nosupport: null
    };

    this.notification = win.Notification || win.webkitNotification; // webkitNotificition is for chrome 26- and Android 4.4+

  };
  
  deskNotification.prototype.init = function(config) {

    config = config || {};

    if (!this.notification) {
      config.nosupport && config.nosupport();
      return this;
    }

    var defaults = this.defaults;

    // 合并参数
    for(var i in defaults) defaults.hasOwnProperty(i) && !config.hasOwnProperty(i) && (config[i] = defaults[i]);

    this.config = config;
    this.create();

    return this;
  };

  // 是否支持桌面通知
  deskNotification.prototype.isSupport = function() {
    return this.notification !== undefined;
  };

  // 实验性质与完全支持
  deskNotification.prototype.isNew = 'Notification' in window;

  // 是否已经允许
  deskNotification.prototype.isPermission = function() {
    return this.isNew ? Notification.permission === 'granted' : webkitNotification.checkPermission === 0;
  };

  // 请求允许桌面通知
  deskNotification.prototype.requestPermission = function() {
    this.notification.requestPermission();
    return this;
  };

  // 创建桌面通知
  deskNotification.prototype.create = function() {

    var config = this.config;

    if (this.isPermission()) {
      this.createNoty();

      var notification = this.notification; // 这里要重新获取一下生成的notification
      notification.onshow = config.show;
      notification.onclick = config.click;
      notification.onclose = config.close;
      notification.onerror = config.error;
    } else {
      this.requestPermission();
    }
  };
  
  deskNotification.prototype.createNoty = function() {

    var config = this.config;
    
    if (this.isNew) {
      this.notification = new Notification(this.config.title, {
        direction : config.dir,
        body      : config.body,
        icon      : config.icon,
        tag       : config.tag
      })
    } else {
      this.notification = webkitNotification.createNotification(
        config.icon,
        config.title,
        config.body
      )
    }
    
    if (config.timeout) {
      setTimeout(this.close.bind(this), config.timeout * 1000);
    }
  };

  deskNotification.prototype.close = function() {
    this.notification.close();
  }

  // error
  deskNotification.prototype.error = function(e) {
    console.log(e);
  };



  var entry = function() {
    var notify = new deskNotification();
    return notify.init.apply(notify, arguments);
  };
  
  if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(function(require, exports, module) {
      module.exports = entry;
    });
  } else {
    win.notify = entry;  
  }

})(window, document);