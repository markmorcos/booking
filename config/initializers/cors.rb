# config/initializers/cors.rb
# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin API requests.

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'

    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ['Authorization', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
  end
end 