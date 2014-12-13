View.User.Show = Backbone.View.extend({
  el: "#layout-content",
  
  
  template: JST["template/user/show"],
  
  
  render: function(options) {
    var that = this;
    
    if (options.id) {
      var user = new Model.User({id: options.id});
      user.fetch({
        success: function(fetchedUser, response) {
          that.user = fetchedUser;
          if (response.id) {
            that.$el.html(that.template({user: fetchedUser}));
          } else {
            Backbone.history.loadUrl("forbidden");
          }
        }
      });
    }
       
    return that;
  },
  
  
  events: {
    "click #m-resend-verify-email": "resendVerifyEmail"
  },
  
  
  resendVerifyEmail: function() {
    $.ajax({
      type: "POST",
      url: "/users/" + this.user.id + "/resendSignUpEmailVerification",
      beforeSend: function() {
        $("#m-resend-status").empty();
      },
      success: function() {
        $("#m-resend-status").html(" &#160; &#160; Successfully Resended!");
      }
    });
  }
});
