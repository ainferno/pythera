package service

import (
	"fmt"
	"log/slog"
	"net/smtp"
	"time"

	"therapy-backend/internal/models"
)

type MailService struct {
	host, user, pass, from string
	port                   int
	tz                     *time.Location
	enabled                bool
}

func NewMailService(host string, port int, user, pass, from string, tz *time.Location) *MailService {
	return &MailService{
		host: host, port: port, user: user, pass: pass, from: from, tz: tz,
		enabled: host != "" && from != "",
	}
}

func (m *MailService) send(to, subject, body string) error {
	if !m.enabled {
		slog.Warn("smtp not configured; skipping email", "to", to, "subject", subject)
		return nil
	}
	auth := smtp.PlainAuth("", m.user, m.pass, m.host)
	msg := []byte("From: " + m.from + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=\"UTF-8\"\r\n\r\n" +
		body)
	addr := fmt.Sprintf("%s:%d", m.host, m.port)
	return smtp.SendMail(addr, auth, m.user, []string{to}, msg)
}

func (m *MailService) NotifyAdminNewBooking(adminEmail string, client *models.User, b *models.Booking) {
	when := b.SlotStart.In(m.tz).Format("02.01.2006 15:04")
	body := fmt.Sprintf(
		"Новая заявка на запись.\n\nКлиент: %s <%s>\nВремя: %s\n\nДля подтверждения откройте админ-панель.",
		client.FullName, client.Email, when)
	if err := m.send(adminEmail, "Новая заявка на приём", body); err != nil {
		slog.Error("send admin mail", "err", err)
	}
}

func (m *MailService) NotifyClientBookingConfirmed(client *models.User, b *models.Booking) {
	when := b.SlotStart.In(m.tz).Format("02.01.2006 15:04")
	body := fmt.Sprintf(
		"Здравствуйте, %s!\n\nВаша запись подтверждена на %s.\n\nДо встречи!",
		client.FullName, when)
	if err := m.send(client.Email, "Запись подтверждена", body); err != nil {
		slog.Error("send client mail", "err", err)
	}
}
