View.User.EditEmail = View.User.ModifyInputValidator.extend({
  initializeHelper: function(options) {
    _.bindAll(this, "onSave");
    _.bindAll(this, "resendEmail");
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/user/edit_email"],
  
  
  render: function(options) {
    var userId = parseInt(options.userId);
    if (userId === parseInt(GlobalVariable.Cookie.UserId)) {
      var that = this;
      
      var user = new Model.User({id: userId});
      user.fetch({
        success: function(fetchedUser) {
          that.userId = userId;
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
          
          that.saveButton = $("#user-edit-save");
          that.saveButton.one("click", that.onSave);
          
          that.resendEmailButton = $("#m-resend-email");
          that.resendEmailButton.one("click", that.resendEmail);
          
          return that;
        }
      });
    } else {
      Backbone.history.loadUrl("forbidden");
      return this;
    }
  },
  
  
  events: {
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
            $("#user-edit-email-form").hide();
            $("#user-edit-email-callback").removeClass("hide");
          }
        },
        
        error: function() {
          that.saveError.show(500);
          that.validateEmail(null, true);
        }
      }, "PUT", "/" + user.urlRoot + "/" + userId);
    } else {
      this.saveError.show(500);
      this.saveButton.one("click", this.onSave);
    }
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("#/user/" + this.userId, {trigger: true});
  },
  
  
  resendEmail: function() {
    var that = this;

    $.ajax({
      type: "POST",
      url: "/users/" + that.userId + "/resendEditEmailVerification",
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
  
  
  removeHelper: function() {
    this.saveButton.off("click");
    this.resendEmailButton.off("click");
  }
});
