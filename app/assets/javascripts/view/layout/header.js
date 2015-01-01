View.Layout.Header = Backbone.View.extend({
  initialize: function(options) {
    var that = this;
    
    _.bindAll(that, "updateSubTitle");
    
    that.subTitle = "";
    GlobalVariable.Layout.Header.UpdateSubTitle = that.updateSubTitle;
    
    that.popupCache = {};
  },
  
  
  tagName: "nav",
  id: "layout-header",
  className: "container",
  attributes: {"role": "navigation"},
  
  
  template: JST["template/layout/header"],
  
  
  render: function() {
    this.$el.html(this.template({subTitle: this.subTitle}));
    return this;
  },
  
  
  updateSubTitle: function(headerSubTitle) {
    var subTitle = "";
    if (headerSubTitle) {
      subTitle = headerSubTitle;
    }
    if (subTitle !== this.subTitle) {
      this.subTitle = subTitle;
      this.$el.html(this.template({subTitle: subTitle}));
    }
  },
  
  
  events: {
    "click #layout-header-logo": "clickLogo",
    
    "click #layout-header-form-submit": "onSignIn",
    "keyup #layout-header-form-password": "enterToSignIn",
    "keyup #layout-header-form-email": "enterToSignIn",
    
    "click .layout-header-signinup": "popupSignInForm",
    "click .layout-header-browsing-history": "popupBrowsingHistory"
  },
  
  
  clickLogo: function(event) {
    event.preventDefault();
    Backbone.history.navigate("#", {trigger: true});
  },
  
  
  onSignIn: function(event) {
    event.preventDefault();
    
    var email = $("#layout-header-form-email").val();
    var password = $("#layout-header-form-password").val();    
    GlobalVariable.Layout.SignInHandler(email, password);
  },
  
  
  enterToSignIn: function(event) {
    if (event.keyCode == 13) {
      this.onSignIn(event);
    }
  },
  
  
  popupSignInForm: function(event) {
    event.preventDefault();
    
    $(event.currentTarget).transition({scale: 0.7}, 200, "ease").transition({scale: 1}, 200, "ease");
    
    var viewPopup = GlobalVariable.Layout.ViewPopup;
    var viewUserSignIn = new View.User.SignIn({popupCache: this.popupCache});
    viewPopup.renderContent(viewUserSignIn);
    viewPopup.openPopup();
  },
  
  
  popupBrowsingHistory: function(event) {
    event.preventDefault();
    
    $(event.currentTarget).transition({scale: 0.7}, 200, "ease").transition({scale: 1}, 200, "ease");
    
    var viewPopup = GlobalVariable.Layout.ViewPopup;
    var viewBrowsingHistory = new View.Article.BrowsingHistory();
    viewPopup.renderContent(viewBrowsingHistory);
    viewPopup.openPopup();
  }
});
