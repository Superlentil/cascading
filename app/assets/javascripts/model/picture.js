// define the model "Picture"
Model.Picture = Backbone.Model.extend({
  urlRoot: GlobalUtilities.PathToUrl("/pictures"),
  
  
  save: ModelHelper.multipartFormSubmit
});
