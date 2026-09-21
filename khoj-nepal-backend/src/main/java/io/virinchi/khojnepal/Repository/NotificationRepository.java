package io.virinchi.khojnepal.Repository;

import io.virinchi.khojnepal.Model.NotificationTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationTbl, Integer> {

    List<NotificationTbl> findByOwnerIdOrderByIdDesc(int ownerId);

    List<NotificationTbl> findByOwnerOrderByIdDesc(UserTbl owner);

    Page<NotificationTbl> findByOwnerId(int ownerId, Pageable pageable);
}
