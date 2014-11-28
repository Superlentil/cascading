// define a cascade view for article covers
View.Article.CoverCascade = View.Cascade.Base.extend({
  CASCADE_CONTENT_CONTAINER_ID: "article-cover-cascade-content",
  
  COUNT_PER_BATCH: 30,
  EAGER_LOAD_BATCH: 1,
  
  MAX_COLUMN_COUNT: 5,
  ENABLE_COMPACT_MODE: true,
  MAX_AUTO_COMPACT_MODE_WIDTH: 720.0,   // if compact mode is enabled and the cascading area width is smaller than this value, then the initial display mode will be automatically set to compact.
  
  NORMAL_COLUMN_WIDTH: 240.0,   // in the unit "px"
  NORMAL_VERTICAL_GAP: 8.0,   // in the unit "px"
  NORMAL_HORIZONTAL_GAP: 8.0,   // in the unit "px"
  
  COMPACT_COLUMN_WIDTH: 220.0,   // in the unit "px"
  COMPACT_VERTICAL_GAP: 4.0,   // in the unit "px"
  COMPACT_HORIZONTAL_GAP: 4.0,   // in the unit "px"
  
  
  initializeOtherConstants: function() {
    this.ITEM_PICTURE_WIDTH = 200.0;   // in the unit "px"
    this.NORMAL_ITEM_PADDING = 16.0;   // in the unit "px"
    this.COMPACT_ITEM_PADDING = 8.0;   // in the unit "px"
  },
  
  
  el: "#article-cover-cascade",
    
  mainTemplate: JST["template/article/cover_cascade/main"],
  itemTemplate: JST["template/article/cover_cascade/cover"],
  
  
  initializationFromConstructorOptions: function(options) {
    this.fetchFunction = options.fetchFunction;
  },
  
  
  resetCacheHelper: function() {
    this.cache.itemPadding = 0;
    this.cache.itemPictureScale = 1.0;
  },
  
  
  resetDisplayModeParameterHelper: function(maxWidth) {
    var cache = this.cache;
    if (cache.compactMode) {
      cache.itemPadding = this.COMPACT_ITEM_PADDING;
      cache.itemPictureScale = (cache.itemWidth - cache.itemPadding * 2.0) / this.ITEM_PICTURE_WIDTH;
    } else {
      cache.itemPadding = this.NORMAL_ITEM_PADDING;
      cache.itemPictureScale = 1.0;
    }
  },
  
  
  storeFetchedDataIntoCache: function(fetchedData) {
    var items = fetchedData.models;
    
    if (items.length > 0) {
      var cache = this.cache;
      var itemPictureWidth = this.ITEM_PICTURE_WIDTH;
      var itemPictureScale = cache.itemPictureScale;
      var cacheItemData = cache.itemData;
       
      _.each(items, function(item) {          
        var originalItemPictureHeight = item.get("cover_picture_height");
        
        var data = {
          id: item.get("id"),
          title: item.get("title"),
          author: item.get("author"),
          userId: item.get("user_id"),
          category: item.get("category_name"),
          categoryId: item.get("category_id"),
          picUrl: item.get("cover_picture_url"),
          originalPicHeight: originalItemPictureHeight,
          picHeight: Math.floor(originalItemPictureHeight * itemPictureScale),
          picWidth: Math.floor(itemPictureWidth * itemPictureScale),
          width: cache.itemWidth,
          padding: cache.itemPadding
        };
        
        cacheItemData.push(data);
      });
      
      return true;   // stored
    } else {
      return false;   // not stored
    }
  },
  
  
  hasMoreDataToFetch: function(currentFetchedData) {
    return currentFetchedData.models.length === this.COUNT_PER_BATCH;
  },
  
  
  updateItemDataInCacheAfterDisplayModeChange: function(itemIndex) {
    var cache = this.cache;
    var itemPictureScale = cache.itemPictureScale;
    var itemData = cache.itemData[itemIndex];
    itemData.width = cache.itemWidth;
    itemData.padding = cache.itemPadding;
    itemData.picHeight = Math.floor(itemData.originalPicHeight * itemPictureScale);
    itemData.picWidth = Math.floor(this.ITEM_PICTURE_WIDTH * itemPictureScale);
  }
});
