package io.virinchi.khojnepal.Service;

import io.virinchi.khojnepal.Model.ReportTbl;
import io.virinchi.khojnepal.Model.TipTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Repository.PostRepository;
import io.virinchi.khojnepal.Repository.ReportRepository;
import io.virinchi.khojnepal.Repository.TipRepository;
import io.virinchi.khojnepal.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TipRepository tipRepo;
    private final ReportRepository reportRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;

    public TipTbl createTip(int postId, UserTbl user, String infoType, String message) {
        var post = postRepo.findById(postId);
        if (post.isEmpty()) return null;

        TipTbl tip = new TipTbl();
        tip.setPostId(postId);
        tip.setUserId(user.getId());
        tip.setPost(post.get());
        tip.setUser(user);
        tip.setInfoType(infoType);
        tip.setMessage(message);
        tip.setStatus("new");
        tip.setCreatedAt(LocalDate.now().toString());
        return tipRepo.save(tip);
    }

    public ReportTbl createReport(UserTbl reporter, String targetType, Object targetIdObj,
                                  String reason, String description, String image) {
        ReportTbl report = new ReportTbl();
        if (reporter != null) {
            report.setReporterId(reporter.getId());
            report.setReporter(reporter);
        }
        report.setTargetType(targetType);
        if (targetIdObj != null) {
            report.setTargetId(Integer.parseInt(targetIdObj.toString()));
        }
        report.setReason(reason);
        report.setDescription(description);
        report.setImage(image);
        report.setStatus("open");
        report.setCreatedAt(LocalDate.now().toString());
        return reportRepo.save(report);
    }
}
