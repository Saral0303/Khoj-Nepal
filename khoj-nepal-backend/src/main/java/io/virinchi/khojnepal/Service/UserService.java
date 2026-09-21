package io.virinchi.khojnepal.Service;

import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository uRepo;
    private final NotificationService notificationService;

    public UserTbl register(String fullName, String username, String email,
                            String mobile, String password, String dateOfBirth,
                            String gender, String province, String district,
                            String city, String profilePicture) {
        UserTbl user = new UserTbl();
        user.setFullName(fullName);
        user.setUsername(username);
        user.setDateOfBirth(dateOfBirth);
        user.setGender(gender);
        user.setMobile(mobile);
        user.setEmail(email);
        user.setProvince(province);
        user.setDistrict(district);
        user.setCity(city);
        user.setPassword(DigestUtils.md5DigestAsHex(password.getBytes()));
        user.setProfilePicture(profilePicture);
        user.setRole("user");
        user.setKycStatus("none");
        user.setPoints(0);
        user.setItemsReported(0);
        user.setItemsReturned(0);
        user.setMemberSince(LocalDate.now().toString());
        uRepo.save(user);

        notificationService.addActivity(user.getId(), "registered", "user");
        notificationService.addNotification(user.getId(), "welcome", "info", null);
        return user;
    }

    public Optional<UserTbl> login(String identifier, String password) {
        String hash = DigestUtils.md5DigestAsHex(password.getBytes());
        return findByIdentifierAndPassword(identifier, hash);
    }

    public Optional<UserTbl> adminLogin(String identifier, String password) {
        Optional<UserTbl> found = login(identifier, password);
        if (found.isPresent() && !"admin".equalsIgnoreCase(found.get().getRole())) {
            return Optional.empty();
        }
        return found;
    }

    public Optional<UserTbl> findByIdentifier(String identifier) {
        Optional<UserTbl> byEmail = uRepo.findByEmail(identifier);
        if (byEmail.isPresent()) return byEmail;
        Optional<UserTbl> byMobile = uRepo.findByMobile(identifier);
        if (byMobile.isPresent()) return byMobile;
        return uRepo.findByUsername(identifier);
    }

    public Optional<UserTbl> findById(int id) {
        return uRepo.findById(id);
    }

    public Optional<UserTbl> findByEmail(String email) {
        return uRepo.findByEmail(email);
    }

    public UserTbl updateProfile(UserTbl user, Map<String, String> updates) {
        if (updates.containsKey("fullName")) user.setFullName(updates.get("fullName"));
        if (updates.containsKey("dateOfBirth")) user.setDateOfBirth(updates.get("dateOfBirth"));
        if (updates.containsKey("gender")) user.setGender(updates.get("gender"));
        if (updates.containsKey("mobile")) user.setMobile(updates.get("mobile"));
        if (updates.containsKey("email")) user.setEmail(updates.get("email"));
        if (updates.containsKey("province")) user.setProvince(updates.get("province"));
        if (updates.containsKey("district")) user.setDistrict(updates.get("district"));
        if (updates.containsKey("city")) user.setCity(updates.get("city"));
        if (updates.containsKey("profilePicture")) user.setProfilePicture(updates.get("profilePicture"));
        uRepo.save(user);
        return user;
    }

    public boolean resetPassword(String identifier, String newPassword) {
        Optional<UserTbl> found = findByIdentifier(identifier);
        if (found.isEmpty()) return false;
        UserTbl user = found.get();
        user.setPassword(DigestUtils.md5DigestAsHex(newPassword.getBytes()));
        uRepo.save(user);
        return true;
    }

    public boolean changePassword(UserTbl user, String currentPassword, String newPassword) {
        String currentHash = DigestUtils.md5DigestAsHex(currentPassword.getBytes());
        if (!currentHash.equals(user.getPassword())) return false;
        user.setPassword(DigestUtils.md5DigestAsHex(newPassword.getBytes()));
        uRepo.save(user);
        return true;
    }

    public Map<String, Object> getRewards(UserTbl user) {
        int points = user.getPoints();
        String level;
        if (points >= 500) level = "hero";
        else if (points >= 250) level = "gold";
        else if (points >= 100) level = "silver";
        else level = "bronze";

        Map<String, Object> map = new HashMap<>();
        map.put("points", points);
        map.put("level", level);
        map.put("itemsReported", user.getItemsReported());
        map.put("itemsReturned", user.getItemsReturned());
        return map;
    }

    public boolean existsByUsername(String username) {
        return uRepo.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return uRepo.existsByEmail(email);
    }

    public boolean existsByMobile(String mobile) {
        return uRepo.existsByMobile(mobile);
    }

    public Map<String, Object> safeUser(UserTbl user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("fullName", user.getFullName());
        map.put("username", user.getUsername());
        map.put("dateOfBirth", user.getDateOfBirth());
        map.put("gender", user.getGender());
        map.put("mobile", user.getMobile());
        map.put("email", user.getEmail());
        map.put("province", user.getProvince());
        map.put("district", user.getDistrict());
        map.put("city", user.getCity());
        map.put("profilePicture", user.getProfilePicture());
        map.put("role", user.getRole());
        map.put("kycStatus", user.getKycStatus());
        map.put("points", user.getPoints());
        map.put("itemsReported", user.getItemsReported());
        map.put("itemsReturned", user.getItemsReturned());
        map.put("memberSince", user.getMemberSince());
        return map;
    }

    public UserTbl incrementItemsReported(UserTbl user) {
        user.setItemsReported(user.getItemsReported() + 1);
        return uRepo.save(user);
    }

    public UserTbl submitKyc(UserTbl user, String kycFront, String kycBack) {
        user.setKycFront(kycFront);
        user.setKycBack(kycBack);
        user.setKycStatus("pending");
        user.setKycSubmittedAt(java.time.LocalDateTime.now().toString());
        uRepo.save(user);
        notificationService.addNotification(user.getId(), "kyc_submitted", "kyc", null);
        return user;
    }

    public UserTbl approveUserKyc(UserTbl user) {
        user.setKycStatus("verified");
        uRepo.save(user);
        notificationService.addNotification(user.getId(), "kyc_verified", "kyc", null);
        return user;
    }

    public UserTbl rejectUserKyc(UserTbl user) {
        user.setKycStatus("rejected");
        uRepo.save(user);
        notificationService.addNotification(user.getId(), "kyc_rejected", "kyc", null);
        return user;
    }

    public boolean isKycVerified(UserTbl user) {
        return "verified".equalsIgnoreCase(user.getKycStatus());
    }

    private Optional<UserTbl> findByIdentifierAndPassword(String identifier, String hash) {
        Optional<UserTbl> byEmail = uRepo.findByEmailAndPassword(identifier, hash);
        if (byEmail.isPresent()) return byEmail;
        Optional<UserTbl> byMobile = uRepo.findByMobileAndPassword(identifier, hash);
        if (byMobile.isPresent()) return byMobile;
        return uRepo.findByUsernameAndPassword(identifier, hash);
    }
}
