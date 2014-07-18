class CreateArticles < ActiveRecord::Migration
  def change
    create_table :articles do |t|
      t.string :cover_picture_url, default: ""
      t.integer :cover_picture_id, default: nil
      t.string :title, default: ""
      t.string :author, default: ""
      t.string :category, default: ""
      t.text :content, limit: 2000000000
      t.integer :views, default: 0
      t.integer :like, default: 0
      t.boolean :published, default: false
      t.references :user, index: true

      t.timestamps
    end
    
    add_index :articles, :published
    add_index :articles, :category
  end
end
