// define the view "Index.Main"
View.Article.Index.Main = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "handleScroll");
        
    this.articlesPerBatch = 30;
    
    this.nextBatchToLoad = 0;
    this.eagerLoadBatchCount = 1;
    this.readyToLoad = true;
    this.moreToLoad = true;
    
    this.readyForWidthChange = false;
    this.scrollPercentage = 0;
    this.lastScrollTop = 0;
    
    this.firstVisibleBatch = -1,
    this.lastVisibleBatch = -1,
    
    // Global Page Cache
    this.renderWithCache = false;
    this.pageCacheKey = window.location.href;
    GlobalVariable.PageCache[this.pageCacheKey];
    if (GlobalVariable.PageCache[this.pageCacheKey]) {
      this.cache = GlobalVariable.PageCache[this.pageCacheKey];
      this.nextBatchToLoad = this.cache.nextBatchToLoad;
      if ($.now() - this.cache.lastCacheTime < 3600000) {
        this.renderWithCache = true;
      } 
    } else {
      this.cache = {};
      GlobalVariable.PageCache[this.pageCacheKey] = this.cache;
      this.resetCache();
    }
  },
  
  
  resetCache: function() {
    this.cache.lastCacheTime = $.now();
    this.cache.cascadeContainerHeight = 0;
    this.cache.scrollPercentage = 0;
    this.cache.columnCount = 0;
    this.cache.columnWidth = 0;
    this.cache.columnHeight = null;
    this.cache.batch = 0;
    this.cache.batchPosition = [];
    this.cache.batchContainer = [];
    this.cache.articleParams = [];
  },
  
  
  el: "#layout-content",
  
  
  mainTemplate: JST["template/article/index/main"],
  coverTemplate: JST["template/article/index/cover"],
  
  
  getColumnCount: function(maxWidth, columnWidth) {
    var columnCount = Math.floor(maxWidth / columnWidth);
    if (columnCount < 1) {
      columnCount = 1;
    }
    if (columnCount > 5) {
      columnCount = 5;
    }
    return columnCount;
  },


  resetCascade: function(maxWidth, columnCount) {
    var defaultColumnWidth = GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX;
    this.columnWidth = defaultColumnWidth;
    
    if (this.coverInNormalMode) {
      this.gap = 8.0;
      this.coverPadding = 16.0;
      this.coverWidth = this.columnWidth - this.gap;
      this.actualWidth = columnCount * this.columnWidth - this.gap;
      this.coverPictureScale = 1.0;
    } else {
      this.gap = 4.0;
      this.coverPadding = 8.0;
      this.columnWidth = maxWidth / columnCount;
      this.coverWidth = this.columnWidth - this.gap;
      this.actualWidth = maxWidth - this.gap;
      this.coverPictureScale = (this.coverWidth - this.coverPadding * 2.0) / GlobalConstant.Cascade.COVER_PICTURE_WIDTH_IN_PX;
    }
        
    this.hPosition = [];
    this.vPosition = [];
    for (var index = 0; index < columnCount; ++index) {
      this.hPosition.push(0.0);
      this.vPosition.push(this.columnWidth * index);
    }
    this.minHorizontalIndex = 0;
    this.currentCascadeHeight = 0.0;
  },
  
  
  render: function() {
    GlobalVariable.Browser.Window.scrollTop(0);
    this.$el.html(this.mainTemplate());
    
    this.maxWidth = this.$el.width() - GlobalVariable.Browser.ScrollBarWidthInPx;
    
    if (this.renderWithCache) {
      this.coverInNormalMode = this.cache.coverInNormalMode;
      this.columnCount = this.getColumnCount(this.maxWidth, this.cache.columnWidth);
      this.resetCascade(this.cache.columnWidth * this.columnCount, this.columnCount);
    } else {
      // get the display mode for article cover, "shrinked" or "normal"
      var defaultColumnWidth = GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX;
      this.columnCount = this.getColumnCount(this.maxWidth, defaultColumnWidth);
      this.coverInNormalMode = true;
      if (this.maxWidth > GlobalConstant.Cascade.MIN_WIDE_MODE_WIDTH_IN_PX) {
        $("#article-index-cascade-option").hide();
      } else {
        $("#article-index-cascade-option").show();
        if (this.maxWidth - this.columnCount * defaultColumnWidth > defaultColumnWidth * 0.4) {
          this.columnCount += 1;
          this.coverInNormalMode = false;
        } else {
          if (this.maxWidth < defaultColumnWidth) {   // situation: screen width is smaller than one column width.
            this.coverInNormalMode = false;
            $("#article-index-cascade-option").hide();
          }
        }
      }
      this.cache.coverInNormalMode = this.coverInNormalMode;
      this.resetCascade(this.maxWidth, this.columnCount);
    }

    this.cascadeContainer = $("#article-index-cascade-container");
    this.cascadeContainer.css("width", this.actualWidth + "px");
    GlobalVariable.Browser.Window.on("scroll", this.handleScroll);
    
    if (this.renderWithCache) {
      if (this.columnCount === this.cache.columnCount) {
        var batchCount = this.cache.batchContainer.length;
        for (var index = 0; index < batchCount; ++index) {
          this.cache.batchContainer[index] = false;
        }
        this.cascadeContainer.css("height", this.cache.cascadeContainerHeight + "px");       
        this.jumpToLastScrollPosition();
      } else {
        this.readyForWidthChange = true;
        this.onWidthChange();
      }
    } else {
      this.loadArticles();
    }
    
    this.readyForWidthChange = true;
       
    return this;
  },
  
   
  getMinHorizontalIndex: function() {
    var minHorizontalIndex = 0;
    var min = this.cache.hPosition[0];
    for (var index = 1; index < this.cache.columnCount; ++index) {
      if (min > this.cache.hPosition[index]) {
        min = this.cache.hPosition[index];
        minHorizontalIndex = index;
      }
    }
    return minHorizontalIndex;
  },
  
  
  getCurrentCascadeHeight: function() {
    var max = this.cache.hPosition[0];
    for (var index = 1; index < this.cache.columnCount; ++index) {
      if (max < this.cache.hPosition[index]) {
        max = this.cache.hPosition[index];
      }
    }
    return max;
  },
  
  
  insertNewCoordinate: function(hCoordinate, vCoordinate) {
    this.cache.hPosition[this.minHorizontalIndex] = hCoordinate;
    this.cache.vPosition[this.minHorizontalIndex] = vCoordinate;
  },
  
  
  loadArticles: function() {
    if (this.moreToLoad) {
      var that = this;

      var articles = new Collection.Article.Article();
      var batchToLoad = that.cache.nextBatchToLoad;
      
      articles.fetchBatch(batchToLoad, that.articlesPerBatch, {
        success: function(fetchedResults) {
          fetchedArticles = fetchedResults.models;
          
          if (fetchedArticles.length > 0) {
            var heightOffset = that.currentCascadeHeight;
            that.cache.batchPosition.push(heightOffset);
            that.cache.batchContainer.push(false);
            
            _.each(fetchedArticles, function(article) {          
              var originalCoverPictureHeight = article.get("cover_picture_height");
              
              var params = {
                articleId: article.get("id"),
                articleTitle: article.get("title"),
                articleAuthor: article.get("author"),
                articleCategory: article.get("category_name"),
                coverPictureUrl: article.get("cover_picture_url"),
                originalCoverPictureHeight: originalCoverPictureHeight,
                coverPictureHeight: Math.floor(originalCoverPictureHeight * that.coverPictureScale),
                width: that.coverWidth,
                padding: that.coverPadding
              };
              
              that.cache.articleParams.push(params);
            });
            
            that.attachBatch(batchToLoad, true);
     
            ++that.cache.nextBatchToLoad;
            that.cache.lastCacheTime = $.now();
            
            that.readyToLoad = true;
            if (fetchedArticles.length < that.articlesPerBatch) {
              that.moreToLoad = false;
            }
          } else {
            that.readyToLoad = true;
            that.moreToLoad = false;
          }
        }
      });
    }
  },
  
  
  events: {
    "click #article-index-cascade-shrinked-cover": "changeCoverDisplayMode",
    "click #article-index-cascade-normal-cover": "changeCoverDisplayMode"
  },
  
  
  resetCascadeContainer: function() {
    var oldCascadeContainer = this.cascadeContainer;
    oldCascadeContainer.detach();
    
    var newCascadeContainer = $("<div id='article-index-cascade-container' style='width: " + this.cache.actualCascadeWidth + "px;'></div>");
    this.$el.append(newCascadeContainer);
    this.cascadeContainer = newCascadeContainer;
    
    oldCascadeContainer.remove();
  },
  
  
  changeCoverDisplayMode: function(event) {
    event.preventDefault();
    
    var newCoverInNormalMode = $(event.currentTarget).data("coverDisplayMode") === "normal";
    if (newCoverInNormalMode !== this.cache.coverInNormalMode) {
      this.cache.coverInNormalMode = newCoverInNormalMode;
      GlobalVariable.Browser.Window.scrollTop(0);
      this.maxWidth = this.$el.width();
      
      this.columnCount = this.getColumnCount(this.maxWidth, GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX);
      if (!newCoverInNormalMode) {
        // do not need to consider the situation: screen width is smaller than one column width.
        this.columnCount += 1;
      }
      
      this.resetCascade(this.maxWidth, this.columnCount);
      this.readyToLoad = true;
      this.moreToLoad = true;
      
      this.resetCascadeContainer();
           
      var lastBatchInCache = this.cache.nextBatchToLoad - 1;
      var reusableCacheSize = 0;
      if (lastBatchInCache >= 1) {
        reusableCacheSize = 2;
      } else if (lastBatchInCache === 0) {
        reusableCacheSize = 1;
      }
      
      if (reusableCacheSize > 0) {
        this.cache.nextBatchToLoad = reusableCacheSize;
        this.cache.batchPosition = this.cache.batchPosition.slice(0, reusableCacheSize);
        this.cache.batchContainer = this.cache.batchContainer.slice(0, reusableCacheSize);
        this.cache.articleParams = this.cache.articleParams.slice(0, reusableCacheSize * this.articlesPerBatch);
        
        for (var batchIndex = 0; batchIndex < reusableCacheSize; ++batchIndex) {
          var heightOffset = this.currentCascadeHeight;
          this.cache.batchPosition[batchIndex] = heightOffset;
          this.cache.batchContainer[batchIndex] = false;
          
          var thisBatchStart = batchIndex * this.articlesPerBatch;
          var nextBatchStart = (batchIndex + 1) * this.articlesPerBatch;
                    
          for (var index = thisBatchStart; index < nextBatchStart; ++index) {           
            var params = this.cache.articleParams[index];
            params.coverPictureHeight = params.originalCoverPictureHeight * this.coverPictureScale;
            params.width = this.coverWidth;
            params.padding = this.coverPadding;
          }
          
          this.attachBatch(batchIndex, true);
        }
      } else {
        this.resetCache();
        this.loadArticles();
      }
    }
  },
   
 
  attachBatch: function(batchIndex, isInitialAttach) {
    if (!this.cache.batchContainer[batchIndex] || isInitialAttach) {
      var batchStart = batchIndex * this.articlesPerBatch;
      var articleParamsLength = this.cache.articleParams.length;
      var batchEnd = batchStart + this.articlesPerBatch;
      if (batchEnd > articleParamsLength) {
        batchEnd = articleParamsLength;
      }
      --batchEnd;

      var cascadeContainer = this.cascadeContainer;        
      var batchContainer = $("<div style='position: absolute; left: 0; top: " + this.cache.batchPosition[batchIndex] + "px;'></div>");
      cascadeContainer.append(batchContainer);
      this.cache.batchContainer[batchIndex] = batchContainer;
      
      if (isInitialAttach) {
        for (var index = batchStart; index <= batchEnd; ++index) {
          var minHorizontal = this.getMinHorizontalIndex();
          var hCoordinate = this.cache.hPosition[minHorizontal];
          var vCoordinate = this.cache.vPosition[minHorizontal];
          
          var params = this.cache.articleParams[index];
          params.hCoordinate = hCoordinate - heightOffset;
          params.vCoordinate = vCoordinate;
          
          var articleCover = $(this.coverTemplate(params));
          batchContainer.append(articleCover);
          var articleCoverHeight = articleCover.outerHeight();
          params.height = articleCoverHeight;
          
          var newHorizontalCoordinate = this.cache.gap + hCoordinate + articleCoverHeight;
          this.insertNewCoordinate(newHorizontalCoordinate, vCoordinate);          
        }
        
        var cascadeHeight = this.getCurrentCascadeHeight();
        batchContainer.css("height", cascadeHeight + "px");   // This will keep cascade container the same height even when old batch container is detached.
        this.cache.currentCascadeHeight = cascadeHeight;
        that.cache.scrollPercentage = GlobalVariable.Browser.Window.scrollTop() / GlobalVariable.Browser.Document.height();
      } else {
        for (var index = batchStart; index <= batchEnd; ++index) {
          var articleCover = $(this.coverTemplate(this.cache.articleParams[index]));
          batchContainer.append(articleCover);
        }
      }
      
      this.cache.batchContainer[batchIndex] = batchContainer;
    }
  },
  
  
  onWidthChange: function() {
    if (this.readyForWidthChange) {   
      this.maxWidth = this.$el.width();
      var newColumnCount = this.getColumnCount(this.maxWidth, this.columnWidth);
      
      if (newColumnCount !== this.cache.columnCount) {       
        this.resetCascade(this.columnWidth * newColumnCount, newColumnCount);      
        this.resetCascadeContainer();
                
        var articleParamsLength = this.cache.articleParams.length;
        var batchIndex = 0;
        for (var thisBatchStart = 0; thisBatchStart < articleParamsLength; thisBatchStart += this.articlesPerBatch) {
          var nextBatchStart = thisBatchStart + this.articlesPerBatch;
          if (nextBatchStart > articleParamsLength) {
            nextBatchStart = articleParamsLength;
          }
          
          var heightOffset = this.cache.cascadeContainerHeight;
          this.cache.batchPosition[batchIndex] = heightOffset;
          this.cache.batchContainer[batchIndex] = false;
          
          for (var index = thisBatchStart; index < nextBatchStart; ++index) {
            var minHorizontal = this.getMinHorizontalIndex();
            var hCoordinate = this.cache.hPosition[minHorizontal];
            var vCoordinate = this.cache.vPosition[minHorizontal];
            var params = this.cache.articleParams[index];
            params.hCoordinate = hCoordinate - heightOffset;
            params.vCoordinate = vCoordinate;
            var newHorizontalCoordinate = this.cache.gap + hCoordinate + params.height;
            this.insertNewCoordinate(newHorizontalCoordinate, vCoordinate);
          }
                  
          this.cache.cascadeContainerHeight = this.getCurrentCascadeHeight();
          ++batchIndex;
        };
        
        newCascadeContainer.css("height", this.cache.cascadeContainerHeight + "px");
        
        this.jumpToLastScrollPosition();
      }
    }
  },
  
  
  jumpToLastScrollPosition: function() {
    this.cache.firstVisibleBatch = -1;
    this.cache.lastVisibleBatch = -1;

    var oldScrollTop = this.cache.lastScrollTop;
    var newScrollTop = GlobalVariable.Browser.Document.height() * this.cache.scrollPercentage;
    GlobalVariable.Browser.Window.scrollTop(newScrollTop);
    if (newScrollTop === oldScrollTop) {
      this.handleScroll();
    }
    this.cache.lastScrollTop = newScrollTop;
  },
  
  
  handleScroll: function(event) {
    var thisWindow = GlobalVariable.Browser.Window;
    var scrollTopPosition = thisWindow.scrollTop();
    this.cache.scrollPercentage = scrollTopPosition / GlobalVariable.Browser.Document.height();
    
    var firstVisibleBatch = 0;
    var lastVisibleBatch = 0;
    var lastBatch = this.cache.nextBatchToLoad - 1;
    
    if (lastBatch >= 0) {
      if (scrollTopPosition >= this.cache.batchPosition[lastBatch]) {
        firstVisibleBatch = lastBatch;
        lastVisibleBatch = lastBatch;
      } else {
        for (var ii = lastBatch; ii > 0; --ii) {
          if (scrollTopPosition < this.cache.batchPosition[ii] && scrollTopPosition >= this.cache.batchPosition[ii - 1]) {
            firstVisibleBatch = ii - 1;
            lastVisibleBatch = firstVisibleBatch;
            
            var scrollBottmPosition = scrollTopPosition + thisWindow.height();
            if (scrollBottmPosition >= this.cache.batchPosition[lastBatch]) {
              lastVisibleBatch = lastBatch;
            } else {
              for (var jj = firstVisibleBatch + 1; jj <= lastBatch; ++jj) {
                if (scrollBottmPosition < this.cache.batchPosition[jj]) {
                  lastVisibleBatch = jj - 1;
                  break;
                }
              }
            }
            
            break;
          }
        }
      }
    }
    
    var nextBatchToLoad = this.cache.nextBatchToLoad;
    if (lastVisibleBatch + this.eagerLoadBatchCount > nextBatchToLoad - 1) {   // Possible Bug: may triggered but not loaded.
      lastOnBoardBatch = nextBatchToLoad;      
      if (this.readyToLoad && this.moreToLoad) {
        this.readyToLoad = false;
        this.loadArticles();
      }
      lastBatch = nextBatchToLoad - 1;
    }
    
    if (firstVisibleBatch !== this.cache.firstVisibleBatch || lastVisibleBatch !== this.cache.lastVisibleBatch) {
      this.cache.firstVisibleBatch = firstVisibleBatch;
      this.cache.lastVisibleBatch = lastVisibleBatch;
      
      for(var index = firstVisibleBatch; index <= lastVisibleBatch; ++index) {
        this.attachBatch(index, false);
      }
      
      var firstOnBoardBatch = firstVisibleBatch - 1;
      if (firstOnBoardBatch < 0) {firstOnBoardBatch = 0;}
      this.attachBatch(firstOnBoardBatch, false);

      var lastOnBoardBatch = lastVisibleBatch + 1;
      if (lastOnBoardBatch > lastBatch) {lastOnBoardBatch = lastBatch;}
      this.attachBatch(lastOnBoardBatch, false);
      
      // detach batches that should not be on board.
      var firstBatchNeedToBeRemoved = 0;
      var lastBatchNeedToBeRemoved = 0;
      if (scrollTopPosition > this.cache.lastScrollTop) {   // scroll down
        lastBatchNeedToBeRemoved = firstOnBoardBatch - 1;
      } else if (scrollTopPosition < this.cache.lastScrollTop) {   // scroll up
        firstBatchNeedToBeRemoved = lastOnBoardBatch + 1;
      }
      this.cache.lastScrollTop = scrollTopPosition;
      for (var index = firstBatchNeedToBeRemoved; index <= lastBatchNeedToBeRemoved; ++index) {
        var batchContainer = this.cache.batchContainer[index];
        if (batchContainer) {
          batchContainer.detach();
          batchContainer.remove();
          this.cache.batchContainer[index] = false;
        }
      }
    }
  },
  
  
  remove: function() {
    GlobalVariable.Browser.Window.off("scroll");
    
    this.cascadeContainer = null;
    
    Backbone.View.prototype.remove.call(this);
  }
});
