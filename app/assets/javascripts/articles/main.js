//= require ./initializers
//= require ./model
//= require_tree ./templates
//= require_tree ./views
//= require ./routes


$(function() {
  new Article.Router();
});
