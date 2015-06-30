Model.User = Backbone.Model.extend({
  urlRoot: GlobalConstant.DOMAIN + "/users",
  
  
  save: ModelHelper.multipartFormSubmit
});
