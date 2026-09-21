package io.virinchi.khojnepal.Service;

import io.virinchi.khojnepal.Model.PostTbl;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TranslationService {

    private static final Pattern TRANSLATED =
            Pattern.compile("\"translatedText\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"");

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public void fillBilingualFields(PostTbl post) {
        if (post == null) return;
        post.setTitle(nz(post.getTitle()));
        post.setDescription(nz(post.getDescription()));
        post.setLocation(nz(post.getLocation()));

        Bilingual title = pair(post.getTitle(), post.getTitleNe());
        post.setTitle(title.en);
        post.setTitleNe(title.ne);

        Bilingual desc = pair(post.getDescription(), post.getDescriptionNe());
        post.setDescription(desc.en);
        post.setDescriptionNe(desc.ne);

        Bilingual loc = pair(post.getLocation(), post.getLocationNe());
        post.setLocation(loc.en);
        post.setLocationNe(loc.ne);
    }

    public boolean needsLocalization(PostTbl post) {
        if (post == null) return false;
        return missingAlt(post.getTitle(), post.getTitleNe())
                || missingAlt(post.getDescription(), post.getDescriptionNe())
                || missingAlt(post.getLocation(), post.getLocationNe());
    }

    private Bilingual pair(String primary, String alt) {
        String text = nz(primary);
        if (text.isEmpty()) {
            return new Bilingual("", nz(alt));
        }
        if (looksNepali(text)) {
            String ne = text;
            String en = missingAlt(text, alt) ? translate(text, "ne", "en") : nz(alt);
            if (en.isEmpty() || en.equals(ne)) en = text;
            return new Bilingual(en, ne);
        }
        String en = text;
        String ne = missingAlt(text, alt) ? translate(text, "en", "ne") : nz(alt);
        if (ne.isEmpty()) ne = text;
        return new Bilingual(en, ne);
    }

    private boolean missingAlt(String primary, String alt) {
        String p = nz(primary);
        String a = nz(alt);
        return a.isEmpty() || a.equals(p);
    }

    public String translate(String text, String from, String to) {
        String src = nz(text).trim();
        if (src.isEmpty()) return "";

        String cacheKey = from + "|" + to + "|" + src;
        String cached = cache.get(cacheKey);
        if (cached != null) return cached;

        try {
            String q = src.length() > 450 ? src.substring(0, 450) : src;
            String url = "https://api.mymemory.translated.net/get?q="
                    + URLEncoder.encode(q, StandardCharsets.UTF_8)
                    + "&langpair=" + from + "|" + to;
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (res.statusCode() < 200 || res.statusCode() >= 300) {
                cache.put(cacheKey, src);
                return src;
            }
            Matcher m = TRANSLATED.matcher(res.body());
            if (!m.find()) {
                cache.put(cacheKey, src);
                return src;
            }
            String out = unescapeJson(m.group(1)).trim();
            String result = out.isEmpty() ? src : out;
            cache.put(cacheKey, result);
            return result;
        } catch (Exception e) {
            cache.put(cacheKey, src);
            return src;
        }
    }

    public static boolean looksNepali(String text) {
        if (text == null) return false;
        return text.codePoints().anyMatch(cp -> cp >= 0x0900 && cp <= 0x097F);
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }

    private static String unescapeJson(String s) {
        return s.replace("\\\"", "\"")
                .replace("\\\\", "\\")
                .replace("\\n", "\n")
                .replace("\\/", "/");
    }

    private record Bilingual(String en, String ne) {}
}
