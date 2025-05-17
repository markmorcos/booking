User.create!(
  email: 'mark.yehia@gmail.com',
  password: ENV['ADMIN_PASSWORD'],
  role: "admin",
  name: "Mark Morcos",
  confirmed_at: Time.current
) unless User.exists?(email: 'mark.yehia@gmail.com')
User.create!(
  email: 'youhanna_makin@yahoo.com',
  password: ENV['ADMIN_PASSWORD'],
  role: "admin",
  name: "Fr. Youhanna Makin",
  confirmed_at: Time.current
) unless User.exists?(email: 'youhanna_makin@yahoo.com')
