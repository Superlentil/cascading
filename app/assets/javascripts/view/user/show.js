View.User.Show = Backbone.View.extend({
  el: "div#main_container",
  
  
  template: JST["template/user/show"],
  
  
  render: function(options) {
    var that = this;
    
    if (options.id) {
      var user = new Model.User.User({id: options.id});
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
