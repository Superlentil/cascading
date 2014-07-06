// define the helper "Editor" 
Articles.Helpers.Editor = {
  toContentJSON: function() {
    var articleContent = [];
    $(".Article_Editor").each(function(index) {
      var paragraph = $(this).children(".Paragraph");
      articleContent.push({
        "type": paragraph.data("type"),
        "src": paragraph.val()
      });
    });
    return JSON.stringify(articleContent);
  },
  
  
  toContentHTML: function(articleContentJSON) {
    var articleContent = JSON.parse(articleContentJSON);
    var articleHtml = "<div>";
    $.each(articleContent, function(index, articleParagraph) {
      articleHtml += "<p><em>" + articleParagraph.type + ":</em>" + articleParagraph.src + "</p>";
    });
    articleHtml += "</div>";
    return articleHtml;
  }
};
