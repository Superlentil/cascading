// MVC structure
var Model = {};
var Collection = {};
var View = {};


var GlobalConstant = {
  ArticleStatus: {   // If this enumeration needs to be modified, please modify the corresponding one in the "Ruby on Rails" code together.
    DRAFT: 0,
    PRIVATE_PUBLISHED: 1,
    PUBLIC_PUBLISHED: 2
  },

  
  UserTier: {   // If this enumeration needs to be modified, please modify the corresponding one in the "Ruby on Rails" code together.
    ADMINISTRATOR: 0,
    FREE_USER: 1
  }
};


var GlobalVariable = {
  Layout: {
    leftNavWidth: 300,
    rightNavWidth: 300,
    
    leftNavOn: false,
    rightNavOn: false
  }
};