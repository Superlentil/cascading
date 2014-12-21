class Article < ActiveRecord::Base
  include ActionView::Helpers::SanitizeHelper
  
  
  belongs_to :user
  has_many :pictures, dependent: :destroy
  has_many :comments, dependent: :destroy
  
  
  searchable do
    text :title, :stored=>true
    text :author, :stored=>true
    text :category_name, :stored=>true
    
    text :content, :stored=>true do
      contentJson = JSON.parse(content)
      content.clear
      contentJson.each do |paragraph|
        if paragraph["type"] == "text"
          content << strip_tags(paragraph["src"]) 
        end
      end
      content << ""
    end
    
    integer :id
    integer :status
    time :publish_time
  end
end
