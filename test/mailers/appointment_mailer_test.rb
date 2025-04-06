require "test_helper"

class AppointmentMailerTest < ActionMailer::TestCase
  test "pending_email" do
    appointment = appointments(:pending_appointment)
    email = AppointmentMailer.pending_email(appointment)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal I18n.t("appointment_mailer.pending_email.subject"), email.subject
    assert_equal [ appointment.booking_email ], email.to
    assert_match appointment.booking_name, email.body.encoded
  end

  test "confirmation_email" do
    appointment = appointments(:confirmed_appointment)
    email = AppointmentMailer.confirmation_email(appointment)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal I18n.t("appointment_mailer.confirmation_email.subject"), email.subject
    assert_equal [ appointment.booking_email ], email.to
    assert_match appointment.booking_name, email.body.encoded
  end

  test "cancellation_email" do
    appointment = appointments(:cancelled_appointment)
    email = AppointmentMailer.cancellation_email(appointment)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal I18n.t("appointment_mailer.cancellation_email.subject"), email.subject
    assert_equal [ appointment.booking_email ], email.to
    assert_match appointment.booking_name, email.body.encoded
  end

  test "completion_email" do
    appointment = appointments(:completed_appointment)
    email = AppointmentMailer.completion_email(appointment)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal I18n.t("appointment_mailer.completion_email.subject"), email.subject
    assert_equal [ appointment.booking_email ], email.to
    assert_match appointment.booking_name, email.body.encoded
  end

  test "no_show_email" do
    appointment = appointments(:confirmed_appointment) # Use confirmed since we don't have a no_show fixture
    email = AppointmentMailer.no_show_email(appointment)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal I18n.t("appointment_mailer.no_show_email.subject"), email.subject
    assert_equal [ appointment.booking_email ], email.to
    assert_match appointment.booking_name, email.body.encoded
  end
end
