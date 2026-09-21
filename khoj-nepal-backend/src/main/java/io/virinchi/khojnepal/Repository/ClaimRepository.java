package io.virinchi.khojnepal.Repository;

import io.virinchi.khojnepal.Model.ClaimTbl;
import io.virinchi.khojnepal.Model.PostTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<ClaimTbl, Integer> {

    List<ClaimTbl> findByOwnerIdOrderByIdDesc(int ownerId);

    List<ClaimTbl> findByPostIdOrderByIdDesc(int postId);

    List<ClaimTbl> findByStatusOrderByIdDesc(String status);

    List<ClaimTbl> findByInvestigationOrderByIdDesc(String investigation);

    List<ClaimTbl> findByClaimantOrderByIdDesc(UserTbl claimant);

    List<ClaimTbl> findByPostOrderByIdDesc(PostTbl post);

    Page<ClaimTbl> findByOwnerId(int ownerId, Pageable pageable);

    Page<ClaimTbl> findByStatus(String status, Pageable pageable);

    Page<ClaimTbl> findByPostId(int postId, Pageable pageable);
}
