View.User.New = Backbone.View.extend({
  initialize: function(options) {   
    this.signInHandler = options.signInHandler;
    
    this.emailValid = false;
    this.repeatPasswordValid = false;
    this.nicknameValid = false;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/user/new"],
  
  
  render: function() {
    this.$el.html(this.template());
  },
  
  
  events: {
    "click #user-new-save": "onSave",
    "click #user-new-cancel": "onCancel",
    
    "blur #user-new-email": "validateEmail",
    "blur #user-new-password": "validatePassword",
    "blur #user-new-repeat-password": "validateRepeatPassword",
    "blur #user-new-nickname": "validateNickname"
  },
  
  
  onSave: function(event) {
    event.preventDefault();
    
    var saveErrorContainer = $("#user-new-save-error");
    if (this.validateEmail() && this.validateRepeatPassword() && this.validateNickname()) {
      var that = this;
      
      saveErrorContainer.hide(500);
      
      var formData = new FormData();
      formData.append("user[email]", $("#user-new-email").val());
      formData.append("user[password]", $("#user-new-password").val());
      formData.append("user[nickname]", $("#user-new-nickname").val());
      var avatarInput = $("#user-new-avatar");
      if (avatarInput.val()) {
        formData.append("user[avatar]", avatarInput.get(0).files[0]);
      }
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
    } else {
      saveErrorContainer.show(500);
    }
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("", {trigger: true});
  },
  
  
  markInvalid: function(input) {
    input.removeClass("input-valid");
    input.addClass("input-invalid");
  },
  
  
  markValid: function(input) {
    input.removeClass("input-invalid");
    input.addClass("input-valid");
  },
  
  
  removeMark: function(input) {
    input.removeClass("input-valid input-invalid");
  },
  
  
  validate: function(input, validator) {
    var value = input.val();
    var errorInfoContainer = input.parent().next();
    if (validator(value)) {
      this.markValid(input);
      errorInfoContainer.hide(500);
      return true;
    } else {
      if (value) {
        this.markInvalid(input);
        errorInfoContainer.show(500);
      } else {
        this.removeMark(input);
        errorInfoContainer.hide(500);
      }
      return false;
    }
  },
  
  
  refreshSaveError: function() {
    if (this.emailValid && this.repeatPasswordValid && this.nicknameValid) {
      $("#user-new-save-error").hide(500);
    }
  },
  
  
  validateEmail: function(event) {
    var input = $("#user-new-email");
    this.emailValid = this.validate(input, GlobalValidator.Email);
    this.refreshSaveError();
    return this.emailValid;
  },
  
  
  validatePassword: function(event) {
    var input = $("#user-new-password");
    var isValid = this.validate(input, GlobalValidator.Password);
    this.validateRepeatPassword();
    this.refreshSaveError();
    return isValid;
  },


  validateRepeatPassword: function(event) {
    var repeatPasswordInput = $("#user-new-repeat-password");
    var errorInfoContainer = repeatPasswordInput.parent().next();
    var isValid = false;
    if (repeatPasswordInput.val()) {
      var passwordInput = $("#user-new-password");
      var password = passwordInput.val();
      if (GlobalValidator.Password(password)) {
        if (repeatPasswordInput.val() === password) {
          this.markValid(repeatPasswordInput);
          errorInfoContainer.hide(500);
          isValid = true;
        } else {
          this.markInvalid(repeatPasswordInput);
          errorInfoContainer.show(500);
          isValid = false;
        }
      } else {
        this.markInvalid(repeatPasswordInput);
        errorInfoContainer.show(500);
        isValid = false;
      }
    } else {
      this.removeMark(repeatPasswordInput);
      errorInfoContainer.hide(500);
      isValid = false;
    }
    
    this.repeatPasswordValid = isValid;
    this.refreshSaveError();
    return isValid;
  },


  validateNickname: function(event) {
    var input = $("#user-new-nickname");
    this.nicknameValid = this.validate(input, GlobalValidator.Nickname);
    this.refreshSaveError();
    return this.nicknameValid;
  }
});
