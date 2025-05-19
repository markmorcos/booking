require "httparty"

class WhatsappService
  include HTTParty

  BASE_URL = "https://graph.facebook.com/v22.0".freeze
  TEMPLATE_NAME = "event_notification".freeze

  class << self
    def send_event_notification(appointment, type)
      new.send_event_notification(appointment, type)
    end
  end

  def send_event_notification(appointment, type)
    @type = type

    return false unless appointment.user.phone.present?

    puts(build_payload(appointment).to_json)

    response = HTTParty.post(
      "#{BASE_URL}/623841200818115/messages",
      headers: request_headers,
      body: build_payload(appointment).to_json,
    )

    handle_response(response)
  rescue HTTParty::Error => e
    Rails.logger.error("WhatsApp HTTP Error: #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
    false
  rescue StandardError => e
    Rails.logger.error("WhatsApp API Error: #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
    false
  end

  private

  def request_headers
    {
      "Authorization" => "Bearer #{access_token}",
      "Content-Type" => "application/json"
    }
  end

  def whatsapp_language_code
    {
      en: "en",
      ar: "ar"
    }[I18n.locale.to_sym] || "en"
  end


  def build_payload(appointment)
    {
      messaging_product: "whatsapp",
      to: format_phone_number(appointment.user.phone),
      type: "template",
      template: {
        name: TEMPLATE_NAME,
        language: { code: whatsapp_language_code },
        components: [
          {
            type: "header",
            parameters: [
              { type: "text", parameter_name: "event_type", text: format_translation("title") }
            ]
          },
          {
            type: "body",
            parameters: [
              { type: "text", parameter_name: "booking_name", text: appointment.user.name },
              { type: "text", parameter_name: "message_content", text: format_translation("message") },
              { type: "text", parameter_name: "event_date", text: format_date(appointment.availability_slot.starts_at) },
              { type: "text", parameter_name: "event_time", text: format_time(appointment.availability_slot.starts_at, appointment.availability_slot.ends_at) }
            ]
          }
        ]
      }
    }
  end

  def format_phone_number(phone)
    return nil unless phone.present?
    phone.gsub(/\D/, "")
  end

  def format_translation(key)
    I18n.t("appointment_mailer.#{@type}.#{key}", locale: I18n.locale)
  end

  def format_date(date)
    I18n.l(date.to_date, format: :long, locale: I18n.locale)
  end

  def format_time(starts_at, ends_at)
    "#{I18n.l(starts_at, format: :default, locale: I18n.locale)} - #{I18n.l(ends_at, format: :default, locale: I18n.locale)}"
  end

  def handle_response(response)
    if response.success?
      Rails.logger.info("WhatsApp message sent successfully: #{response.body}")
      true
    else
      error_message = begin
        JSON.parse(response.body)["error"]["message"]
      rescue JSON::ParserError, NoMethodError
        response.body
      end

      Rails.logger.error("WhatsApp API Error: #{response.code} - #{error_message}")
      Rails.logger.error("Request payload: #{response.request.options[:body]}")
      false
    end
  end

  def access_token
    ENV["WHATSAPP_ACCESS_TOKEN"]
  end
end
