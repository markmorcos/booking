require "test_helper"

class AppointmentMailerTest < ActionMailer::TestCase
  test "pending_email" do
    appointment = appointments(:pending_appointment)
    email = AppointmentMailer.status_email(appointment)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [ appointment.user.email ], email.to
    assert_equal I18n.t("appointment_mailer.pending.subject"), email.subject
  end

  test "confirmation_email" do
    appointment = appointments(:confirmed_appointment)
    email = AppointmentMailer.status_email(appointment)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [ appointment.user.email ], email.to
    assert_equal I18n.t("appointment_mailer.confirmed.subject"), email.subject
  end

  test "cancellation_email" do
    appointment = appointments(:cancelled_appointment)
    email = AppointmentMailer.status_email(appointment)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [ appointment.user.email ], email.to
    assert_equal I18n.t("appointment_mailer.cancelled.subject"), email.subject
  end

  test "completion_email" do
    appointment = appointments(:completed_appointment)
    email = AppointmentMailer.status_email(appointment)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [ appointment.user.email ], email.to
    assert_equal I18n.t("appointment_mailer.completed.subject"), email.subject
  end

  test "no_show_email" do
    appointment = appointments(:no_show_appointment)
    email = AppointmentMailer.status_email(appointment)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal [ appointment.user.email ], email.to
    assert_equal I18n.t("appointment_mailer.no_show.subject"), email.subject
  end
end
