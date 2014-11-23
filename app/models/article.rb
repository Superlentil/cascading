class Article < ActiveRecord::Base
  include ActionView::Helpers::SanitizeHelper
  
  
  belongs_to :user
  has_many :pictures, dependent: :destroy
  has_many :comments, dependent: :destroy
  
  
  searchable do
    text :title, :stored=>true
    text :author, :stored=>true
    text :category_name, :stored=>true
    
    text :content do
      strip_tags(content)
    end
  end
end
