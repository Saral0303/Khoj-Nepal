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
            String body;
            if ("signup".equals(purpose)) {
                subject = "Khoj Nepal \u2014 Email Verification Code";
                body = "Namaste!\n\n"
                        + "Your Khoj Nepal verification code is:\n\n"
                        + "   " + code + "\n\n"
                        + "This code expires in 5 minutes.\n"
                        + "If you did not request this, please ignore this email.\n\n"
                        + "\u2014 Khoj Nepal Team";
            } else {
                subject = "Khoj Nepal \u2014 Password Reset Code";
                body = "Namaste!\n\n"
                        + "Your Khoj Nepal password reset code is:\n\n"
                        + "   " + code + "\n\n"
                        + "This code expires in 5 minutes.\n"
                        + "If you did not request this, please ignore this email.\n\n"
                        + "\u2014 Khoj Nepal Team";
            }

            MimeMessage message = jms.createMimeMessage();
            message.setFrom(new InternetAddress(mailFrom));
            message.setRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(email));
            message.setSubject(subject, "UTF-8");
            message.setText(body, "UTF-8");
            jms.send(message);

            log.info("OTP sent to {} for {}: {}", email, purpose, code);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", email, e.getMessage(), e);
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
