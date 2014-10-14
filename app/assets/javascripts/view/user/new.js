View.User.New = Backbone.View.extend({
  initialize: function(options) {   
    this.signInHandler = options.signInHandler;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/user/new"],
  
  
  render: function() {
    this.$el.html(this.template());
  },
  
  
  events: {
    "click #user-new-save": "onSave",
    "click #user-new-cancel": "onCancel",
    
    "blur #user-new-email": "validate",
    "blur #user-new-password": "validate",
    "blur #user-new-repeat-password": "validateRepeatPassword",
    "blur #user-new-nickname": "validate"
  },
  
  
  onSave: function(event) {
    event.preventDefault();
    
    var that = this;
    
    var formData = new FormData();
    formData.append("user[email]", $("#user-new-email").val());
    formData.append("user[password]", $("#user-new-password").val());
    formData.append("user[nickname]", $("#user-new-nickname").val());
    formData.append("user[avatar]", $("#user-new-avatar").get(0).files[0]);
    formData.append("user[tier]", GlobalConstant.UserTier.FREE_USER);
    
    var user = new Model.User.User();
    
    user.save(formData, {
      success: function(savedUser) {
        that.signInHandler(null, null, true);
        Backbone.history.navigate("user/" + savedUser.id, {trigger: true});
      },
      
      error: function(jqXHR, textStatus, errorThrown) {},
      
      complete: function(jqXHR, textStatus ) {}
    });
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("", {trigger: true});
  },
  
  
  validate: function(event, inputToBeValidate) {
    var input = inputToBeValidate || $(event.currentTarget);
    var validator = null;

    var validatorPool = GlobalValidator;
    switch (input.attr("id")) {
      case "user-new-email":
        validator = validatorPool.Email;
        break;
      case "user-new-password":
        validator = validatorPool.Password;
        break;
      case "user-new-nickname":
        validator = validatorPool.Nickname;
        break;
    }

    var value = input.val();
    if (validator(value)) {
      input.removeClass("input-invalid");
      input.addClass("input-valid");
      return true;
    } else {
      if (value) {
        input.removeClass("input-valid");
        input.addClass("input-invalid");
      } else {
        input.removeClass("input-valid input-invalid");
      }
      return false;
    }
  },
  
  
  validateRepeatPassword: function(event) {
    var repeatPasswordInput = $("#user-new-repeat-password");
    if (repeatPasswordInput.val()) {
      var passwordInput = $("#user-new-password");
      if (this.validate(null, passwordInput)) {
        if (repeatPasswordInput.val() === passwordInput.val()) {
          repeatPasswordInput.removeClass("input-invalid");
          repeatPasswordInput.addClass("input-valid");
          return true;
        } else {
          repeatPasswordInput.removeClass("input-valid");
          repeatPasswordInput.addClass("input-invalid");
          return false;
        }
      } else {
        repeatPasswordInput.removeClass("input-valid");
        repeatPasswordInput.addClass("input-invalid");
        return false;
      }
    } else {
      repeatPasswordInput.removeClass("input-valid input-invalid");
      return false;
    }
  }
});
