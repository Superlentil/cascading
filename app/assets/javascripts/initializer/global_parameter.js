// MVC structure
var Model = {};
var Collection = {};
var View = {};


var GlobalConstant = { 
  ArticleStatus: {   // If this enumeration needs to be modified, please modify the corresponding one in the "Ruby on Rails" code together.
    INITIAL_TEMPORARILY_CREATED: 0,
    DRAFT: 1,
    PRIVATE_PUBLISHED: 2,
    PUBLIC_PUBLISHED: 3
  },


  Cascade: {
    ARTICLE_COUNT_PER_BATCH: 30,
    EAGER_LOAD_BATCH_COUNT: 1,
    
    MIN_WIDE_MODE_WIDTH_IN_PX: 720.0
  },
    
  
  SideNav: {
    BORDER_SHADOW_WIDTH_IN_PX: 10
  },
  
  
  UserTier: {   // If this enumeration needs to be modified, please modify the corresponding one in the "Ruby on Rails" code together.
    ADMINISTRATOR: 0,
    FREE_USER: 1
  }
};


var GlobalVariable = {
  Browser: {
    Window: null,
    Document: null,
    WindowHeightInPx: 0,
    ScrollBarWidthInPx: 20
  },
  
  
  PageCache: {},
  
  
  UserCache: {},
  
  
  Article: {
    AllCategories: null   // should be a Backbone Collection object
  }
};

