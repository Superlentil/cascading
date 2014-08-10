// define the model "Picture"
Model.Article.Picture = Backbone.Model.extend({
  urlRoot: "pictures",
  
  
  save: ModelHelper.multipartFormSubmit
});
