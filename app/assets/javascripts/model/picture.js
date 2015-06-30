// define the model "Picture"
Model.Picture = Backbone.Model.extend({
  urlRoot: GlobalConstant.DOMAIN + "/pictures",
  
  
  save: ModelHelper.multipartFormSubmit
});
