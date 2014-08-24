class CreateArticles < ActiveRecord::Migration
  def change
    create_table :articles do |t|
      t.string :cover_picture_url, default: ""
      t.integer :cover_picture_id, default: -1
      t.integer :cover_picture_height, default: 0
      t.string :title, default: ""
      t.string :author, default: ""
      t.string :category_name, default: ""
      t.text :content, limit: 2000000000
      t.integer :views, default: 0
      t.integer :like, default: 0
      t.integer :status, default: GlobalConstant::ArticleStatus::DRAFT
      t.references :user, index: true
      t.references :category, index: true

      t.timestamps
    end
    
    add_index :articles, :status
  end
end
