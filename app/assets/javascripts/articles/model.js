Articles.Model = Backbone.Model.extend({
  defaults: {
    "title": "No Title",
    "author": "None",
    "category": "No Category",
    "content": "No Content"
  },
  
  urlRoot: Articles.RESTfulUrlRoot
});


Articles.Collection = Backbone.Collection.extend({
  model: Articles.Model,
  url: Articles.RESTfulUrlRoot
});
