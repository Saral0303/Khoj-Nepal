package io.virinchi.khojnepal.Repository;

import io.virinchi.khojnepal.Model.UserTbl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserTbl, Integer> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByMobile(String mobile);

    Optional<UserTbl> findByUsernameAndPassword(String username, String password);

    Optional<UserTbl> findByEmailAndPassword(String email, String password);

    Optional<UserTbl> findByMobileAndPassword(String mobile, String password);

    Optional<UserTbl> findByEmail(String email);

    Optional<UserTbl> findByUsername(String username);

    Optional<UserTbl> findByMobile(String mobile);

    List<UserTbl> findByKycStatus(String kycStatus);

    Page<UserTbl> findAll(Pageable pageable);
}
