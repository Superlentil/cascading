// define the model "Article"
Articles.Models.Article = Backbone.Model.extend({
  defaults: {
    "title": "",
    "author": "",
    "category": "",
    "content": "{}"
  },
  
  urlRoot: "articles"
});
