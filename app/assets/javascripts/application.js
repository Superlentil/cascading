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


alert(screen.width + " x " + screen.height + "; " + (screen.width / window.devicePixelRatio) + " x " + (screen.height / window.devicePixelRatio) + "; " + window.devicePixelRatio + " || " + Math.round(window.screen.availWidth / document.documentElement.clientWidth));


$(function() {
  // initialize global variables
  GlobalVariable.Browser.Window = $(window);
  GlobalVariable.Browser.Document = $(document);
  var thisWindow = GlobalVariable.Browser.Window;
  GlobalVariable.Browser.WindowHeightInPx = thisWindow.height();
  
  // measure the width of the scroll bar of the web browser.
  var widthWithoutScrollBar = thisWindow.width();
  var divToMeasureScrollBarWidth = $("<div style='height: 200%'></div>");
  $("body").append(divToMeasureScrollBarWidth);
  GlobalVariable.Browser.ScrollBarWidthInPx = Math.ceil(widthWithoutScrollBar - thisWindow.width());
  divToMeasureScrollBarWidth.detach();
  divToMeasureScrollBarWidth.remove();
  
  // backbone routes
  new Router();
  
  // backbone histories
  if (!Backbone.History.started) {
    Backbone.history.start();
  }
});
