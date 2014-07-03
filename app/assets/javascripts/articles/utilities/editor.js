Article.Utility.Editor = {
  toContentJSON: function() {
    var articleContent = [];
    $(".Article_Paragraph_Editor").each(function(index) {
      var paragraph = $(this).children(".Paragraph");
      articleContent.push({
        "type": paragraph.data("type"),
        "source": paragraph.val()
      });
    });
    return JSON.stringify(articleContent);
  },
  
  
  toContentHTML: function(articleContentJSON) {
    var articleContent = JSON.parse(articleContentJSON);
    var articleHtml = "<div>";
    $.each(articleContent, function(index, articleParagraph) {
      articleHtml += "<p><em>" + articleParagraph.type + ":</em>" + articleParagraph.source + "</p>";
    });
    articleHtml += "</div>";
    return articleHtml;
  }
};
