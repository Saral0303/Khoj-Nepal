package io.virinchi.khojnepal.Repository;

import io.virinchi.khojnepal.Model.PostTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<PostTbl, Integer> {

    List<PostTbl> findByOwnerIdOrderByIdDesc(int ownerId);

    List<PostTbl> findByTypeOrderByIdDesc(String type);

    List<PostTbl> findByStatusOrderByIdDesc(String status);

    List<PostTbl> findByTypeAndStatusOrderByIdDesc(String type, String status);

    List<PostTbl> findByStatusInOrderByIdDesc(List<String> statuses);

    List<PostTbl> findByOwnerOrderByIdDesc(UserTbl owner);

    List<PostTbl> findByUserOrderByIdDesc(UserTbl user);

    Page<PostTbl> findByStatusIn(List<String> statuses, Pageable pageable);

    Page<PostTbl> findByOwnerId(int ownerId, Pageable pageable);

    Page<PostTbl> findByType(String type, Pageable pageable);

    Page<PostTbl> findByStatus(String status, Pageable pageable);

    Page<PostTbl> findByTypeAndStatus(String type, String status, Pageable pageable);

    long countByStatus(String status);

    long countByStatusIn(List<String> statuses);
}
