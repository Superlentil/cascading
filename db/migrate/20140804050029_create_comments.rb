class CreateComments < ActiveRecord::Migration
  def change
    create_table :comments do |t|
      t.text :content, limit: 2000000000
      t.integer :user_id
      t.string :user_nickname
      t.string :user_avatar_url
      t.references :article, index: true

      t.timestamps
    end
  end
end
