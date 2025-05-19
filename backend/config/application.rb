require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module Booking
  class Application < Rails::Application
    config.load_defaults 8.0

    config.autoload_lib(ignore: %w[assets tasks])

    config.time_zone = "Europe/Berlin"
    config.active_record.default_timezone = :local
  end
end
