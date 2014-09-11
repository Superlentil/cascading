// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require underscore
//= require backbone
//= require jquery_cookie
//= require jquery_transit

//= require initializer/_INDEXER_
//= require model/_INDEXER_
//= require collection/_INDEXER_
//= require template/_INDEXER_
//= require view/_INDEXER_
//= require web_main/_INDEXER_


$(function() {
  // measure the width of the scroll bar of the web browser.
  var htmlBody = $("body");
  var widthWithoutScrollBar = htmlBody.width();
  var divToMeasureScrollBarWidth = $("<div style='height: 200%'></div>");
  htmlBody.append(divToMeasureScrollBarWidth);
  GlobalVariable.Browser.SCROLL_BAR_WIDTH_IN_PX = Math.ceil(widthWithoutScrollBar - htmlBody.width());
  divToMeasureScrollBarWidth.detach();
  divToMeasureScrollBarWidth.remove();
  
  // backbone routes
  new Router();
  
  // backbone histories
  if (!Backbone.History.started) {
    Backbone.history.start();
  }
});
