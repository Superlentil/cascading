View.User.EditPassword = View.User.ModifyInputValidator.extend({
  el: "#layout-content",
  
  
  template: JST["template/user/edit_password"],
  
  
  render: function(options) {
    var userId = parseInt(options.userId);
    if (userId === parseInt($.cookie("user_id"))) {
      var that = this;
      var user = new Model.User({id: userId});
      user.fetch({
        success: function(fetchedUser) {
          that.userId = userId;
          that.resetIndicators(true);
      
          that.$el.html(that.template({nickname: fetchedUser.get("nickname")}));
      
          that.oldPassword = 
          that.verifyPassword = $("#user-edit-verify-password");
          that.verifyPasswordError = $("#user-edit-verify-password-error");
          that.password = $("#user-edit-password");
          that.passwordError = $("#user-edit-password-error");
          that.repeatPassword = $("#user-edit-repeat-password");
          that.repeatPasswordError = $("#user-edit-repeat-password-error");
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
    
    "blur #user-edit-verify-password": "validateVerifyPassword",
    "blur #user-edit-password": "validatePassword",
    "blur #user-edit-repeat-password": "validateRepeatPassword"
  },
  
  
  onSave: function(event) {
    event.preventDefault();
    
    var validator = GlobalValidator;
    var verifyPassword = this.verifyPassword.val();
    var password = this.password.val();
    
    if (validator.Password(verifyPassword) && validator.Password(password) && password === this.repeatPassword.val()) {
      var that = this;
      
      that.saveError.hide(500);
  
      var formData = new FormData();
      formData.append("user[id]", that.userId);
      formData.append("user[password]", password);
      formData.append("user[verify_password]", verifyPassword);
      
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
            Backbone.history.navigate("#/user/" + response.id, {trigger: true});
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
    Backbone.history.navigate("#/user/" + this.userId, {trigger: true});
  }
});
