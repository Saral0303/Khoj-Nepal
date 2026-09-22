package io.virinchi.khojnepal.Service;

import io.virinchi.khojnepal.Model.ActivityTbl;
import io.virinchi.khojnepal.Model.NotificationTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Repository.ActivityRepository;
import io.virinchi.khojnepal.Repository.NotificationRepository;
import io.virinchi.khojnepal.Repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository nRepo;
    private final ActivityRepository aRepo;
    private final UserRepository uRepo;

    public NotificationService(NotificationRepository nRepo, ActivityRepository aRepo,
                               UserRepository uRepo) {
        this.nRepo = nRepo;
        this.aRepo = aRepo;
        this.uRepo = uRepo;
    }

    public void addNotification(int ownerId, String key, String type, Integer points) {
        NotificationTbl n = new NotificationTbl();
        n.setOwnerId(ownerId);
        n.setReadFlag(false);
        n.setTimeLabel("Just now");
        n.setTimeNe("अहिले");
        n.setNotifKey(key);
        n.setType(type);
        n.setPoints(points);
        n.setCreatedAt(LocalDate.now().toString());
        nRepo.save(n);
    }

    public void addActivity(int ownerId, String key, String icon) {
        ActivityTbl a = new ActivityTbl();
        a.setOwnerId(ownerId);
        a.setTimeLabel("Just now");
        a.setTimeNe("अहिले");
        a.setIcon(icon);
        a.setActivityKey(key);
        a.setCreatedAt(LocalDate.now().toString());
        aRepo.save(a);
    }

    public Page<NotificationTbl> getUserNotifications(int userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return nRepo.findByOwnerId(userId, pageable);
    }

    public List<NotificationTbl> getUserNotifications(int userId) {
        return nRepo.findByOwnerIdOrderByIdDesc(userId);
    }

    public void markAllAsRead(int userId) {
        List<NotificationTbl> list = nRepo.findByOwnerIdOrderByIdDesc(userId);
        for (NotificationTbl n : list) {
            n.setReadFlag(true);
        }
        nRepo.saveAll(list);
    }

    public Page<ActivityTbl> getUserActivity(int userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return aRepo.findByOwnerId(userId, pageable);
    }

    public List<ActivityTbl> getUserActivity(int userId) {
        return aRepo.findByOwnerIdOrderByIdDesc(userId);
    }
}
