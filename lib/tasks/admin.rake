namespace :admin do
  desc "Create an admin user"
  task create: :environment do
    email = ENV["EMAIL"]
    password = ENV["PASSWORD"]

    if email.blank? || password.blank?
      puts "Usage: rake admin:create EMAIL=admin@example.com PASSWORD=password"
      exit
    end

    user = User.find_by(email: email)

    if user
      user.skip_confirmation!
      user.update(admin: true)
      puts "User #{email} already exists and was given admin privileges"
    else
      user = User.new(email: email, password: password, password_confirmation: password, admin: true)
      user.skip_confirmation!

      if user.save
        puts "Admin user #{email} created successfully"
      else
        puts "Error creating admin user:"
        puts user.errors.full_messages.join("\n")
      end
    end
  end

  desc "List all admin users"
  task list: :environment do
    admins = User.where(admin: true)

    if admins.any?
      puts "Admin users:"
      admins.each do |admin|
        puts "- #{admin.email}"
      end
    else
      puts "No admin users found"
    end
  end
end
