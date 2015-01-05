// define the view InCategory
View.Article.InCategory = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, "renderHelper");
    _.bindAll(this, "fetchFunction");
    
    this.categoryId = options.categoryId;
    this.sortBy = options.sortBy;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/in_category"],
  
  
  render:function() {
    GlobalVariable.Layout.LeftNav.FetchAllCategories({success: this.renderHelper});
    
    return this;
  },
  
  
  renderHelper: function() {
    var categoryId = this.categoryId;
    var categoryName = GlobalVariable.Article.AllCategories.get(categoryId).get("name");
    var headerSubTitle = "<a href='#/articles/category/" + categoryId + "' title = '" + categoryName + "'>" + categoryName + "</a>";
    GlobalVariable.Layout.Header.UpdateSubTitle(headerSubTitle);
    
    this.$el.html(this.template());
    
    this.viewArticleCascade = new View.Article.CoverCascade({fetchFunction: this.fetchFunction, sortBy: this.sortBy});
    this.viewArticleCascade.render();
  },
  
  
  fetchFunction: function(fetchSequenceNumber, articlesPerFetch, fetchOptions, callbacks) {
    var articles = new Collection.Article.InCategory({
      categoryId: this.categoryId,
      fetchSequenceNumber: fetchSequenceNumber,
      articlesPerFetch: articlesPerFetch,
      pageLoadTime: fetchOptions.pageLoadTime,
      sortBy: this.sortBy
    });
    articles.fetch(callbacks);
  },

  
  onWidthChange: function() {
    this.viewArticleCascade.onWidthChange();
  },
  
  
  remove: function() {   
    this.viewArticleCascade.remove();

    Backbone.View.prototype.remove.call(this);
  }
});
