// define the view "Index.Main"
View.Article.Index.Main = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "handleScroll");
    
    GlobalVariable.Browser.Window.on("scroll", this.handleScroll);
    
    this.articlesPerBatch = 50;
    
    this.batch = 0;
    this.readyToLoad = true;
    this.moreToLoad = true;
    
    this.readyForWidthChange = false;
    
    // Global Page Cache
    this.pageCacheKey = window.location.href;
    // GlobalVariable.PageCache[this.pageCacheKey];
    // if (GlobalVariable.PageCache[this.pageCacheKey]) {
      // this.cache = GlobalVariable.PageCache[this.pageCacheKey];
      // this.batch = this.cache.batch;
      // this.scrollPercentage = this.cache.scrollPercentage;
      // this.onWidthChange();
    // } else {
      this.cache = {
        batchPosition: [],
        articleParams: []
      };
      GlobalVariable.PageCache[this.pageCacheKey] = this.cache;
    // }
  },
  
  
  el: "#layout-content",
  
  
  mainTemplate: JST["template/article/index/main"],
  coverTemplate: JST["template/article/index/cover"],


  resetCascade: function(maxWidth) {
    if (maxWidth) {
      this.maxWidth = maxWidth;
    } else {
      this.maxWidth = this.$el.width() - GlobalVariable.Browser.ScrollBarWidthInPx;
    }
    
    this.columnWidth = GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX;
    if (this.maxWidth < GlobalConstant.Cascade.MIN_WIDE_MODE_WIDTH_IN_PX) {
      this.columnCount = 2;
      this.gap = 4.0;
      this.coverPadding = 8.0;
      this.columnWidth = this.maxWidth / 2.0;
      this.coverWidth = this.columnWidth - this.gap;
      this.actualWidth = this.maxWidth - this.gap;
      this.coverPictureScale = (this.coverWidth - this.coverPadding * 2) / GlobalConstant.Cascade.COVER_PICTURE_WIDTH_IN_PX;
    } else {
      this.columnCount = Math.floor(this.maxWidth / this.columnWidth);
      if (this.columnCount > 5) {
        this.columnCount = 5;
      }
      this.gap = 8.0;
      this.coverPadding = 16.0;
      this.coverWidth = this.columnWidth - this.gap;
      this.actualWidth = this.columnCount * this.columnWidth - this.gap;
      this.coverPictureScale = 1.0;
    }
    
    this.hPosition = [];
    this.vPosition = [];
    for (var index = 0; index < this.columnCount; ++index) {
      this.hPosition.push(0.0);
      this.vPosition.push(this.columnWidth * index);
    }
    this.minHorizontalIndex = 0.0;
    this.currentCascadeHeight = 0.0;
  },
  
  
  render: function() {
    var that = this;
    
    that.$el.html(that.mainTemplate());

    that.resetCascade();

    $("#article-index-cascade-container").css("width", that.actualWidth + "px");
    
    that.loadArticles();
    
    that.readyForWidthChange = true;
       
    return that;
  },
  
   
  getMinHorizontalIndex: function() {
    this.minHorizontalIndex = 0.0;
    var min = this.hPosition[0];
    for (var index = 1; index < this.columnCount; ++index) {
      if (min > this.hPosition[index]) {
        min = this.hPosition[index];
        this.minHorizontalIndex = index;
      }
    }
  },
  
  
  getCurrentCascadeHeight: function() {
    var max = this.hPosition[0];
    for (var index = 1; index < this.columnCount; ++index) {
      if (max < this.hPosition[index]) {
        max = this.hPosition[index];
      }
    }
    return max;
  },
  
  
  insertNewCoordinate: function(hCoordinate, vCoordinate) {
    this.hPosition[this.minHorizontalIndex] = hCoordinate;
    this.vPosition[this.minHorizontalIndex] = vCoordinate;
  },
  
  
  loadArticles: function() {
    if (this.moreToLoad) {
      var that = this;
      
      var cascadeContainer = $("#article-index-cascade-container");
      var articles = new Collection.Article.Article();
      
      articles.fetchBatch(that.batch, that.articlesPerBatch, {
        success: function(fetchedResults) {
          fetchedArticles = fetchedResults.models;
          
          var heightOffset = that.currentCascadeHeight;
          var batchContainer = $("<div style='position: absolute; left: 0; top: " + heightOffset + "px;'></div>");
          cascadeContainer.append(batchContainer);
          that.cache.batchPosition.push(heightOffset);
          
          _.each(fetchedArticles, function(article) {          
            that.getMinHorizontalIndex();
            var hCoordinate = that.hPosition[that.minHorizontalIndex];
            var vCoordinate = that.vPosition[that.minHorizontalIndex];
            
            var originalCoverPictureHeight = article.get("cover_picture_height");
            
            var params = {
              articleId: article.get("id"),
              articleTitle: article.get("title"),
              articleAuthor: article.get("author"),
              articleCategory: article.get("category_name"),
              coverPictureUrl: article.get("cover_picture_url"),
              originalCoverPictureHeight: originalCoverPictureHeight,
              coverPictureHeight: Math.floor(originalCoverPictureHeight * that.coverPictureScale),
              hCoordinate: hCoordinate - heightOffset,
              vCoordinate: vCoordinate,
              width: that.coverWidth,
              padding: that.coverPadding
            };
            
            var articleCover = $(that.coverTemplate(params));
            batchContainer.append(articleCover);
            that.cache.articleParams.push(params);
            
            var newHorizontalCoordinate = that.gap + hCoordinate + articleCover.outerHeight();
            that.insertNewCoordinate(newHorizontalCoordinate, vCoordinate);
          });
          
          that.currentCascadeHeight = that.getCurrentCascadeHeight();
                    
          ++that.batch;
          that.readyToLoad = true;
          if (fetchedArticles.length < that.articlesPerBatch) {
            that.moreToLoad = false;
          }
        }
      });
    }
  },
   
  
  onWidthChange: function() {
    if (this.readyForWidthChange) {   
      var maxWidth = this.$el.width();
           
      var newColumnCount = Math.floor(maxWidth / GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX);
      
      if (newColumnCount != this.columnCount || this.maxWidth < GlobalConstant.Cascade.MIN_WIDE_MODE_WIDTH_IN_PX) {
        var that = this;
           
        var oldCascadeContainer = $("#article-index-cascade-container");
        oldCascadeContainer.detach();
        
        that.resetCascade(maxWidth);
        
        var newCascadeContainer = $("<div id='article-index-cascade-container' style='width: " + this.actualWidth + "px;'></div>");
        that.$el.prepend(newCascadeContainer);
        
        var articleParamsLength = that.cache.articleParams.length;
        for (var thisBatchStart = 0; thisBatchStart < articleParamsLength; thisBatchStart += that.articlesPerBatch) {
          var nextBatchStart = thisBatchStart + that.articlesPerBatch;
          if (nextBatchStart > articleParamsLength) {
            nextBatchStart = articleParamsLength;
          }
          
          var heightOffset = that.currentCascadeHeight;
          var newBatchContainer = $("<div style='position: absolute; left: 0; top: " + heightOffset + "px;'></div>");
          newCascadeContainer.append(newBatchContainer);
          that.cache.batchPosition[index] = heightOffset;
          
          for (var index = thisBatchStart; index < nextBatchStart; ++index) {
            that.getMinHorizontalIndex();
            var hCoordinate = that.hPosition[that.minHorizontalIndex];
            var vCoordinate = that.vPosition[that.minHorizontalIndex];
            
            var params = that.cache.articleParams[index];
            params.hCoordinate = hCoordinate - heightOffset;
            params.vCoordinate = vCoordinate;
            params.coverPictureHeight = Math.floor(parseFloat(params.originalCoverPictureHeight * that.coverPictureScale));
            params.width = that.coverWidth;
            params.padding = that.coverPadding;
            
            var articleCover = $(that.coverTemplate(params));
            newBatchContainer.append(articleCover);
            
            var newHorizontalCoordinate = that.gap + hCoordinate + articleCover.outerHeight();
            that.insertNewCoordinate(newHorizontalCoordinate, vCoordinate);
          }
                  
          that.currentCascadeHeight = that.getCurrentCascadeHeight();
        };
        
        GlobalVariable.Browser.Window.scrollTop($(document).height() * that.scrollPercentage);
        oldCascadeContainer.remove();
      }
    }
  },
  
  
  handleScroll: function(event) {
    var thisWindow = GlobalVariable.Browser.Window;
    var scrollTopPosition = thisWindow.scrollTop();
    var documentHeight = $(document).height();
       
    if (scrollTopPosition + thisWindow.height() + 500 > documentHeight) {
      if (this.readyToLoad && this.moreToLoad) {
        this.readyToLoad = false;
        this.loadArticles();
        
        scrollTopPosition = thisWindow.scrollTop();
        documentHeight = $(document).height();
      }
    }
    
    this.scrollPercentage = scrollTopPosition / documentHeight;
    this.cache.scrollPercentage = this.scrollPercentage;
  },
  
  
  remove: function() {   
    GlobalVariable.Browser.Window.off("scroll");
    
    Backbone.View.prototype.remove.call(this);
  }
});
