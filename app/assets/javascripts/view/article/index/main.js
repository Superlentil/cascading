// define the view "Index.Main"
View.Article.Index.Main = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "handleScroll");
    _.bindAll(this, "onResize");
    
    $(window).on("scroll", this.handleScroll);
    
    this.articlesPerBatch = 8;
    
    this.allSubviews = [];
  },
  
  
  resetCascadeContainer: function() {
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

    this.batch = 0;
    this.readyToLoad = true;
    this.moreToLoad = true;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/index/main"],
  
  
  render: function() {
    var that = this;
    
    that.$el.html(that.template());
    
    that.maxWidth = that.$el.width();
    that.resetCascadeContainer();

    $("#article-index-cascade-container").css("width", that.actualWidth + "px");
    
    that.loadArticles();
    
    $(window).on("resize", function() {
      clearTimeout(that.resizeTimeout);
      that.resizeTimeout = setTimeout(that.onResize,200);
    });
    
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
            var viewArticleCover = new View.Article.Index.Cover({article: article});
            that.allSubviews.push(viewArticleCover);   // prevent view memory leak
            that.getMinHorizontalIndex();
            var hCoordinate = that.hPosition[that.minHorizontalIndex];
            var vCoordinate = that.vPosition[that.minHorizontalIndex];
            cascadeContainer.append(viewArticleCover.render(hCoordinate, vCoordinate).$el);
            var coverHeight = viewArticleCover.$el.children("div.article_information").height() + article.get("cover_picture_height") + 32.0;
            var newHorizontalCoordinate = 8.0 + hCoordinate + coverHeight;
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
    if (thisWindow.scrollTop() + thisWindow.height() + 500 > $(document).height()) {
      if (this.readyToLoad && this.moreToLoad) {
        this.readyToLoad = false;
        this.loadArticles();
      }
    }
  },
  
  
  events: {
    "click #click_to_load": "loadArticles"
  },
  
  
  onResize: function() {
    this.maxWidth = this.$el.width();
    
    if (Math.floor(this.maxWidth / this.columnWidth) !== this.columnCount) {
      var that = this;
      
      that.$el.html(that.template());
      that.resetCascadeContainer();
      $("#article-index-cascade-container").css("width", that.actualWidth + "px");
      that.loadArticles();
    }
  },
  
  
  remove: function() {
    var subview;
    while (this.allSubviews.length > 0) {
      subview = this.allSubviews.pop();
      if (subview) {
        subview.remove();
      }
    }
    
    $(window).off("scroll");
    
    Backbone.View.prototype.remove.call(this);
  }
});
