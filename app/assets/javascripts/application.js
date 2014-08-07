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
//= require bootstrap
//= require underscore
//= require backbone
//= require jquery_cookie

//= require global_constants
//= require initializers/_INDEXER_
//= require models/_INDEXER_
//= require collections/_INDEXER_
//= require templates/_INDEXER_
//= require views/_INDEXER_
//= require router


$(function() {
  new Router();
  
  if (!Backbone.History.started) {
    Backbone.history.start();
  }
  
  $(document).off('page:load').on('page:load', function() {
    Backbone.history.loadUrl();
  });
});
