class CreateCategories < ActiveRecord::Migration
  def change
    create_table :categories do |t|
      t.string :name
      t.integer :group, default: GlobalConstant::ArticleCategoryType::CUSTOMIZED_GENERAL
      t.string :description, default: ""
      t.integer :article_count, default: 0

      t.timestamps
    end
    add_index :categories, :name, unique: true
    add_index :categories, :group
  end
end
