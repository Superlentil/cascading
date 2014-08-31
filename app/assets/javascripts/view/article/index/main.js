// define the view "Index.Main"
View.Article.Index.Main = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "handleScroll");
    
    $(window).on("scroll", this.handleScroll);
    
    this.articlesPerBatch = 50;
    
    this.batch = 0;
    this.readyToLoad = true;
    this.moreToLoad = true;
  },
  
  
  resetCascade: function() {
    this.maxWidth = this.$el.width();
    this.columnWidth = 240;
    this.columnCount = Math.floor(this.maxWidth / this.columnWidth);
    if (this.columnCount < 1) {
      this.columnCount = 1;
    } else if (this.columnCount > 5) {
      this.columnCount = 5;
    }
    this.actualWidth = this.columnCount * this.columnWidth;
    
    this.hPosition = [];
    this.vPosition = [];
    for (var index = 0; index < this.columnCount; ++index) {
      this.hPosition.push(0.0);
      this.vPosition.push(this.columnWidth * index);
    }
    this.minHorizontalIndex = 0.0;
  },
  
  
  el: "#layout-content",
  
  
  mainTemplate: JST["template/article/index/main"],
  coverTemplate: JST["template/article/index/cover"],
  
  
  render: function() {
    var that = this;
    
    that.$el.html(that.mainTemplate());
    
    that.maxWidth = that.$el.width();
    that.resetCascade();

    $("#article-index-cascade-container").css("width", that.actualWidth + "px");
    
    that.loadArticles();
       
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
  
  
  getCascadeContainerHeight: function() {
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
          
          _.each(fetchedArticles, function(article) {          
            that.getMinHorizontalIndex();
            var hCoordinate = that.hPosition[that.minHorizontalIndex];
            var vCoordinate = that.vPosition[that.minHorizontalIndex];
            
            var articleCover = $("<div class='article-index-cover' style='top: " + hCoordinate + "px; left: " + vCoordinate + "px;'></div>");
            articleCover.html(that.coverTemplate({article: article}));
            cascadeContainer.append(articleCover);
            
            var articleCoverHeight = articleCover.outerHeight();
            articleCover.attr("data-height", articleCoverHeight);
            var newHorizontalCoordinate = 8.0 + hCoordinate + articleCoverHeight;
            that.insertNewCoordinate(newHorizontalCoordinate, vCoordinate);
            
            if (newHorizontalCoordinate > cascadeContainer.height()) {
              cascadeContainer.css({"height": newHorizontalCoordinate + "px"});
            }
          });
                    
          ++that.batch;
          that.readyToLoad = true;
          if (fetchedArticles.length < that.articlesPerBatch) {
            that.moreToLoad = false;
          }
        }
      });
    }
  },
   
  
  handleScroll: function(event) {
    var thisWindow = $(window);
    var scrollTopPosition = thisWindow.scrollTop();
    var documentHeight = $(document).height();
    
    this.scrollPercentage = scrollTopPosition / documentHeight;
    
    if (scrollTopPosition + thisWindow.height() + 500 > documentHeight) {
      if (this.readyToLoad && this.moreToLoad) {
        this.readyToLoad = false;
        this.loadArticles();
      }
    }
  },
  
  
  events: {
    "click #click_to_load": "loadArticles"
  },
  
  
  onResize: function(event) {
    this.maxWidth = this.$el.width();
    
    if (Math.floor(this.maxWidth / this.columnWidth) !== this.columnCount) {
      var that = this;
           
      var oldCascadeContainer = $("#article-index-cascade-container");
      oldCascadeContainer.detach();
      that.resetCascade();
      
      var newCascadeContainer = $("<div id='article-index-cascade-container' style='width: " + this.columnWidth * this.columnCount + "px;'></div>");
      
      oldCascadeContainer.children().each(function(index, articleCover) {
        that.getMinHorizontalIndex();
        var hCoordinate = that.hPosition[that.minHorizontalIndex];
        var vCoordinate = that.vPosition[that.minHorizontalIndex];
        
        var jqueryArticleCover = $(articleCover);
        jqueryArticleCover.css({"top": hCoordinate + "px", "left": vCoordinate + "px"});
        newCascadeContainer.append(jqueryArticleCover);
        
        var newHorizontalCoordinate = 8.0 + hCoordinate + parseInt(jqueryArticleCover.attr("data-height"));
        that.insertNewCoordinate(newHorizontalCoordinate, vCoordinate);
        
        if (newHorizontalCoordinate > newCascadeContainer.height()) {
          newCascadeContainer.css({"height": newHorizontalCoordinate + "px"});
        }
      });
      
      that.$el.prepend(newCascadeContainer);
      $(window).scrollTop($(document).height() * that.scrollPercentage);      
      oldCascadeContainer.remove();
    }
  },
  
  
  remove: function() {   
    $(window).off("scroll");
    
    Backbone.View.prototype.remove.call(this);
  }
});
