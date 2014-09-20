// define the view "Index.Main"
View.Article.Index.Main = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "handleScroll");

    this.readyToLoad = true;
    this.moreToLoad = true;    
    this.readyForWidthChange = false;

    // Global Page Cache
    this.renderWithCache = false;
    this.pageCacheKey = window.location.href;
    GlobalVariable.PageCache[this.pageCacheKey];
    if (GlobalVariable.PageCache[this.pageCacheKey]) {
      var cache = GlobalVariable.PageCache[this.pageCacheKey];
      this.nextBatchToLoad = cache.nextBatchToLoad;
      if ($.now() - cache.lastCacheTime < 3600000) {
        this.renderWithCache = true;
        this.cache = cache;
      }
    }
    if (!this.renderWithCache) {
      this.cache = {};
      GlobalVariable.PageCache[this.pageCacheKey] = this.cache;
      this.resetCache();
    }
  },
  
  
  resetCache: function() {
    var cache = this.cache;
    
    cache.lastCacheTime = $.now();
    
    cache.scrollTop = 0;
    cache.scrollPercentage = 0;
    
    cache.cascadeHeight = 0;
    cache.cascadeWidth = 0;
    
    cache.columnCount = 0;
    
    cache.compactMode = false;
    cache.gapSize = 0;
    cache.coverPadding = 0;
    cache.coverWidth = 0;
    cache.coverPictureScale = 0;
    cache.coverTopPosition = [];
    cache.coverLeftPosition = [];
    
    cache.nextBatchToLoad = 0;
    cache.batchPosition = [];
    cache.batchContainer = [];
    cache.articleParams = [];
  },
  
  
  el: "#layout-content",
  
  
  mainTemplate: JST["template/article/index/main"],
  coverTemplate: JST["template/article/index/cover"],
  
  
  getColumnCount: function(maxWidth, gapSize, columnWidth, moreCompact) {
    var columnCount = Math.floor((maxWidth + gapSize) / columnWidth);
    if (moreCompact) {
      if (maxWidth > columnWidth) {   // filter the case that the screen width is smaller than a column
        ++columnCount;
      }
    }
    if (columnCount < 1) {
      columnCount = 1;
    }
    if (columnCount > 5) {
      columnCount = 5;
    }
    return columnCount;
  },


  resetCascade: function(maxWidth, columnCount) {
    var cache = this.cache;
    
    var defaultColumnWidth = GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX;
    var columnWidth = defaultColumnWidth;
    
    if (cache.compactMode) {
      cache.gapSize = GlobalConstant.Cascade.COMPACT_GAP_SIZE;
      cache.coverPadding = GlobalConstant.Cascade.COMPACT_COVER_PADDING;
      columnWidth = (maxWidth + cache.gapSize) / columnCount;
      cache.coverWidth = columnWidth - cache.gapSize;
      cache.cascadeWidth = maxWidth - cache.gapSize;
      cache.coverPictureScale = (cache.coverWidth - cache.coverPadding * 2.0) / GlobalConstant.Cascade.COVER_PICTURE_WIDTH_IN_PX;
    } else {
      cache.gapSize = GlobalConstant.Cascade.NORMAL_GAP_SIZE;
      cache.coverPadding = GlobalConstant.Cascade.NORMAL_COVER_PADDING;
      cache.coverWidth = columnWidth - cache.gapSize;
      cache.cascadeWidth = columnCount * columnWidth - cache.gapSize;
      cache.coverPictureScale = 1.0;
    }
            
    cache.coverTopPosition = [];
    cache.coverLeftPosition = [];
    for (var index = 0; index < columnCount; ++index) {
      cache.coverTopPosition.push(0.0);
      cache.coverLeftPosition.push(columnWidth * index);
    }
    cache.cascadeHeight = 0.0;
  },
  
  
  initializeCoverDisplayMode: function(maxWidth) {  
    var defaultColumnWidth = GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX;
    var normalGapSize = GlobalConstant.Cascade.NORMAL_GAP_SIZE;
    var columnCount = this.getColumnCount(maxWidth, normalGapSize, defaultColumnWidth, false);
    var compactMode = false;
    if (maxWidth <= GlobalConstant.Cascade.MIN_WIDE_MODE_WIDTH_IN_PX) {
      if (maxWidth + normalGapSize - columnCount * defaultColumnWidth > defaultColumnWidth * 0.4 
        || maxWidth + normalGapSize < defaultColumnWidth)
      {
        compactMode = true;
        columnCount = this.getColumnCount(maxWidth, normalGapSize, defaultColumnWidth, compactMode);
      }
    }
    
    this.cache.columnCount = columnCount;
    this.cache.compactMode = compactMode;
  },
  
  
  refreshCascadeOptions: function(compactMode, columnCount) {
    if (compactMode && columnCount === 1) {
      $("#article-index-cascade-option").hide();
    } else {
      $("#article-index-cascade-option").show();
    }
  },
  
  
  render: function() {
    var cache = this.cache;
    
    GlobalVariable.Browser.Window.scrollTop(0);
    this.$el.html(this.mainTemplate());
    
    var maxWidth = this.$el.width() - GlobalVariable.Browser.ScrollBarWidthInPx;
    
    if (!this.renderWithCache) {
      cache.compactMode = this.initializeCoverDisplayMode(maxWidth);
    }  
    this.refreshCascadeOptions(cache.compactMode, cache.columnCount);

    this.cascadeContainer = $("#article-index-cascade-container");
    this.cascadeContainer.css("width", this.cascadeWidth + "px");
    GlobalVariable.Browser.Window.on("scroll", this.handleScroll);
    
    if (this.renderWithCache) {
      if (this.columnCount === cache.columnCount) {
        var batchCount = cache.batchContainer.length;
        for (var index = 0; index < batchCount; ++index) {
          cache.batchContainer[index] = false;
        }
        this.cascadeContainer.css("height", cache.cascadeHeight + "px");       
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
  
   
  getMinTopIndex: function() {
    var cache = this.cache;
    
    var minTopIndex = 0;
    var min = cache.coverTopPosition[0];
    for (var index = 1; index < cache.columnCount; ++index) {
      if (min > cache.coverTopPosition[index]) {
        min = cache.coverTopPosition[index];
        minTopIndex = index;
      }
    }
    return minTopIndex;
  },
  
  
  getCurrentCascadeHeight: function() {
    var cache = this.cache;
    
    var max = cache.coverTopPosition[0];
    for (var index = 1; index < cache.columnCount; ++index) {
      if (max < cache.coverTopPosition[index]) {
        max = cache.coverTopPosition[index];
      }
    }
    return max;
  },
  
  
  updateMinTop: function(minTop, minTopIndex) {
    this.cache.coverTopPosition[minTopIndex] = minTop;
  },
  
  
  loadArticles: function() {
    if (this.moreToLoad) {
      var that = this;
      var cache = this.cache;

      var articles = new Collection.Article.Article();
      var batchToLoad = cache.nextBatchToLoad;
      var countPerBatch = GlobalConstant.Cascade.ARTICLE_COUNT_PER_BATCH;
      
      articles.fetchBatch(batchToLoad, countPerBatch, {
        success: function(fetchedResults) {
          fetchedArticles = fetchedResults.models;
          
          if (fetchedArticles.length > 0) {
            var heightOffset = that.currentCascadeHeight;
            cache.batchPosition.push(heightOffset);
            cache.batchContainer.push(false);
            
            _.each(fetchedArticles, function(article) {          
              var originalCoverPictureHeight = article.get("cover_picture_height");
              
              var params = {
                id: article.get("id"),
                title: article.get("title"),
                author: article.get("author"),
                category: article.get("category_name"),
                picUrl: article.get("cover_picture_url"),
                originalPicHeight: originalCoverPictureHeight,
                picHeight: Math.floor(originalCoverPictureHeight * cache.coverPictureScale),
                picWidth: Math.floor(GlobalConstant.Cascade.COVER_PICTURE_WIDTH_IN_PX * cache.coverPictureScale),
                width: cache.coverWidth,
                padding: cache.coverPadding
              };
              
              cache.articleParams.push(params);
            });
            
            that.attachBatch(batchToLoad, true);
     
            ++cache.nextBatchToLoad;
            cache.lastCacheTime = $.now();
            
            that.readyToLoad = true;
            if (fetchedArticles.length < countPerBatch) {
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
    
    var cache = this.cache;
    
    var newCoverInNormalMode = $(event.currentTarget).data("coverDisplayMode") === "normal";
    if (newCoverInNormalMode !== cache.coverInNormalMode) {
      cache.coverInNormalMode = newCoverInNormalMode;
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
           
      var lastBatchInCache = cache.nextBatchToLoad - 1;
      var reusableCacheSize = 0;
      if (lastBatchInCache >= 1) {
        reusableCacheSize = 2;
      } else if (lastBatchInCache === 0) {
        reusableCacheSize = 1;
      }
      
      if (reusableCacheSize > 0) {
        var countPerBatch = GlobalConstant.Cascade.ARTICLE_COUNT_PER_BATCH;
        
        cache.nextBatchToLoad = reusableCacheSize;
        cache.batchPosition = cache.batchPosition.slice(0, reusableCacheSize);
        cache.batchContainer = cache.batchContainer.slice(0, reusableCacheSize);
        cache.articleParams = cache.articleParams.slice(0, reusableCacheSize * countPerBatch);
        
        for (var batchIndex = 0; batchIndex < reusableCacheSize; ++batchIndex) {
          var heightOffset = this.currentCascadeHeight;
          cache.batchPosition[batchIndex] = heightOffset;
          cache.batchContainer[batchIndex] = false;
          
          var thisBatchStart = batchIndex * countPerBatch;
          var nextBatchStart = (batchIndex + 1) * countPerBatch;
                    
          for (var index = thisBatchStart; index < nextBatchStart; ++index) {           
            var params = cache.articleParams[index];
            params.width = cache.coverWidth;
            params.padding = cache.coverPadding;
            params.picHeight = Math.floor(params.originalPicHeight * cache.coverPictureScale);
            params.picWidth = Math.floor(GlobalConstant.Cascade.COVER_PICTURE_WIDTH_IN_PX * cache.coverPictureScale);
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
    var cache = this.cache;
    
    if (!cache.batchContainer[batchIndex] || isInitialAttach) {
      var countPerBatch = GlobalConstant.Cascade.ARTICLE_COUNT_PER_BATCH;
      var batchStart = batchIndex * countPerBatch;
      var articleParamsLength = cache.articleParams.length;
      var batchEnd = batchStart + countPerBatch;
      if (batchEnd > articleParamsLength) {
        batchEnd = articleParamsLength;
      }
      --batchEnd;

      var cascadeContainer = this.cascadeContainer;        
      var batchContainer = $("<div style='position: absolute; left: 0; top: " + cache.batchPosition[batchIndex] + "px;'></div>");
      cascadeContainer.append(batchContainer);
      cache.batchContainer[batchIndex] = batchContainer;
      
      if (isInitialAttach) {
        for (var index = batchStart; index <= batchEnd; ++index) {
          var minTopIndex = this.getMinTopIndex();
          var top = cache.coverTopPosition[minTopIndex];
          var left = cache.coverLeftPosition[minTopIndex];
          
          var params = cache.articleParams[index];
          params.top = top - heightOffset;
          params.left = left;
          
          var articleCover = $(this.coverTemplate(params));
          batchContainer.append(articleCover);
          var articleCoverHeight = articleCover.outerHeight();
          params.height = articleCoverHeight;
          
          var newMinTop = cache.gapSize + top + articleCoverHeight;
          this.updateMinTop(newMinTop, minTopIndex);          
        }
        
        var cascadeHeight = this.getCurrentCascadeHeight();
        batchContainer.css("height", cascadeHeight + "px");   // This will keep cascade container the same height even when old batch container is detached.
        cache.currentCascadeHeight = cascadeHeight;
        cache.scrollPercentage = GlobalVariable.Browser.Window.scrollTop() / GlobalVariable.Browser.Document.height();
      } else {
        for (var index = batchStart; index <= batchEnd; ++index) {
          var articleCover = $(this.coverTemplate(cache.articleParams[index]));
          batchContainer.append(articleCover);
        }
      }
      
      cache.batchContainer[batchIndex] = batchContainer;
    }
  },
  
  
  onWidthChange: function() {
    var cache = this.cache;
    
    if (this.readyForWidthChange) {   
      this.maxWidth = this.$el.width();
      var newColumnCount = this.getColumnCount(this.maxWidth, this.columnWidth);
      
      if (newColumnCount !== cache.columnCount) {       
        this.resetCascade(this.columnWidth * newColumnCount, newColumnCount);      
        this.resetCascadeContainer();
                
        var articleParamsLength = cache.articleParams.length;
        var countPerBatch = GlobalConstant.Cascade.ARTICLE_COUNT_PER_BATCH;
        var batchIndex = 0;
        for (var thisBatchStart = 0; thisBatchStart < articleParamsLength; thisBatchStart += countPerBatch) {
          var nextBatchStart = thisBatchStart + countPerBatch;
          if (nextBatchStart > articleParamsLength) {
            nextBatchStart = articleParamsLength;
          }
          
          var heightOffset = cache.cascadeHeight;
          cache.batchPosition[batchIndex] = heightOffset;
          cache.batchContainer[batchIndex] = false;
          
          for (var index = thisBatchStart; index < nextBatchStart; ++index) {
            var minTopIndex = this.getMinTopIndex();
            var top = cache.coverTopPosition[minTopIndex];
            var left = cache.coverLeftPosition[minTopIndex];
            var params = cache.articleParams[index];
            params.top = top - heightOffset;
            params.left = left;
            var newMinTop = cache.gapSize + top + params.height;
            this.updateMinTop(newMinTop, minTopIndex);
          }
                  
          cache.cascadeHeight = this.getCurrentCascadeHeight();
          ++batchIndex;
        };
        
        newCascadeContainer.css("height", cache.cascadeHeight + "px");
        
        this.jumpToLastScrollPosition();
      }
    }
  },
  
  
  jumpToLastScrollPosition: function() {
    var cache = this.cache;
    
    cache.firstVisibleBatch = -1;
    cache.lastVisibleBatch = -1;

    var oldScrollTop = cache.lastScrollTop;
    var newScrollTop = GlobalVariable.Browser.Document.height() * cache.scrollPercentage;
    GlobalVariable.Browser.Window.scrollTop(newScrollTop);
    if (newScrollTop === oldScrollTop) {
      this.handleScroll();
    }
    cache.lastScrollTop = newScrollTop;
  },
  
  
  handleScroll: function(event) {
    var cache = this.cache;
    
    var thisWindow = GlobalVariable.Browser.Window;
    var scrollTopPosition = thisWindow.scrollTop();
    cache.scrollPercentage = scrollTopPosition / GlobalVariable.Browser.Document.height();
    
    var firstVisibleBatch = 0;
    var lastVisibleBatch = 0;
    var lastBatch = cache.nextBatchToLoad - 1;
    
    if (lastBatch >= 0) {
      if (scrollTopPosition >= cache.batchPosition[lastBatch]) {
        firstVisibleBatch = lastBatch;
        lastVisibleBatch = lastBatch;
      } else {
        for (var ii = lastBatch; ii > 0; --ii) {
          if (scrollTopPosition < cache.batchPosition[ii] && scrollTopPosition >= cache.batchPosition[ii - 1]) {
            firstVisibleBatch = ii - 1;
            lastVisibleBatch = firstVisibleBatch;
            
            var scrollBottmPosition = scrollTopPosition + thisWindow.height();
            if (scrollBottmPosition >= cache.batchPosition[lastBatch]) {
              lastVisibleBatch = lastBatch;
            } else {
              for (var jj = firstVisibleBatch + 1; jj <= lastBatch; ++jj) {
                if (scrollBottmPosition < cache.batchPosition[jj]) {
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
    
    var nextBatchToLoad = cache.nextBatchToLoad;
    if (lastVisibleBatch + GlobalConstant.Cascade.EAGER_LOAD_BATCH_COUNT > nextBatchToLoad - 1) {   // Possible Bug: may triggered but not loaded.
      lastOnBoardBatch = nextBatchToLoad;      
      if (this.readyToLoad && this.moreToLoad) {
        this.readyToLoad = false;
        this.loadArticles();
      }
      lastBatch = nextBatchToLoad - 1;
    }
    
    if (firstVisibleBatch !== cache.firstVisibleBatch || lastVisibleBatch !== cache.lastVisibleBatch) {
      cache.firstVisibleBatch = firstVisibleBatch;
      cache.lastVisibleBatch = lastVisibleBatch;
      
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
      if (scrollTopPosition > cache.lastScrollTop) {   // scroll down
        lastBatchNeedToBeRemoved = firstOnBoardBatch - 1;
      } else if (scrollTopPosition < cache.lastScrollTop) {   // scroll up
        firstBatchNeedToBeRemoved = lastOnBoardBatch + 1;
      }
      cache.lastScrollTop = scrollTopPosition;
      for (var index = firstBatchNeedToBeRemoved; index <= lastBatchNeedToBeRemoved; ++index) {
        var batchContainer = cache.batchContainer[index];
        if (batchContainer) {
          batchContainer.detach();
          batchContainer.remove();
          cache.batchContainer[index] = false;
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
