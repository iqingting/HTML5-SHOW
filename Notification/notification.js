/**
 * HTML5消息通知
 * Author: rguanghui.stupid@gmail.com, https://github.com/rguanghui/
 * Update: 2014.11.12
 * 添加对webkit前缀的支持
 * @param configs {Object}
 * configs.title {String}        消息通知的标题
 * configs.body  {String}        消息通知的内容
 * configs.icon  {String}        消息通知的展示图片
 * configs.tag   {String}        标签，使用一致的tag不会让消息通知一层层的累加而是替换之前tag一样的消息通知
 * congis.show   {Function}      消息通知展示时的函数，默认不做什么响应
 * configs.click {Function}      点击弹出的消息通知后执行的函数
 * configs.close {Function}      关闭消息通知后执行的函数
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
  
  deskNotification.prototype.init = function(configs) {

    configs = configs || {};

    if (this.notification === undefined) {
      configs.nosupport && configs.nosupport();
      return this;
    }

    var defaults = this.defaults;

    // 合并参数
    for(var i in defaults) defaults.hasOwnProperty(i) && !configs.hasOwnProperty(i) && (configs[i] = defaults[i]);
    this.configs = configs;
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

    var configs = this.configs;

    if (this.isPermission()) {
      this.createNoty();
      var notification = this.notification; // 这里要重新获取一下生成的notification
      notification.onshow = configs.show;
      notification.onclick = configs.click;
      notification.onclose = configs.close;
      notification.onerror = configs.error;
    } else {
      this.requestPermission();
    }
  };
  
  deskNotification.prototype.createNoty = function() {

    var configs = this.configs;
    
    if (this.isNew) {
      this.notification = new Notification(this.configs.title, {
        direction : configs.dir,
        body      : configs.body,
        icon      : configs.icon,
        tag       : configs.tag
      })
    } else {
      this.notification = webkitNotification.createNotification(
        configs.icon,
        configs.title,
        configs.body
      )
    }
  };

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