// define the model "Article"
Articles.Models.Article = Backbone.Model.extend({
  defaults: {
    "title": "No Title",
    "author": "None",
    "category": "No Category",
    "content": "No Content"
  },
  
  urlRoot: "articles"
});
