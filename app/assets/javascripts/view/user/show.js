View.User.Show = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "resendEmail");
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/user/show"],
  
  
  render: function(options) {
    var that = this;
    
    if (options.id) {
      var user = new Model.User({id: options.id});
      user.fetch({
        success: function(fetchedUser, response) {
          if (response.id) {
            that.user = fetchedUser;
            that.$el.html(that.template({user: fetchedUser}));
            that.resendEmailButton = $("#m-resend-email");
            that.resendEmailButton.one("click", that.resendEmail);
          } else {
            Backbone.history.loadUrl("forbidden");
          }
        }
      });
    }
       
    return that;
  },
  
  
  resendEmail: function() {
    var that = this;

    $.ajax({
      type: "POST",
      url: "/users/" + that.user.id + "/resendSignUpEmailVerification",
      beforeSend: function() {
        $("#m-resend-status").empty();
      },
      success: function() {
        $("#m-resend-status").html(" &#160; &#160; Successfully Resended!");
      },
      complete: function() {
        that.resendEmailButton.one("click", that.resendEmail);
      }
    });
  },
  
  
  remove: function() {
    this.resendEmailButton.off("click");
    
    Backbone.View.prototype.remove.call(this);
  }
});
