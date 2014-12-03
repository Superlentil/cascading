// define a cascade view for article covers
View.Article.ShowCascade = View.Cascade.Base.extend({
  CASCADE_CONTENT_CONTAINER_ID: "article-cover-cascade-content",
  
  COUNT_PER_BATCH: 1,
  BATCH_LOAD_WHEN_SCROLL_TO_BOTTOM: 0,
  
  MAX_COLUMN_COUNT: 1,
  ENABLE_COMPACT_MODE: false,
  
  NORMAL_COLUMN_WIDTH: 200.0,   // in the unit "px"
  NORMAL_VERTICAL_GAP: 0,   // in the unit "px"
  NORMAL_HORIZONTAL_GAP: 8.0,   // in the unit "px"
 
  
  initializeOtherConstants: function() {
    this.ITEM_PICTURE_WIDTH = 200.0;   // in the unit "px"
  },
  
  
  el: "#article-show-recommend",
    
  mainTemplate: JST["template/article/show_cascade/main"],
  itemTemplate: JST["template/article/show_cascade/cover"],
  
  
  initializeHelper: function(options) {
    this.articleShowContainer = options.articleShowContainer;
  },
  
  
  fetchFunction: function(batchToLoad, articlesPerBatch, fetchOptions, callbacks) {
    var articles = new Collection.Article.All({
      batch: batchToLoad,
      articlesPerBatch: articlesPerBatch,
      pageLoadTime: fetchOptions.pageLoadTime
    });
    articles.fetch(callbacks);
  },
  
  
  generateFetchOptions: function() {
    return {pageLoadTime: this.cache.pageLoadTimeSinceEpoch};
  },
  
  
  resetCacheHelper: function() {
    this.cache.pageLoadTimeSinceEpoch = $.now();   // in the unit "millisecond"
  },
  
  
  storeFetchedDataIntoCache: function(fetchedData) {
    var items = fetchedData.models;
    
    if (items.length > 0) {
      var cache = this.cache;
      var itemPictureWidth = this.ITEM_PICTURE_WIDTH;
      var cacheItemData = cache.itemData;
       
      _.each(items, function(item) {          
        var originalItemPictureHeight = item.get("cover_picture_height");
        
        var data = {
          id: item.get("id"),
          title: item.get("title"),
          picUrl: item.get("cover_picture_url"),
          picHeight: item.get("cover_picture_height"),
          picWidth: itemPictureWidth,
          width: cache.itemWidth
        };
        
        cacheItemData.push(data);
      });
      
      return true;   // stored
    } else {
      return false;   // not stored
    }
  },
  
  
  isEnoughForScroll: function() {
    return this.cache.cascadeHeight > this.articleShowContainer.height() + 100.0;
  },
});
