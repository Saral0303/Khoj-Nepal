package io.virinchi.khojnepal.Repository;

import io.virinchi.khojnepal.Model.ReportTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<ReportTbl, Integer> {

    List<ReportTbl> findByStatusOrderByIdDesc(String status);

    List<ReportTbl> findByReporterOrderByIdDesc(UserTbl reporter);

    Page<ReportTbl> findByStatus(String status, Pageable pageable);

    long countByStatus(String status);

    Page<ReportTbl> findAll(Pageable pageable);
}
