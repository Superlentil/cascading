// define the model "Article"
Model.Article.Article = Backbone.Model.extend({
  defaults: {
    "title": "",
    "author": "",
    "category": "",
    "content": "{}",
    "published": false
  },
  
  urlRoot: "articles"
});
