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


  Cascade: {
    ARTICLE_COUNT_PER_BATCH: 30,
    EAGER_LOAD_BATCH_COUNT: 1,
    
    MIN_WIDE_MODE_WIDTH_IN_PX: 720.0,
    COVER_PICTURE_WIDTH_IN_PX: 200.0,
    
    NORMAL_COLUMN_WIDTH_IN_PX: 240.0,
    NORMAL_GAP_SIZE: 8.0,
    NORMAL_COVER_PADDING: 16.0,
    
    COMPACT_GAP_SIZE: 4.0,
    COMPACT_COVER_PADDING: 8.0
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
  
  
  PageCache: {}
};

