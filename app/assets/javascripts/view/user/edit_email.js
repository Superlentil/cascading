View.User.EditEmail = View.User.ModifyInputValidator.extend({
  el: "#layout-content",
  
  
  template: JST["template/user/edit_email"],
  
  
  render: function(options) {
    var userId = parseInt(options.userId);
    if (userId === parseInt($.cookie("user_id"))) {
      var that = this;
      
      var user = new Model.User({id: userId});
      user.fetch({
        success: function(fetchedUser) {
          that.userId = fetchedUser.get("id");
          that.resetIndicators(true);
          var oldEmail = fetchedUser.get("email");

          that.$el.html(that.template({
            nickname: fetchedUser.get("nickname"),
            email: oldEmail
          }));
      
          that.email = $("#user-edit-email");
          that.emailValue = "";
          that.oldEmail = oldEmail;
          that.emailError = $("#user-edit-email-error");
          that.verifyPassword = $("#user-edit-verify-password");
          that.verifyPasswordError = $("#user-edit-verify-password-error");
          that.saveError = $("#user-edit-save-error");
          
          return that;
        }
      });
    } else {
      Backbone.history.loadUrl("forbidden");
      return this;
    }
  },
  
  
  events: {
    "click #user-edit-save": "onSave",
    "click #user-edit-cancel": "onCancel",
    
    "blur #user-edit-email": "validateEmail",
    "blur #user-edit-verify-password": "validateVerifyPassword"
  },
  
  
  onSave: function(event) {
    event.preventDefault();
    
    var validator = GlobalValidator;
    var verifyPassword = this.verifyPassword.val();
    var email = this.email.val();
    
    if (validator.Password(verifyPassword) && validator.Email(email)) {
      var that = this;
      
      that.saveError.hide(500);
  
      var formData = new FormData();
      var userId = that.userId;
      formData.append("user[id]", userId);
      formData.append("user[unverified_email]", email);
      formData.append("user[verify_password]", verifyPassword);
      
      var user = new Model.User();
      
      user.save(formData, {    
        success: function(response) {
          if (response.fail) {
            that.saveError.show(500);
            if (response.fail === "password is not correct") {
              that.markInvalid(that.verifyPassword);
              that.verifyPasswordError.show(500);
            }
          } else {
            $("#user-edit-save-callback-info").html("Sent an Email! Check it!");
          }
        },
        
        error: function() {
          that.saveError.show(500);
          that.validateEmail(null, true);
        }
      }, "PUT", "/" + user.urlRoot + "/" + userId);
    } else {
      this.saveError.show(500);
    }
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("#/user/" + this.userId, {trigger: true});
  }
});
