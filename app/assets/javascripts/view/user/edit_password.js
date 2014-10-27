View.User.EditPassword = View.User.ModifyInputValidator.extend({
  el: "#layout-content",
  
  
  template: JST["template/user/edit_password"],
  
  
  render: function(options) {
    var userId = parseInt(options.userId);
    if (userId === parseInt($.cookie("user_id"))) {
      this.userId = userId;
      this.resetIndicators(true);
  
      this.$el.html(this.template({nickname: $.cookie("user_nickname")}));
  
      this.oldPassword = 
      this.verifyPassword = $("#user-edit-verify-password");
      this.verifyPasswordError = $("#user-edit-verify-password-error");
      this.password = $("#user-edit-password");
      this.passwordError = $("#user-edit-password-error");
      this.repeatPassword = $("#user-edit-repeat-password");
      this.repeatPasswordError = $("#user-edit-repeat-password-error");
      this.saveError = $("#user-edit-save-error");
    } else {
      Backbone.history.loadUrl("forbidden");
    }
  },
  
  
  events: {
    "click #user-edit-save": "onSave",
    "click #user-edit-cancel": "onCancel",
    
    "blur #user-edit-password": "validatePassword",
    "blur #user-edit-repeat-password": "validateRepeatPassword",
    "change #user-edit-verify-password": "onVerifyPasswordChange"
  },
  
  
  onSave: function(event) {
    event.preventDefault();
    
    var password = this.password.val();
    if (GlobalValidator.Password(password) && password === this.repeatPassword.val()) {
      var that = this;
      
      that.saveError.hide(500);
  
      var formData = new FormData();
      formData.append("user[id]", that.userId);
      formData.append("user[password]", password);
      formData.append("user[verify_password]", that.verifyPassword.val());
      
      var user = new Model.User();
      
      user.save(formData, {    
        success: function(response) {
          if (response.fail) {
            that.saveError.show(500);
            if (response.fail === "password is not correct") {
              that.verifyPasswordError.show(500);
              that.verifyPassword.addClass("input-invalid");
            }
          } else {
            that.signInHandler(null, null, true);
            Backbone.history.navigate("user/" + response.id, {trigger: true});
          }
        },
        
        error: function() {
          that.saveError.show(500);
          that.validateEmail(null, true);
        }
      }, "PUT", "/" + user.urlRoot + "/" + that.userId);
    } else {
      this.saveError.show(500);
    }
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("user/" + this.userId, {trigger: true});
  },
  
  
  onVerifyPasswordChange: function(event) {
    this.verifyPasswordError.hide(500);
    this.verifyPassword.removeClass("input-invalid");
    this.refreshSaveError();
  }
});
