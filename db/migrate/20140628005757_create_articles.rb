class CreateArticles < ActiveRecord::Migration
  def change
    create_table :articles do |t|
      t.string :title
      t.string :author
      t.text :content, limit: 2000000000
      t.references :user, index: true

      t.timestamps
    end
  end
end
