class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :email
      t.string :password_hash
      t.string :nickname, limit: 50
      t.references :tier, index: true

      t.timestamps
    end
    add_index :users, :email
  end
end
