package io.virinchi.khojnepal.Repository;

import io.virinchi.khojnepal.Model.TipTbl;
import io.virinchi.khojnepal.Model.PostTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TipRepository extends JpaRepository<TipTbl, Integer> {

    List<TipTbl> findByPostIdOrderByIdDesc(int postId);

    List<TipTbl> findByStatusOrderByIdDesc(String status);

    List<TipTbl> findByUserOrderByIdDesc(UserTbl user);

    List<TipTbl> findByPostOrderByIdDesc(PostTbl post);

    Page<TipTbl> findByStatus(String status, Pageable pageable);

    long countByStatus(String status);

    Page<TipTbl> findByPostId(int postId, Pageable pageable);
}
