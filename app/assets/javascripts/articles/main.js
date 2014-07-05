//= require ./initializers
//= require ./model
//= require_tree ./templates
//= require_tree ./views
//= require ./router


$(function() {
  new Articles.Router();
});
