package io.virinchi.khojnepal.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private final JavaMailSender jms;
    private final Random random = new Random();

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();
    private final Set<String> verifiedEmails = ConcurrentHashMap.newKeySet();

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public OtpService(JavaMailSender jms) {
        this.jms = jms;
    }

    public String generateAndSend(String email, String purpose) {
        String code = String.format("%06d", random.nextInt(1000000));
        long expiresAt = System.currentTimeMillis() + 5 * 60 * 1000;
        store.put(email.toLowerCase() + ":" + purpose, new OtpEntry(code, expiresAt));
        sendOtpEmail(email, code, purpose);
        return code;
    }

    public boolean verify(String email, String purpose, String code) {
        String key = email.toLowerCase() + ":" + purpose;
        OtpEntry entry = store.remove(key);
        if (entry == null) return false;
        if (System.currentTimeMillis() > entry.expiresAt) return false;
        boolean ok = entry.code.equals(code);
        if (ok && "signup".equals(purpose)) {
            verifiedEmails.add(email.toLowerCase());
        }
        return ok;
    }

    public boolean isEmailVerified(String email) {
        return verifiedEmails.contains(email.toLowerCase());
    }

    public void clearVerification(String email) {
        verifiedEmails.remove(email.toLowerCase());
    }

    public void clear(String email, String purpose) {
        store.remove(email.toLowerCase() + ":" + purpose);
    }

    private void sendOtpEmail(String email, String code, String purpose) {
        try {
            String subject;
            String htmlBody;
            String textBody;
            if ("signup".equals(purpose)) {
                subject = "Khoj Nepal - Email Verification Code";
                textBody = "Namaste!\n\n"
                        + "Your Khoj Nepal verification code is: " + code + "\n\n"
                        + "This code expires in 5 minutes.\n"
                        + "If you did not request this, please ignore this email.\n\n"
                        + "Khoj Nepal Team";
                htmlBody = buildOtpHtml(code, "Email Verification", "Use this code to verify your email address on Khoj Nepal.");
            } else {
                subject = "Khoj Nepal - Password Reset Code";
                textBody = "Namaste!\n\n"
                        + "Your Khoj Nepal password reset code is: " + code + "\n\n"
                        + "This code expires in 5 minutes.\n"
                        + "If you did not request this, please ignore this email.\n\n"
                        + "Khoj Nepal Team";
                htmlBody = buildOtpHtml(code, "Password Reset", "Use this code to reset your password on Khoj Nepal.");
            }

            MimeMessage message = jms.createMimeMessage();
            message.setFrom(new InternetAddress(mailFrom, "Khoj Nepal"));
            message.setReplyTo(InternetAddress.parse(mailFrom));
            message.setRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(email));
            message.setSubject(subject, "UTF-8");
            message.setHeader("X-Mailer", "KhojNepal");
            message.setHeader("Precedence", "bulk");
            message.setHeader("X-Auto-Response-Suppress", "All");
            message.setText(textBody, "UTF-8");
            message.setContent(htmlBody, "text/html; charset=UTF-8");

            jms.send(message);
            log.info("OTP sent to {} for {}: {}", email, purpose, code);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", email, e.getMessage(), e);
        }
    }

    private String buildOtpHtml(String code, String title, String subtitle) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
                + "<body style='margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;'>"
                + "<div style='max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);'>"
                + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px;text-align:center;'>"
                + "<h1 style='color:#ffffff;margin:0;font-size:24px;'><span style='color:#ffffff;'>Khoj</span> <span style='color:#94a3b8;'>Nepal</span></h1>"
                + "</div>"
                + "<div style='padding:32px;text-align:center;'>"
                + "<h2 style='color:#1a1a2e;margin:0 0 8px;font-size:20px;'>" + title + "</h2>"
                + "<p style='color:#64748b;margin:0 0 24px;font-size:14px;'>" + subtitle + "</p>"
                + "<div style='background:#f8fafc;border:2px dashed #cbd5e1;border-radius:8px;padding:20px;margin:0 0 24px;'>"
                + "<p style='color:#94a3b8;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:2px;'>Your verification code</p>"
                + "<p style='color:#1a1a2e;margin:0;font-size:36px;font-weight:bold;letter-spacing:8px;'>" + code + "</p>"
                + "</div>"
                + "<p style='color:#94a3b8;margin:0;font-size:12px;'>This code expires in 5 minutes.</p>"
                + "</div>"
                + "<div style='background:#f8fafc;padding:16px;text-align:center;'>"
                + "<p style='color:#94a3b8;margin:0;font-size:11px;'>If you did not request this, please ignore this email.</p>"
                + "</div></div></body></html>";
    }

    private static class OtpEntry {
        final String code;
        final long expiresAt;
        OtpEntry(String code, long expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }
}
