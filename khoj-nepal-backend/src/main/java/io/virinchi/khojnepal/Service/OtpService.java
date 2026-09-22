package io.virinchi.khojnepal.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final JavaMailSender jms;
    private final Random random = new Random();

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

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
        return entry.code.equals(code);
    }

    public void clear(String email, String purpose) {
        store.remove(email.toLowerCase() + ":" + purpose);
    }

    private void sendOtpEmail(String email, String code, String purpose) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (mailFrom != null && !mailFrom.isBlank()) message.setFrom(mailFrom);
            message.setTo(email);
            String subject;
            String body;
            if ("signup".equals(purpose)) {
                subject = "Khoj Nepal — Email Verification Code";
                body = "Namaste!\n\n"
                        + "Your Khoj Nepal verification code is:\n\n"
                        + "   " + code + "\n\n"
                        + "This code expires in 5 minutes.\n"
                        + "If you did not request this, please ignore this email.\n\n"
                        + "— Khoj Nepal Team";
            } else {
                subject = "Khoj Nepal — Password Reset Code";
                body = "Namaste!\n\n"
                        + "Your Khoj Nepal password reset code is:\n\n"
                        + "   " + code + "\n\n"
                        + "This code expires in 5 minutes.\n"
                        + "If you did not request this, please ignore this email.\n\n"
                        + "— Khoj Nepal Team";
            }
            message.setSubject(subject);
            message.setText(body);
            jms.send(message);
            System.out.println("OTP sent to " + email + " for " + purpose + ": " + code);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
        }
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
