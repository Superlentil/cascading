// define a cascade view for article covers
View.Article.Cascade.Cover = View.Cascade.Base.extend({
  el: "#article-cascade-container",
    
  mainTemplate: JST["template/artilce/cascade/cover/main"],
  itemTemplate: JST["template/artilce/cascade/cover/item"],
  
  
  initializeOtherConstants: function() {
    this.ITEM_PICTURE_WIDTH = 200.0;   // in the unit "px"
    this.NORMAL_ITEM_PADDING = 16.0,   // in the unit "px"
    this.COMPACT_ITEM_PADDING = 8.0,   // in the unit "px"
  },
  
  
  initializationFromConstructorOptions: function(options) {
    this.fetchFunction = options.fetchFunction;
  }
  
  
  resetCacheHelper: function() {
    cache.itemPadding = 0;
    cache.itemPictureScale = 1.0;
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
  
  
  updateItemDataInCacheAfterDisplayModeChange: function(itemIndex) {
    var cache = this.cache;
    var itemPictureScale = cache.itemPictureScale;
    var itemData = cache.itemData[index];
    itemData.width = cache.itemWidth;
    itemData.padding = cache.itemPadding;
    itemData.picHeight = Math.floor(itemData.originalPicHeight * itemPictureScale);
    itemData.picWidth = Math.floor(this.ITEM_PICTURE_WIDTH * itemPictureScale);
  },
});
