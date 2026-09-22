package io.virinchi.khojnepal.Controller;

import io.virinchi.khojnepal.Model.PostTbl;
import io.virinchi.khojnepal.Model.UserTbl;
import io.virinchi.khojnepal.Repository.PostRepository;
import io.virinchi.khojnepal.Repository.UserRepository;
import io.virinchi.khojnepal.Service.TranslationService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.util.DigestUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class SeedDataController {

    private static final int TARGET_DUMMY_POSTS = 48;

    private final UserRepository uRepo;
    private final PostRepository pRepo;
    private final TranslationService translationService;

    public SeedDataController(UserRepository uRepo, PostRepository pRepo,
                              TranslationService translationService) {
        this.uRepo = uRepo;
        this.pRepo = pRepo;
        this.translationService = translationService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedOnStartup() {
        migratePasswords();
        seedAdmin();
        removeCommunityHelperPosts();
        List<UserTbl> authors = seedDemoAuthors();
        seedDummyPosts(authors);
        localizeExistingUserPosts();
    }

    /** Fix any BCrypt-hashed passwords from old code to MD5 — only for seeded accounts. */
    private void migratePasswords() {
        String demoHash = DigestUtils.md5DigestAsHex("Demo@123".getBytes());
        String adminHash = DigestUtils.md5DigestAsHex("Admin@123".getBytes());

        uRepo.findByEmail("admin@khojnepal.com").ifPresent(admin -> {
            String pw = admin.getPassword();
            if (pw != null && pw.startsWith("$2")) {
                admin.setPassword(adminHash);
                uRepo.save(admin);
                System.out.println("Migrated admin password hash (BCrypt -> MD5).");
            }
        });

        String[][] seededEmails = {
                {"suman.demo@khojnepal.com"}, {"anisha.demo@khojnepal.com"},
                {"ramesh.demo@khojnepal.com"}, {"pratik.demo@khojnepal.com"},
                {"nisha.demo@khojnepal.com"}, {"bikash.demo@khojnepal.com"},
                {"sita.demo@khojnepal.com"}, {"hari.demo@khojnepal.com"},
                {"manisha.demo@khojnepal.com"}, {"dipesh.demo@khojnepal.com"},
                {"kiran.demo@khojnepal.com"}, {"pooja.demo@khojnepal.com"},
                {"aashish.demo@khojnepal.com"}, {"sunita.demo@khojnepal.com"},
                {"roshan.demo@khojnepal.com"}, {"maya.demo@khojnepal.com"},
                {"nabin.demo@khojnepal.com"}, {"kabita.demo@khojnepal.com"},
                {"sanjay.demo@khojnepal.com"}, {"rita.demo@khojnepal.com"},
                {"community@khojnepal.com"}
        };
        for (String[] row : seededEmails) {
            uRepo.findByEmail(row[0]).ifPresent(u -> {
                String pw = u.getPassword();
                if (pw != null && pw.startsWith("$2")) {
                    u.setPassword(demoHash);
                    uRepo.save(u);
                }
            });
        }
    }

    private void seedAdmin() {
        String md5Hash = DigestUtils.md5DigestAsHex("Admin@123".getBytes());
        var existing = uRepo.findByEmail("admin@khojnepal.com");
        if (existing.isPresent()) {
            UserTbl admin = existing.get();
            if (!md5Hash.equals(admin.getPassword())) {
                admin.setPassword(md5Hash);
                uRepo.save(admin);
                System.out.println("Fixed admin password hash (BCrypt -> MD5).");
            }
            return;
        }
        UserTbl admin = new UserTbl();
        admin.setFullName("Khoj Nepal Admin");
        admin.setUsername("admin");
        admin.setEmail("admin@khojnepal.com");
        admin.setMobile("9800000000");
        admin.setPassword(md5Hash);
        admin.setRole("admin");
        admin.setGender("other");
        admin.setProvince("Bagmati");
        admin.setDistrict("Kathmandu");
        admin.setCity("Kathmandu");
        admin.setKycStatus("verified");
        admin.setPoints(0);
        admin.setItemsReported(0);
        admin.setItemsReturned(0);
        admin.setMemberSince(LocalDate.now().toString());
        uRepo.save(admin);
    }

    /** Drop old "Community Helper" sample posts — use real-looking demo authors instead. */
    private void removeCommunityHelperPosts() {
        uRepo.findByEmail("community@khojnepal.com").ifPresent(u -> {
            List<PostTbl> old = pRepo.findByOwnerIdOrderByIdDesc(u.getId());
            if (!old.isEmpty()) {
                pRepo.deleteAll(old);
            }
        });
    }

    private List<UserTbl> seedDemoAuthors() {
        String[][] people = {
                {"Suman Shrestha", "suman.s", "suman.demo@khojnepal.com", "9801000001", "SS"},
                {"Anisha Gurung", "anisha.g", "anisha.demo@khojnepal.com", "9801000002", "AG"},
                {"Ramesh Maharjan", "ramesh.m", "ramesh.demo@khojnepal.com", "9801000003", "RM"},
                {"Pratik Shakya", "pratik.s", "pratik.demo@khojnepal.com", "9801000004", "PS"},
                {"Nisha Thapa", "nisha.t", "nisha.demo@khojnepal.com", "9801000005", "NT"},
                {"Bikash Adhikari", "bikash.a", "bikash.demo@khojnepal.com", "9801000006", "BA"},
                {"Sita Rai", "sita.r", "sita.demo@khojnepal.com", "9801000007", "SR"},
                {"Hari Poudel", "hari.p", "hari.demo@khojnepal.com", "9801000008", "HP"},
                {"Manisha KC", "manisha.k", "manisha.demo@khojnepal.com", "9801000009", "MK"},
                {"Dipesh Tamang", "dipesh.t", "dipesh.demo@khojnepal.com", "9801000010", "DT"},
                {"Kiran Basnet", "kiran.b", "kiran.demo@khojnepal.com", "9801000011", "KB"},
                {"Pooja Sharma", "pooja.s", "pooja.demo@khojnepal.com", "9801000012", "PS"},
                {"Aashish Karki", "aashish.k", "aashish.demo@khojnepal.com", "9801000013", "AK"},
                {"Sunita Lama", "sunita.l", "sunita.demo@khojnepal.com", "9801000014", "SL"},
                {"Roshan Bhandari", "roshan.b", "roshan.demo@khojnepal.com", "9801000015", "RB"},
                {"Maya Gurung", "maya.g", "maya.demo@khojnepal.com", "9801000016", "MG"},
                {"Nabin Shrestha", "nabin.s", "nabin.demo@khojnepal.com", "9801000017", "NS"},
                {"Kabita Magar", "kabita.m", "kabita.demo@khojnepal.com", "9801000018", "KM"},
                {"Sanjay Thapa", "sanjay.t", "sanjay.demo@khojnepal.com", "9801000019", "ST"},
                {"Rita Joshi", "rita.j", "rita.demo@khojnepal.com", "9801000020", "RJ"}
        };
        List<UserTbl> authors = new ArrayList<>();
        for (String[] p : people) {
            authors.add(ensureDemoUser(p[0], p[1], p[2], p[3]));
        }
        return authors;
    }

    private UserTbl ensureDemoUser(String fullName, String username, String email, String mobile) {
        return uRepo.findByEmail(email).orElseGet(() -> {
            UserTbl u = new UserTbl();
            u.setFullName(fullName);
            u.setUsername(username);
            u.setEmail(email);
            u.setMobile(mobile);
            u.setPassword(DigestUtils.md5DigestAsHex("Demo@123".getBytes()));
            u.setRole("user");
            u.setGender("other");
            u.setProvince("Bagmati");
            u.setDistrict("Kathmandu");
            u.setCity("Kathmandu");
            u.setKycStatus("none");
            u.setPoints(20);
            u.setItemsReported(0);
            u.setItemsReturned(0);
            u.setMemberSince(LocalDate.now().minusMonths(2).toString());
            return uRepo.save(u);
        });
    }

    private void seedDummyPosts(List<UserTbl> authors) {
        long existing = pRepo.count();
        if (existing >= TARGET_DUMMY_POSTS) {
            return;
        }
        String[][] rows = dummyPostRows();
        int need = (int) Math.min(rows.length, TARGET_DUMMY_POSTS - existing);
        for (int i = 0; i < need; i++) {
            String[] r = rows[i];
            UserTbl author = authors.get(i % authors.size());
            String avatar = initials(author.getFullName());
            pRepo.save(build(
                    author, avatar,
                    r[0], r[1],
                    r[2], r[3],
                    r[4], r[5],
                    r[6], r[7],
                    r[8], r[9],
                    LocalDate.now().minusDays(Integer.parseInt(r[10])).toString(),
                    emptyToNull(r[11]),
                    emptyToNull(r[12])
            ));
        }
    }

    /** Best-effort: fill missing Nepali/English fields for posts typed in one language only. */
    private void localizeExistingUserPosts() {
        int done = 0;
        for (PostTbl post : pRepo.findAll()) {
            if (done >= 25) break;
            if (!translationService.needsLocalization(post)) continue;
            try {
                translationService.fillBilingualFields(post);
                pRepo.save(post);
                done++;
            } catch (Exception ignored) {
                /* keep going — translation is best-effort */
            }
        }
    }

    /**
     * type, status, title, titleNe, description, descriptionNe,
     * location, locationNe, category, subcategory, daysAgo, image, handoverStep
     */
    private String[][] dummyPostRows() {
        return new String[][]{
                {"lost", "active", "Black Samsung Galaxy Phone", "कालो स्यामसुङ ग्यालेक्सी फोन",
                        "Lost black Samsung Galaxy A54 near Koteshwor Bus Park. Blue cover, small crack on corner.",
                        "कोटेश्वर बस पार्क नजिकै कालो स्यामसुङ A54 हराएको।",
                        "Koteshwor, Kathmandu", "कोटेश्वर, काठमाडौं", "devices", "mobile", "1", "", ""},
                {"found", "active", "Brown Leather Wallet", "खैरो छालाको पर्स",
                        "Found a brown leather wallet near Patan Durbar Square main gate. Cards inside, no cash.",
                        "पाटन दरबार स्क्वायर नजिकै खैरो छालाको पर्स भेटियो।",
                        "Patan Durbar Square, Lalitpur", "पाटन दरबार स्क्वायर, ललितपुर", "accessories", "wallet", "1",
                        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop", ""},
                {"lost", "under_verification", "Citizenship Card", "नागरिकता",
                        "Lost Nepali citizenship card near Baneshwor Chowk. Name matches Ramesh Maharjan.",
                        "बानेश्वर चोक नजिकै नागरिकता हराएको।",
                        "Baneshwor Chowk, Kathmandu", "बानेश्वर चोक, काठमाडौं", "documents", "citizenship", "2", "", ""},
                {"found", "received_by_admin", "Black Backpack with Books", "किताब भएको कालो झोला",
                        "Found black backpack at Ratnapark bus stop. Handed to Admin Office.",
                        "रत्नपार्क बस स्टपमा कालो झोला भेटियो। कार्यालयमा बुझाइयो।",
                        "Ratnapark Bus Stop, Kathmandu", "रत्नपार्क बस स्टप, काठमाडौं", "accessories", "bag", "3",
                        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop", "at_office"},
                {"lost", "active", "Golden Retriever — Bruno", "गोल्डेन रिट्रिभर — ब्रुनो",
                        "Friendly golden retriever Bruno missing near Thamel. Red collar with a bell.",
                        "ठमेल नजिकै ब्रुनो नामको कुकुर हराएको।",
                        "Thamel, Kathmandu", "ठमेल, काठमाडौं", "animals", "dog", "3", "", ""},
                {"found", "claim_pending", "Found Dog — Golden Retriever", "भेटिएको कुकुर — गोल्डेन रिट्रिभर",
                        "Golden retriever found near Thamel with red collar. A claim is already under review.",
                        "ठमेल नजिकै रातो कलर भएको गोल्डेन रिट्रिभर भेटियो। दावी समीक्षामा छ।",
                        "Thamel, Kathmandu", "ठमेल, काठमाडौं", "animals", "dog", "4",
                        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop", ""},
                {"found", "claim_pending", "Silver Wrist Watch", "चाँदीको घडी",
                        "Found silver wrist watch at New Road. Another claim is in progress.",
                        "न्यू रोडमा चाँदीको घडी भेटियो। अर्को दावी प्रक्रियामा छ।",
                        "New Road, Kathmandu", "न्यू रोड, काठमाडौं", "accessories", "watch", "2",
                        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=300&fit=crop", ""},
                {"found", "delivered", "House Keys with Red Keychain", "रातो किचेन भएको घरको साँचो",
                        "Returned to rightful owner after admin verification.",
                        "प्रशासक प्रमाणीकरणपछि मालिकलाई फिर्ता।",
                        "Bhaktapur Durbar Square", "भक्तपुर दरबार स्क्वायर", "keys", "house_keys", "12",
                        "https://images.unsplash.com/photo-1582139329536-da3e388f6e38?w=400&h=300&fit=crop", "delivered"},
                {"lost", "active", "Dell Inspiron Laptop", "डेल इन्स्पिरन ल्यापटप",
                        "Lost silver Dell Inspiron 15 in a cafe near Lakeside. University stickers on lid.",
                        "लेकसाइड नजिकै क्याफेमा डेल ल्यापटप हराएको।",
                        "Lakeside, Pokhara", "लेकसाइड, पोखरा", "devices", "laptop", "5", "", ""},
                {"found", "claim_pending", "National ID Card", "राष्ट्रिय परिचय पत्र",
                        "Found NID near Koteshwor junction. Claim already under admin review.",
                        "कोटेश्वर जंक्सन नजिकै NID भेटियो। दावी समीक्षामा छ।",
                        "Koteshwor Junction, Kathmandu", "कोटेश्वर जंक्सन, काठमाडौं", "documents", "nid", "6",
                        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop", ""},
                {"lost", "active", "Gold Chain Necklace", "सुनको चेन",
                        "Lost thin gold chain with Om pendant while shopping on New Road.",
                        "न्यू रोडमा सुनको चेन हराएको।",
                        "New Road, Kathmandu", "न्यू रोड, काठमाडौं", "accessories", "jewelry", "1", "", ""},
                {"found", "active", "Blue Tablet Case with iPad", "आइप्याड सहित नीलो ट्याब्लेट केस",
                        "Found blue tablet case with iPad near Tribhuvan University library.",
                        "त्रिवि पुस्तकालय नजिकै आइप्याड भेटियो।",
                        "Tribhuvan University, Kirtipur", "त्रिभुवन विश्वविद्यालय, कीर्तिपुर", "devices", "tablet", "2",
                        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop", ""},
                {"lost", "claim_pending", "Driving License", "सवारी चालक अनुमतिपत्र",
                        "Lost driving license near Kalanki bus park. Plastic cover slightly torn.",
                        "कलंकी बस पार्क नजिकै लाइसेन्स हराएको।",
                        "Kalanki, Kathmandu", "कलंकी, काठमाडौं", "documents", "license", "4", "", ""},
                {"found", "under_verification", "Motorcycle Helmet — Red", "रातो मोटरसाइकल हेल्मेट",
                        "Found red full-face helmet near Basantapur. Scratch on left side.",
                        "बसन्तपुर नजिकै रातो हेल्मेट भेटियो।",
                        "Basantapur, Kathmandu", "बसन्तपुर, काठमाडौं", "vehicle", "helmet", "7",
                        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", "contacted"},
                {"lost", "active", "Set of Office Keys", "अफिसका साँचोहरू",
                        "Lost three office keys with green tag labeled Floor 2 near Pulchowk.",
                        "पुल्चोक नजिकै अफिसका साँचो हराएको।",
                        "Pulchowk, Lalitpur", "पुल्चोक, ललितपुर", "keys", "house_keys", "8", "", ""},
                {"found", "owner_found", "Wrist Watch — Silver", "चाँदी रङको हातघडी",
                        "Owner verified. Listed briefly for transparency.",
                        "मालिक प्रमाणित भयो।",
                        "Chabahil, Kathmandu", "चाबहिल, काठमाडौं", "accessories", "watch", "9",
                        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=300&fit=crop", ""},
                {"lost", "active", "Grey Cat — Mini", "खैरो बिरालो — मिनी",
                        "Indoor grey cat Mini escaped near Biratnagar bus park. Blue collar.",
                        "विराटनगर बस पार्क नजिकै मिनी हराएको।",
                        "Biratnagar Bus Park", "विराटनगर बस पार्क", "animals", "cat", "6", "", ""},
                {"found", "active", "Wireless Earbuds Case", "वायरलेस इयरबड केस",
                        "Found white wireless earbuds case on a bench at Gongabu bus park.",
                        "गोंगबु बस पार्कमा इयरबड केस भेटियो।",
                        "Gongabu Bus Park, Kathmandu", "गोंगबु बस पार्क, काठमाडौं", "devices", "earbuds", "1",
                        "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=300&fit=crop", ""},
                {"lost", "suspicious", "Vehicle Blue Book", "सवारी ब्लु बुक",
                        "Lost vehicle registration blue book. Conflicting claims under investigation.",
                        "ब्लु बुक हराएको। बाझिएका दावी अनुसन्धानमा।",
                        "Putalisadak, Kathmandu", "पुतलीसडक, काठमाडौं", "vehicle", "vehicle_docs", "10", "", ""},
                {"found", "received_by_admin", "School Certificate Folder", "विद्यालय प्रमाणपत्र फोल्डर",
                        "Found school certificate folder near Maharajgunj. Submitted to Admin Office.",
                        "महाराजगंज नजिकै प्रमाणपत्र फोल्डर भेटियो।",
                        "Maharajgunj, Kathmandu", "महाराजगंज, काठमाडौं", "documents", "certificate", "5",
                        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop", "at_office"},
                {"lost", "active", "Redmi Note Power Bank", "रेडमी पावर बैंक",
                        "Lost black 20000mAh power bank in Lagankhel microbus. White scratch on side.",
                        "लगनखेल माइक्रोबसमा पावर बैंक हराएको।",
                        "Lagankhel, Lalitpur", "लगनखेल, ललितपुर", "devices", "other", "2", "", ""},
                {"found", "active", "Kids School Bag — Blue", "नीलो विद्यालय झोला",
                        "Found blue school bag near Balkumari bridge with notebooks inside.",
                        "बाकुमारी पुल नजिकै विद्यालय झोला भेटियो।",
                        "Balkumari, Lalitpur", "बाकुमारी, ललितपुर", "accessories", "bag", "3",
                        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop", ""},
                {"lost", "active", "Motorcycle Key with Remote", "रिमोटसहित मोटरसाइकल साँचो",
                        "Lost Yamaha key with black remote near Satdobato chowk.",
                        "सातदोबाटो चोक नजिकै गाडीको साँचो हराएको।",
                        "Satdobato, Lalitpur", "सातदोबाटो, ललितपुर", "keys", "vehicle_keys", "4", "", ""},
                {"found", "claim_pending", "Passport Cover — Green", "हरियो राहदानी कभर",
                        "Found green passport cover (passport not inside) at Tribhuvan International Airport.",
                        "त्रिभुवन अन्तर्राष्ट्रिय विमानस्थलमा राहदानी कभर भेटियो।",
                        "TIA, Kathmandu", "त्रिभुवन विमानस्थल, काठमाडौं", "documents", "other", "8",
                        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop", ""},
                {"lost", "active", "Spectacles in Black Case", "कालो केसमा चस्मा",
                        "Lost reading glasses in black hard case near Civil Mall Escalator.",
                        "सिभिल मल नजिकै चस्मा हराएको।",
                        "Sundhara, Kathmandu", "सुन्धारा, काठमाडौं", "accessories", "other", "2", "", ""},
                {"found", "active", "Number Plate BA 1 PA 4521", "नम्बर प्लेट BA 1 PA 4521",
                        "Found motorcycle number plate near Ring Road, Balkhu.",
                        "बालखु रिङ रोड नजिकै नम्बर प्लेट भेटियो।",
                        "Balkhu, Kathmandu", "बालखु, काठमाडौं", "vehicle", "number_plate", "6", "", ""},
                {"lost", "active", "MacBook Charger 61W", "म्याकबुक चार्जर",
                        "Lost USB-C MacBook charger in Himalayan Java, Jhamsikhel.",
                        "झम्सिखेलमा म्याकबुक चार्जर हराएको।",
                        "Jhamsikhel, Lalitpur", "झम्सिखेल, ललितपुर", "devices", "other", "3", "", ""},
                {"found", "under_verification", "Silver Bracelet", "चाँदीको ब्रेसलेट",
                        "Found silver bracelet near Asan Tol. Admin verifying ownership claims.",
                        "असन टोल नजिकै चाँदीको ब्रेसलेट भेटियो।",
                        "Asan, Kathmandu", "असन, काठमाडौं", "accessories", "jewelry", "5",
                        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop", "contacted"},
                {"lost", "active", "Parrot — Mitthu", "सुगा — मिठ्ठु",
                        "Green parrot Mitthu flew from balcony in Battisputali. Yellow ring on leg.",
                        "बत्तीसपुतलीबाट मिठ्ठु सुगा उडेको।",
                        "Battisputali, Kathmandu", "बत्तीसपुतली, काठमाडौं", "animals", "other_pet", "7", "", ""},
                {"found", "claim_pending", "Student ID — St. Xavier", "विद्यार्थी परिचय पत्र",
                        "Found St. Xavier's student ID card near Maitighar. Claim already submitted.",
                        "मैतीघर नजिकै विद्यार्थी ID भेटियो।",
                        "Maitighar, Kathmandu", "मैतीघर, काठमाडौं", "documents", "other", "4", "", ""},
                {"lost", "active", "Sony WH-1000XM Headphones", "सोनी हेडफोन",
                        "Lost black Sony noise-cancelling headphones in Safa Tempo to Baneshwor.",
                        "बानेश्वर जाने साफा टेम्पोमा हेडफोन हराएको।",
                        "Old Baneshwor, Kathmandu", "पुरानो बानेश्वर, काठमाडौं", "devices", "earbuds", "2", "", ""},
                {"found", "active", "Umbrella — Navy Blue", "गाढा नीलो छाता",
                        "Found navy blue umbrella outside Nepal Telecom, Sundhara.",
                        "सुन्धारा नेपाल टेलिकम बाहिर छाता भेटियो।",
                        "Sundhara, Kathmandu", "सुन्धारा, काठमाडौं", "other", "misc", "1", "", ""},
                {"lost", "active", "Wedding Ring — Gold", "सुनको विवाह औंठी",
                        "Lost gold wedding ring with small diamond near Pashupatinath parking.",
                        "पशुपतिनाथ पार्किङ नजिकै औंठी हराएको।",
                        "Pashupatinath, Kathmandu", "पशुपतिनाथ, काठमाडौं", "accessories", "jewelry", "9", "", ""},
                {"found", "received_by_admin", "Vehicle Blue Book Photocopy Set", "ब्लु बुक फोटोकपी",
                        "Found folder of vehicle document photocopies. Kept at Admin Office.",
                        "सवारी कागजात फोटोकपी भेटियो। कार्यालयमा छ।",
                        "Kalimati, Kathmandu", "कालिमाटी, काठमाडौं", "vehicle", "vehicle_docs", "11", "", "at_office"},
                {"lost", "claim_pending", "iPhone 13 — Blue", "आइफोन १३ — नीलो",
                        "Lost blue iPhone 13 in Bhatbhateni, Maharajgunj. Clear case with stickers.",
                        "महाराजगंज भाटभटेनीमा आइफोन हराएको।",
                        "Maharajgunj, Kathmandu", "महाराजगंज, काठमाडौं", "devices", "mobile", "5", "", ""},
                {"found", "active", "Black Formal Shoe (Left)", "कालो औपचारिक जुत्ता",
                        "Found one black formal left shoe near Kathmandu University bus stop, Dhulikhel.",
                        "धुलिखेल बस स्टप नजिकै जुत्ता भेटियो।",
                        "Dhulikhel, Kavre", "धुलिखेल, काभ्रे", "other", "other", "6", "", ""},
                {"lost", "active", "ATM Card — Nabil Bank", "नबिल बैंक एटिएम कार्ड",
                        "Lost Nabil Bank ATM card near Kamalpokhari. Already blocked; need physical card.",
                        "कमलापोखरी नजिकै एटिएम कार्ड हराएको।",
                        "Kamalpokhari, Kathmandu", "कमलापोखरी, काठमाडौं", "documents", "other", "3", "", ""},
                {"found", "claim_pending", "Laptop Sleeve — Grey", "खैरो ल्यापटप स्लिभ",
                        "Found grey laptop sleeve with charger cable near IT Park, Dhapakhel.",
                        "धापाखेल आईटी पार्क नजिकै ल्यापटप स्लिभ भेटियो।",
                        "Dhapakhel, Lalitpur", "धापाखेल, ललितपुर", "devices", "laptop", "7",
                        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop", ""},
                {"lost", "active", "Puppy — Indie Mix", "मिश्रित जातको कुकुरको बच्चा",
                        "Small brown indie puppy missing from Sanepa area. Blue rope collar.",
                        "सानेपाबाट कुकुरको बच्चा हराएको।",
                        "Sanepa, Lalitpur", "सानेपा, ललितपुर", "animals", "dog", "4", "", ""},
                {"found", "delivered", "USB Pendrive 64GB", "६४ जीबी पेन्ड्राइभ",
                        "Pendrive returned to owner after office verification.",
                        "पेन्ड्राइभ मालिकलाई फिर्ता।",
                        "New Baneshwor, Kathmandu", "नयाँ बानेश्वर, काठमाडौं", "devices", "other", "15", "", "delivered"},
                {"lost", "active", "Handwoven Dhaka Topi", "ढाका टोपी",
                        "Lost traditional dhaka topi near Basantapur temple steps.",
                        "बसन्तपुर मन्दिर नजिकै ढाका टोपी हराएको।",
                        "Basantapur, Kathmandu", "बसन्तपुर, काठमाडौं", "accessories", "other", "8", "", ""},
                {"found", "active", "Bicycle Helmet — White", "सेतो साइकल हेल्मेट",
                        "Found white bicycle helmet chained loosely near Pulchowk Campus gate.",
                        "पुल्चोक क्याम्पस गेट नजिकै साइकल हेल्मेट भेटियो।",
                        "Pulchowk, Lalitpur", "पुल्चोक, ललितपुर", "vehicle", "helmet", "3",
                        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", ""},
                {"lost", "under_verification", "SEE Marksheet Envelope", "SEE मार्कसीट खाम",
                        "Lost SEE marksheet envelope near Bhrikutimandap exam center area.",
                        "भृकुटीमण्डप नजिकै SEE मार्कसीट हराएको।",
                        "Bhrikutimandap, Kathmandu", "भृकुटीमण्डप, काठमाडौं", "documents", "certificate", "6", "", ""},
                {"found", "suspicious", "Gold-looking Chain", "सुनजस्तो चेन",
                        "Found chain that looks like gold near Indrachowk. Multiple conflicting claims.",
                        "इन्द्रचोक नजिकै सुनजस्तो चेन भेटियो। दावी बाझिएका।",
                        "Indrachowk, Kathmandu", "इन्द्रचोक, काठमाडौं", "accessories", "jewelry", "10",
                        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop", ""},
                {"lost", "active", "Tablet — Samsung A8", "स्यामसुङ ट्याब्लेट A8",
                        "Lost Samsung Galaxy Tab A8 in microbus from Kalanki to Sitapaila.",
                        "कलंकी–सीतापाइला माइक्रोबसमा ट्याब्लेट हराएको।",
                        "Sitapaila, Kathmandu", "सीतापाइला, काठमाडौं", "devices", "tablet", "5", "", ""},
                {"found", "owner_found", "House Key with Wooden Tag", "काठको ट्याग भएको साँचो",
                        "Owner found and verified. Keeping listing for a short transparency period.",
                        "मालिक भेटियो र प्रमाणित भयो।",
                        "Kapan, Kathmandu", "कपन, काठमाडौं", "keys", "house_keys", "13",
                        "https://images.unsplash.com/photo-1582139329536-da3e388f6e38?w=400&h=300&fit=crop", ""},
                {"lost", "active", "Shopping Tote with Cosmetics", "सजधज सामान भएको झोला",
                        "Lost beige tote bag with cosmetics near Bishal Bazar, New Road.",
                        "न्यू रोड विशाल बजार नजिकै झोला हराएको।",
                        "New Road, Kathmandu", "न्यू रोड, काठमाडौं", "accessories", "bag", "2", "", ""},
                {"found", "active", "Cat — Orange Tabby", "सुन्तला रङको बिरालो",
                        "Friendly orange tabby found near Bouddha stupa. No collar.",
                        "बौद्ध स्तुप नजिकै सुन्तला रङको बिरालो भेटियो।",
                        "Bouddha, Kathmandu", "बौद्ध, काठमाडौं", "animals", "cat", "1",
                        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop", ""}
        };
    }

    private PostTbl build(
            UserTbl owner, String avatar, String type, String status,
            String title, String titleNe, String description, String descriptionNe,
            String location, String locationNe, String category, String subcategory,
            String date, String image, String handoverStep
    ) {
        PostTbl post = new PostTbl();
        post.setOwnerId(owner.getId());
        post.setUserId(owner.getId());
        post.setOwner(owner);
        post.setUser(owner);
        post.setUserName(owner.getFullName());
        post.setUserAvatar(avatar);
        post.setType(type);
        post.setStatus(status);
        post.setTitle(title);
        post.setTitleNe(titleNe);
        post.setDescription(description);
        post.setDescriptionNe(descriptionNe);
        post.setLocation(location);
        post.setLocationNe(locationNe);
        post.setCategory(category);
        post.setSubcategory(subcategory);
        post.setDate(date);
        post.setCreatedAt(date);
        post.setImage(image);
        if (handoverStep != null && !handoverStep.isBlank()) {
            post.setHandoverStep(handoverStep);
        }
        if ("delivered".equals(status) || "owner_found".equals(status)) {
            post.setDeliveredDate(LocalDate.now().minusDays(3).toString());
            post.setRetentionDaysLeft(10);
            post.setDeliveredMessage("This item has been successfully returned to its rightful owner.");
            post.setDeliveredMessageNe("यो सामान सफलतापूर्वक मालिकलाई फिर्ता गरिएको छ।");
        }
        return post;
    }

    private static String emptyToNull(String s) {
        return s == null || s.isBlank() ? null : s;
    }

    private static String initials(String name) {
        if (name == null || name.isBlank()) return "U";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }
}
