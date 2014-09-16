class Picture < ActiveRecord::Base
  belongs_to :article
  
  
  has_attached_file :src, :styles => { :medium => "600>", :thumb => "250" }, 
    :default_url => "/images/:style/missing.png",
    :path => ":rails_root/public/system/:class/:attachment/:id_partition/:style/:id.:extension",
    :url => "/system/:class/:attachment/:id_partition/:style/:id.:extension"
    
  validates_attachment_content_type :src, :content_type => /\Aimage\/.*\Z/
end
