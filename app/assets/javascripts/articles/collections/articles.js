Articles.Collections.Articles = Backbone.Collection.extend({
  initialize: function() {
    this.batch = 0;
  },
  
  
  model: Articles.Models.Article,
  
  
  url: function() {
    return "/articles/?" + $.param({batch: this.batch});
  },
  
  
  fetchBatch: function(batch, options) {
    if (batch) {
      this.batch = batch;
    } else {
      this.batch = 0;
    }
    
    this.fetch(options);
  }
});