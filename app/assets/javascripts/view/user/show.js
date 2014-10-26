View.User.Show = Backbone.View.extend({
  el: "#layout-content",
  
  
  template: JST["template/user/show"],
  
  
  render: function(options) {
    var that = this;
    
    if (options.id) {
      var user = new Model.User({id: options.id});
      user.fetch({
        success: function(fetchedUser, response) {
          if (response.id) {
            that.$el.html(that.template({user: fetchedUser}));
          } else {
            Backbone.history.loadUrl("forbidden");
          }
        }
      });
    }
       
    return that;
  }
});
