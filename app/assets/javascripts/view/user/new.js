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
    
    this.email = $("#user-new-email");
    this.emailError = $("#user-new-email-error");
    this.password = $("#user-new-password");
    this.passwordError = $("#user-new-password-error");
    this.repeatPassword = $("#user-new-repeat-password");
    this.repeatPasswordError = $("#user-new-repeat-password-error");
    this.nickname = $("#user-new-nickname");
    this.nicknameError = $("#user-new-nickname-error");
    
    this.saveError = $("#user-new-save-error");
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
    
    var validator = GlobalValidator;
    var email = this.email.val();
    var password = this.password.val();
    var nickname = this.nickname.val();
    if (validator.Email(email) && validator.Password(password) && password === this.repeatPassword.val() && validator.Nickname(nickname)) {
      var that = this;
      
      this.saveError.hide(500);
      
      var formData = new FormData();
      formData.append("user[email]", email);
      formData.append("user[password]", password);
      formData.append("user[nickname]", nickname);
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
        
        error: function(unsavedUser, response) {
          that.saveError.show(500);
          that.validateEmail();
        }
      });
    } else {
      this.saveError.show(500);
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
  
  
  validate: function(input, errorInfoContainer, validator) {
    var value = input.val();
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
      this.saveError.hide(500);
    }
  },
  
  
  validateEmail: function(event) {
    var input = this.email;
    var inputError = this.emailError;
    var email = input.val();
    var isValid = false;
    
    if (email) {
      if (GlobalValidator.Email(email)) {
        var that = this;

        this.removeMark(input);
        inputError.html("<small style='color: blue'>Check the availablity for this email ...</small>");
        inputError.show(500);
        
        $.ajax({
          url: "/users/emailAvailable",
          dataType: "json",
          data: {email: input.val()},
          success: function(returnedData) {
            if (returnedData.available) {
              that.markValid(input);
              inputError.hide(500);
              that.emailValid = true;
              that.refreshSaveError();
            } else {
              that.markInvalid(input);
              inputError.html("<small>This email has been registered.</small>");
              this.emailValid = false;
            }
          }
        });
      } else {
        this.markInvalid(input);
        inputError.html("<small>The format of the input email is not correct.</small>");
        inputError.show(500);
        this.emailValid = false;
      }
    } else {
      this.removeMark(input);
      inputError.hide(500);
      this.emailValid = false;
    }
  },
  
  
  validatePassword: function(event) {
    this.validate(this.password, this.passwordError, GlobalValidator.Password);
    this.validateRepeatPassword();
    this.refreshSaveError();
  },


  validateRepeatPassword: function(event) {
    var input = this.repeatPassword;
    var errorInfoContainer = this.repeatPasswordError;
    if (input.val()) {
      var isValid = false;
      var password = this.password.val();
      if (GlobalValidator.Password(password) && input.val() === password) {
        isValid = true;
      }
      
      if (isValid) {
        this.markValid(input);
        errorInfoContainer.hide(500);
      } else {
        this.markInvalid(input);
        errorInfoContainer.show(500);
      }
    } else {
      this.removeMark(input);
      errorInfoContainer.hide(500);
    }
    
    this.repeatPasswordValid = isValid;
    this.refreshSaveError();
  },


  validateNickname: function(event) {
    this.nicknameValid = this.validate(this.nickname, this.nicknameError, GlobalValidator.Nickname);
    this.refreshSaveError();
  }
});
