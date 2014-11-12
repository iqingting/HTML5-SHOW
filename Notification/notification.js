/**
 * HTML5消息通知
 * Author: rguanghui.stupid@gmail.com, rguanghui.sinaapp.com
 * Update: 2014.08.12
 * 添加对webkit前缀的支持
 * @param configs {Object}
 * configs.elem  {String|Object} 主动触发抑或被动触发，有值得话会对elem元素添加click事件以触发消息通知，没有值则在调用的时候触发消息通知
 * configs.title {String}        消息通知的标题
 * configs.body  {String}        消息通知的内容
 * configs.icon  {String}        消息通知的展示图片
 * configs.tag   {String}        标签，使用一致的tag不会让消息通知一层层的累加而是替换之前tag一样的消息通知
 * congis.show   {Function}      消息通知展示时的函数，默认不做什么响应
 * configs.click {Function}      点击弹出的消息通知后执行的函数，默认聚焦在当前视口
 * configs.close {Function}      关闭消息通知后执行的函数      
 */
(function(win, doc, undefined) {

  'use strict';

  var deskNotification = function(configs) {
    
    this.defaults = {
      title: "html5 notification",
      body: "",
      icon: "http://renguanghui.qiniudn.com/gongqijun-qingting.jpg",
      tag: "1",
      dir: "ltr",
      show: null,
      click: null,
      close: null,
      error: this.error,
      nosupport: null
    };

    this.notification = win.Notification || win.webkitNotification; // webkitNotificition is for chrome 26- and Android 4.4+

  };  
  
  deskNotification.prototype.init = function(configs) {
    
    if (this.notification === undefined) {
      configs.nosupport && configs.nosupport();
      return false;
    }

    configs = configs || {};
    var defaults = this.defaults;

    // 合并参数
    for(var i in defaults) defaults.hasOwnProperty(i) && !configs.hasOwnProperty(i) && (configs[i] = defaults[i]);
    this.configs = configs;
    this.create();
  };

  // 是否支持桌面通知
  deskNotification.prototype.support = function() {
    return this.notification;
  };

  // 实验性质与完全支持
  deskNotification.prototype.isNew = "Notification" in window;

  // 是否已经允许
  deskNotification.prototype.isPermission = function() {
    return this.isNew ? Notification.permission === "granted" : webkitNotification.checkPermission === 0;
  };

  // 请求允许桌面通知
  deskNotification.prototype.requestPermission = function() {
    this.notification.requestPermission();
    return this;
  };

  // 创建桌面通知
  deskNotification.prototype.create = function () {

    var configs = this.configs,
        notification = this.notification;

    if (this.isPermission()) {
      this.createNoty();
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

  var notify = new deskNotification();

  var entry = function() {
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