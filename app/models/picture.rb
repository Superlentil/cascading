class Picture < ActiveRecord::Base
  belongs_to :article
  
  
  has_attached_file :src, :styles => { :medium => "600>", :thumb => "200" }, :default_url => "/images/:style/missing.png"
  validates_attachment_content_type :src, :content_type => /\Aimage\/.*\Z/
end
