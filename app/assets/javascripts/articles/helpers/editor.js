// define the helper "Editor" 
Articles.Helpers.Editor = {
  toContentJSON: function() {
    var articleContent = [];
    $(".Article_Editor").each(function(index) {
      var paragraph = $(this).children(".Paragraph");
      var type = paragraph.data("type");
      var src = "";
      if (type === "text") {
        src = paragraph.val();
      } else if (type == "picture") {
        src = paragraph.html();
      }
      articleContent.push({
        "type": type,
        "src": src
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
