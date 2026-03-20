package i18n

var translations = map[string]map[string]string{
	"appointment_confirmed": {
		"en": "Your appointment has been confirmed",
		"ar": "تم تأكيد موعدك",
	},
	"appointment_cancelled": {
		"en": "Your appointment has been cancelled",
		"ar": "تم إلغاء موعدك",
	},
	"appointment_rescheduled": {
		"en": "Your appointment has been rescheduled",
		"ar": "تم إعادة جدولة موعدك",
	},
	"appointment_reminder": {
		"en": "Reminder: You have an appointment tomorrow",
		"ar": "تذكير: لديك موعد غداً",
	},
	"appointment_completed": {
		"en": "Your appointment has been marked as completed",
		"ar": "تم وضع علامة مكتمل على موعدك",
	},
	"invite_subject": {
		"en": "You have been invited to join",
		"ar": "لقد تمت دعوتك للانضمام",
	},
	"no_show": {
		"en": "You were marked as no-show for your appointment",
		"ar": "تم تسجيلك كغائب عن موعدك",
	},
}

func T(key, locale string) string {
	if msgs, ok := translations[key]; ok {
		if msg, ok := msgs[locale]; ok {
			return msg
		}
		if msg, ok := msgs["en"]; ok {
			return msg
		}
	}
	return key
}
