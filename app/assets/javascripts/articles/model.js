Article.Model = Backbone.Model.extend({
  defaults: {
    "title": "No Title",
    "author": "None",
    "category": "No Category",
    "content": "No Content"
  },
  
  urlRoot: Article.RESTfulUrlRoot
});


Article.Collection = Backbone.Collection.extend({
  model: Article.Model,
  url: Article.RESTfulUrlRoot
});
