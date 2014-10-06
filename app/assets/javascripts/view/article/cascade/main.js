// define the Article Cascade main API view "Cascade.Main"
View.Article.Cascade.Main = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, "handleScroll");
    _.bindAll(this, "loadArticles");

    this.articleFetchFunction = options.articleFetchFunction;
    
    this.readyToLoad = true;
    this.moreToLoad = true;    
    this.readyForWidthChange = false;

    // Global Page Cache
    this.renderWithCache = false;
    this.pageCacheKey = window.location.href;
    GlobalVariable.PageCache[this.pageCacheKey];
    if (GlobalVariable.PageCache[this.pageCacheKey]) {
      this.cache = GlobalVariable.PageCache[this.pageCacheKey];
      if (!this.cacheExpired()) {
        this.renderWithCache = true;
      }
    }
    if (!this.renderWithCache) {
      this.cache = {};
      GlobalVariable.PageCache[this.pageCacheKey] = this.cache;
      this.resetCache();
    }
  },
  
  
  cacheExpired: function() {
    return ($.now() - this.cache.lastCacheTime > GlobalConstant.Cascade.CACHE_LIFETIME_IN_SECOND * 1000);
  },
  
  
  resetCache: function() {
    var cache = this.cache;
    
    cache.lastCacheTime = $.now();
    
    cache.scrollTop = 0;
    cache.scrollPercentage = 0;
    
    cache.cascadeHeight = 0;
    cache.cascadeWidth = 0;
    
    cache.columnCount = 0;
    cache.columnWidth = 0;
    
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
    cache.batchProcessed = [];
    cache.articleParams = [];
    
    cache.firstVisibleBatch = -1;
    cache.lastVisibleBatch = -1;
  },
  
  
  el: "#article-cascade-container",
  
  
  mainTemplate: JST["template/article/cascade/main"],
  coverTemplate: JST["template/article/cascade/cover"],
  
  
  getColumnCount: function(maxWidth, columnWidth, gapSize, moreCompact) {
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


  resetCascadeParams: function(maxWidth) {
    var cache = this.cache;
    
    var columnWidth = GlobalConstant.Cascade.NORMAL_COLUMN_WIDTH_IN_PX;
    
    if (cache.compactMode) {
      cache.gapSize = GlobalConstant.Cascade.COMPACT_GAP_SIZE;
      cache.coverPadding = GlobalConstant.Cascade.COMPACT_COVER_PADDING;
      var calculatedColumnWidth = (maxWidth + cache.gapSize) / cache.columnCount;
      var maxCompactColumnWidth = GlobalConstant.Cascade.COVER_PICTURE_WIDTH_IN_PX + cache.coverPadding * 2;
      if (calculatedColumnWidth < maxCompactColumnWidth) {
        columnWidth = calculatedColumnWidth;
      } else {
        columnWidth = maxCompactColumnWidth;
      }
      cache.coverWidth = columnWidth - cache.gapSize;
      cache.coverPictureScale = (cache.coverWidth - cache.coverPadding * 2.0) / GlobalConstant.Cascade.COVER_PICTURE_WIDTH_IN_PX;
    } else {
      cache.gapSize = GlobalConstant.Cascade.NORMAL_GAP_SIZE;
      cache.coverPadding = GlobalConstant.Cascade.NORMAL_COVER_PADDING;
      cache.coverWidth = columnWidth - cache.gapSize;
      cache.coverPictureScale = 1.0;
    }
    
    cache.columnWidth = columnWidth;
  },
  
  
  resetCoverPositionGenerator: function() {
    var cache = this.cache;
    
    cache.cascadeWidth = cache.columnCount * cache.columnWidth - cache.gapSize;
    cache.coverTopPosition = [];
    cache.coverLeftPosition = [];
    for (var index = 0; index < cache.columnCount; ++index) {
      cache.coverTopPosition.push(0.0);
      cache.coverLeftPosition.push(cache.columnWidth * index);
    }
    cache.cascadeHeight = 0.0;
  },
   
  
  initializeCoverDisplayMode: function(maxWidth) {  
    var normalColumnWidth = GlobalConstant.Cascade.NORMAL_COLUMN_WIDTH_IN_PX;
    var normalGapSize = GlobalConstant.Cascade.NORMAL_GAP_SIZE;
    var columnCount = this.getColumnCount(maxWidth, normalColumnWidth, normalGapSize, false);
    var compactMode = false;
    if (maxWidth <= GlobalConstant.Cascade.MIN_WIDE_MODE_WIDTH_IN_PX) {
      if (maxWidth + normalGapSize - columnCount * normalColumnWidth > normalColumnWidth * 0.4 
        || maxWidth + normalGapSize < normalColumnWidth)
      {
        compactMode = true;
        columnCount = this.getColumnCount(maxWidth, normalColumnWidth, normalGapSize, compactMode);
      }
    }
    
    this.cache.columnCount = columnCount;
    this.cache.compactMode = compactMode;
  },
  
  
  resetCascadeContainer: function() {
    GlobalVariable.Browser.Window.off("scroll", this.handleScroll);
    
    var oldCascadeContainer = this.cascadeContainer;
    if (oldCascadeContainer) {
      oldCascadeContainer.detach();
      oldCascadeContainer.remove();
    }
    
    var newCascadeContainer = $("<div id='article-cascade-content-container' style='width: " + this.cache.cascadeWidth + "px;'></div>");
    this.$el.append(newCascadeContainer);
    this.cascadeContainer = newCascadeContainer;
    
    GlobalVariable.Browser.Window.on("scroll", this.handleScroll);
  },

  
  render: function() {
    var cache = this.cache;
    
    this.$el.html(this.mainTemplate());
    
    var thisBrowser = GlobalVariable.Browser;
    thisBrowser.Window.scrollTop(0);
    
    var maxWidth = this.$el.width() - thisBrowser.ScrollBarWidthInPx;
    
    if (this.renderWithCache) {
      var newColumnCount = this.getColumnCount(maxWidth, GlobalConstant.Cascade.NORMAL_COLUMN_WIDTH_IN_PX, GlobalConstant.Cascade.NORMAL_GAP_SIZE, cache.compactMode);
      this.resetCascadeContainer();
      
      if (newColumnCount === cache.columnCount) {
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
      this.initializeCoverDisplayMode(maxWidth);
      this.resetCascadeParams(maxWidth);
      this.resetCoverPositionGenerator();
      this.resetCascadeContainer();
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
  
  
  updateCoverPositionGenerator: function(topPosition, topPositionIndex) {
    this.cache.coverTopPosition[topPositionIndex] = topPosition;
  },
  
  
  enoughForScrolling: function() {
      var thisWindow = GlobalVariable.Browser.Window;
      return (this.cache.cascadeHeight > thisWindow.scrollTop() + thisWindow.height());
  },
  
  
  loadArticles: function() {
    if (this.moreToLoad) {
      this.readyToLoad = false;   // only one load process allowed
      
      var that = this;
      var cache = this.cache;

      var batchToLoad = cache.nextBatchToLoad;
      var countPerBatch = GlobalConstant.Cascade.ARTICLE_COUNT_PER_BATCH;
      
      this.articleFetchFunction(batchToLoad, countPerBatch, {
        success: function(fetchedResults) {
          fetchedArticles = fetchedResults.models;
          
          if (fetchedArticles.length > 0) {          
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
            
            var heightOffset = cache.cascadeHeight;
            cache.batchPosition.push(heightOffset);
            cache.batchContainer.push(false);
            cache.batchProcessed.push(false);
            
            ++cache.nextBatchToLoad;
            cache.lastCacheTime = $.now();
            
            that.attachBatch(batchToLoad, true);
            
            if (fetchedArticles.length < countPerBatch) {
              that.moreToLoad = false;
            }
          } else {
            that.moreToLoad = false;
          }
          
          that.readyToLoad = true;
          if (that.moreToLoad && !that.enoughForScrolling()) {
            that.loadArticles();
          }
        },
        
        error: function() {
          // TODO: put some error handling logic here
          that.readyToLoad = true;
        }
      });
    }
  },
  
  
  events: {
    "click #article-cascade-compact-mode": "changeCoverDisplayMode",
    "click #article-cascade-normal-mode": "changeCoverDisplayMode"
  },
  
  
  changeCoverDisplayMode: function(event) {
    event.preventDefault();
    
    var cache = this.cache;
    
    var reusableCacheSize = 0;
    if (this.cacheExpired()) {
      this.resetCache();
    } else {
      var lastBatchInCache = cache.nextBatchToLoad - 1;
      if (lastBatchInCache >= 1) {
        reusableCacheSize = 2;
      } else if (lastBatchInCache === 0) {
        reusableCacheSize = 1;
      }
    }
    
    cache.compactMode = $(event.currentTarget).data("displayMode") === "compact";
    var maxWidth = this.$el.width();
    cache.columnCount = this.getColumnCount(maxWidth, GlobalConstant.Cascade.NORMAL_COLUMN_WIDTH_IN_PX, GlobalConstant.Cascade.NORMAL_GAP_SIZE, cache.compactMode);
    
    this.resetCascadeParams(maxWidth);
    this.resetCoverPositionGenerator();
    this.resetCascadeContainer();
    this.readyToLoad = true;
    this.moreToLoad = true;
    
    if (reusableCacheSize > 0) {
      var countPerBatch = GlobalConstant.Cascade.ARTICLE_COUNT_PER_BATCH;
      
      cache.nextBatchToLoad = reusableCacheSize;
      cache.batchPosition = cache.batchPosition.slice(0, reusableCacheSize);
      cache.batchContainer = cache.batchContainer.slice(0, reusableCacheSize);
      var articleParamsCount = reusableCacheSize * countPerBatch;
      if (articleParamsCount > cache.articleParams.length) {
        articleParamsCount = cache.articleParams.length;
      }
      cache.articleParams = cache.articleParams.slice(0, articleParamsCount);
      
      for (var batchIndex = 0; batchIndex < reusableCacheSize; ++batchIndex) {
        var heightOffset = cache.cascadeHeight;
        cache.batchPosition[batchIndex] = heightOffset;
        cache.batchContainer[batchIndex] = false;
        
        var thisBatchStart = batchIndex * countPerBatch;
        var nextBatchStart = (batchIndex + 1) * countPerBatch;
        if (nextBatchStart > articleParamsCount) {
          nextBatchStart = articleParamsCount;
        }
        
        for (var index = thisBatchStart; index < nextBatchStart; ++index) {           
          var params = cache.articleParams[index];
          params.width = cache.coverWidth;
          params.padding = cache.coverPadding;
          params.picHeight = Math.floor(params.originalPicHeight * cache.coverPictureScale);
          params.picWidth = Math.floor(GlobalConstant.Cascade.COVER_PICTURE_WIDTH_IN_PX * cache.coverPictureScale);
        }
        
        this.attachBatch(batchIndex, true);
      }
    }
    
    if (!this.enoughForScrolling()) {
      this.loadArticles();
    }
  },
   
 
  attachBatch: function(batchIndex, isInitialAttach) {
    var cache = this.cache;
    
    if (batchIndex >=0 && batchIndex < cache.nextBatchToLoad) {   // safer
      if ((!cache.batchContainer[batchIndex] && cache.batchProcessed[batchIndex]) || isInitialAttach) {
        var countPerBatch = GlobalConstant.Cascade.ARTICLE_COUNT_PER_BATCH;
        var batchStart = batchIndex * countPerBatch;
        var articleParamsLength = cache.articleParams.length;
        var batchEnd = batchStart + countPerBatch;
        if (batchEnd > articleParamsLength) {
          batchEnd = articleParamsLength;
        }
        --batchEnd;
  
        var cascadeContainer = this.cascadeContainer;
        var batchTopPosition = cache.batchPosition[batchIndex];
        var batchContainer = $("<div style='position: absolute; left: 0; top: " + batchTopPosition + "px;'></div>");
        cascadeContainer.append(batchContainer);
        cache.batchContainer[batchIndex] = batchContainer;
        
        if (isInitialAttach) {
          for (var index = batchStart; index <= batchEnd; ++index) {
            var minTopIndex = this.getMinTopIndex();
            var top = cache.coverTopPosition[minTopIndex];
            var left = cache.coverLeftPosition[minTopIndex];
            
            var params = cache.articleParams[index];
            params.top = top - batchTopPosition;
            params.left = left;
            
            var articleCover = $(this.coverTemplate(params));
            batchContainer.append(articleCover);
            var articleCoverHeight = articleCover.outerHeight();
            params.height = articleCoverHeight;
            
            var newTopPosition = cache.gapSize + top + articleCoverHeight;
            this.updateCoverPositionGenerator(newTopPosition, minTopIndex);          
          }
          
          var cascadeHeight = this.getCurrentCascadeHeight();
          cascadeContainer.css("height", cascadeHeight + "px");   // This will keep cascade container the same height even when old batch container is detached.
          cache.cascadeHeight = cascadeHeight;
          cache.scrollPercentage = GlobalVariable.Browser.Window.scrollTop() / GlobalVariable.Browser.Document.height();
          
          cache.batchProcessed[batchIndex] = true;
        } else {
          for (var index = batchStart; index <= batchEnd; ++index) {
            var articleCover = $(this.coverTemplate(cache.articleParams[index]));
            batchContainer.append(articleCover);
          }
        }
      }
    }
  },
  
  
  onWidthChange: function() {
    var cache = this.cache;
    
    if (this.readyForWidthChange) {   
      var maxWidth = this.$el.width();
      var newColumnCount = this.getColumnCount(maxWidth, cache.columnWidth, cache.gapSize, false);
      
      if (newColumnCount !== cache.columnCount) {
        cache.columnCount = newColumnCount;
        this.resetCoverPositionGenerator();      
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
            var params = cache.articleParams[index];
            params.top = top - heightOffset;
            params.left = cache.coverLeftPosition[minTopIndex];
            var newTopPosition = cache.gapSize + top + params.height;
            this.updateCoverPositionGenerator(newTopPosition, minTopIndex);
          }
                  
          cache.cascadeHeight = this.getCurrentCascadeHeight();
          ++batchIndex;
        };
        
        this.cascadeContainer.css("height", cache.cascadeHeight + "px");
        
        this.jumpToLastScrollPosition();
      }
    }
  },
  
  
  jumpToLastScrollPosition: function() {
    var cache = this.cache;
    
    cache.firstVisibleBatch = -1;
    cache.lastVisibleBatch = -1;
    
    var jumpToScrollTop = GlobalVariable.Browser.Document.height() * cache.scrollPercentage;
    cache.scrollTop = jumpToScrollTop;
    GlobalVariable.Browser.Window.scrollTop(jumpToScrollTop);
    if (jumpToScrollTop == 0) {
      this.handleScroll();
    }
  },
  
  
  handleScroll: function(event) {
    var cache = this.cache;
    
    var thisWindow = GlobalVariable.Browser.Window;
    var scrollTopPosition = thisWindow.scrollTop();
    var oldScrollTopPosition = cache.scrollTop;
    cache.scrollPercentage = scrollTopPosition / GlobalVariable.Browser.Document.height();
    cache.scrollTop = scrollTopPosition;
    
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
        // prevent loading the same contents more than once
        clearTimeout(this.loadArticleTimeout);
        this.loadArticleTimeout = setTimeout(this.loadArticles, 10);
      }
      lastBatch = cache.nextBatchToLoad - 1;
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
      if (scrollTopPosition !== oldScrollTopPosition) {
        var firstBatchNeedToBeRemoved = 0;
        var lastBatchNeedToBeRemoved = lastBatch;
        if (scrollTopPosition > oldScrollTopPosition) {   // scroll down
          lastBatchNeedToBeRemoved = firstOnBoardBatch - 1;
        } else if (scrollTopPosition < oldScrollTopPosition) {   // scroll up
          firstBatchNeedToBeRemoved = lastOnBoardBatch + 1;
        }
        for (var index = firstBatchNeedToBeRemoved; index <= lastBatchNeedToBeRemoved; ++index) {
          var batchContainer = cache.batchContainer[index];
          if (batchContainer) {
            batchContainer.detach();
            batchContainer.remove();
            cache.batchContainer[index] = false;
          }
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
