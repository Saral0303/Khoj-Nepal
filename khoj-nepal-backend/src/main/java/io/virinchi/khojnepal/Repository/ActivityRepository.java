package io.virinchi.khojnepal.Repository;

import io.virinchi.khojnepal.Model.ActivityTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<ActivityTbl, Integer> {

    List<ActivityTbl> findByOwnerIdOrderByIdDesc(int ownerId);

    List<ActivityTbl> findByOwnerOrderByIdDesc(UserTbl owner);

    Page<ActivityTbl> findByOwnerId(int ownerId, Pageable pageable);
}
