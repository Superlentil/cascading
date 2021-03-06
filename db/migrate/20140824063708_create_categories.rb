class CreateCategories < ActiveRecord::Migration
  def change
    create_table :categories do |t|
      t.string :name
      t.integer :group, default: GlobalConstant::Article::CategoryType::CUSTOMIZED
      t.string :description, default: ""
      t.integer :article_count, default: 0
      t.attachment :cover_picture

      t.timestamps
    end
    add_index :categories, :name, unique: true
    add_index :categories, :group
    add_index :categories, :article_count
  end
end
