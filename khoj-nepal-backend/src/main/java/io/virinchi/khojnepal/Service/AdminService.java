package io.virinchi.khojnepal.Service;

import io.virinchi.khojnepal.Repository.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository uRepo;
    private final PostRepository pRepo;
    private final ClaimRepository cRepo;
    private final TipRepository tipRepo;
    private final ReportRepository reportRepo;

    public AdminService(UserRepository uRepo, PostRepository pRepo,
                        ClaimRepository cRepo, TipRepository tipRepo,
                        ReportRepository reportRepo) {
        this.uRepo = uRepo;
        this.pRepo = pRepo;
        this.cRepo = cRepo;
        this.tipRepo = tipRepo;
        this.reportRepo = reportRepo;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("users", uRepo.count());
        stats.put("posts", pRepo.count());
        stats.put("pendingPosts", pRepo.countByStatus("pending"));
        stats.put("claims", cRepo.count());
        stats.put("openReports", reportRepo.countByStatus("open"));
        stats.put("newTips", tipRepo.countByStatus("new"));
        stats.put("recovered", pRepo.countByStatusIn(List.of("delivered", "owner_found")));
        return stats;
    }

    public Map<String, Object> getSuspiciousData() {
        Map<String, Object> map = new HashMap<>();
        map.put("posts", pRepo.findByStatusOrderByIdDesc("suspicious"));
        map.put("claims", cRepo.findByInvestigationOrderByIdDesc("suspicious"));
        return map;
    }
}
