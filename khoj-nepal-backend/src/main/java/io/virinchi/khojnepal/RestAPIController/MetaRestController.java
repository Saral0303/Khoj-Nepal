package io.virinchi.khojnepal.RestAPIController;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class MetaRestController {

    @GetMapping("/categories")
    public ResponseEntity<?> categories() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "devices", "en", "Devices", "ne", "उपकरण",
                        "subcategories", List.of(
                                Map.of("id", "mobile", "en", "Mobile", "ne", "मोबाइल"),
                                Map.of("id", "laptop", "en", "Laptop", "ne", "ल्यापटप"),
                                Map.of("id", "tablet", "en", "Tablet", "ne", "ट्याब्लेट"),
                                Map.of("id", "earbuds", "en", "Earbuds / Headphones", "ne", "इयरबड / हेडफोन"),
                                Map.of("id", "other", "en", "Other", "ne", "अन्य")
                        )),
                Map.of("id", "documents", "en", "Documents", "ne", "कागजात",
                        "subcategories", List.of(
                                Map.of("id", "citizenship", "en", "Citizenship", "ne", "नागरिकता"),
                                Map.of("id", "license", "en", "License", "ne", "लाइसेन्स"),
                                Map.of("id", "nid", "en", "National ID", "ne", "राष्ट्रिय परिचय पत्र"),
                                Map.of("id", "certificate", "en", "Certificate", "ne", "प्रमाणपत्र"),
                                Map.of("id", "other", "en", "Other", "ne", "अन्य")
                        )),
                Map.of("id", "animals", "en", "Animals / Pets", "ne", "जनावर / पाल्तु",
                        "subcategories", List.of(
                                Map.of("id", "dog", "en", "Dog", "ne", "कुकुर"),
                                Map.of("id", "cat", "en", "Cat", "ne", "बिरालो"),
                                Map.of("id", "other_pet", "en", "Other Pet", "ne", "अन्य पाल्तु"),
                                Map.of("id", "other", "en", "Other", "ne", "अन्य")
                        )),
                Map.of("id", "accessories", "en", "Personal Accessories", "ne", "व्यक्तिगत सामान",
                        "subcategories", List.of(
                                Map.of("id", "wallet", "en", "Wallet", "ne", "पर्स"),
                                Map.of("id", "bag", "en", "Bag / Backpack", "ne", "झोला"),
                                Map.of("id", "jewelry", "en", "Jewelry", "ne", "गहना"),
                                Map.of("id", "watch", "en", "Watch", "ne", "घडी"),
                                Map.of("id", "other", "en", "Other", "ne", "अन्य")
                        )),
                Map.of("id", "vehicle", "en", "Vehicle & Transport", "ne", "सवारी साधन",
                        "subcategories", List.of(
                                Map.of("id", "helmet", "en", "Helmet", "ne", "हेल्मेट"),
                                Map.of("id", "number_plate", "en", "Number Plate", "ne", "नम्बर प्लेट"),
                                Map.of("id", "vehicle_docs", "en", "Vehicle Documents", "ne", "सवारी कागजात"),
                                Map.of("id", "other", "en", "Other", "ne", "अन्य")
                        )),
                Map.of("id", "keys", "en", "Keys & Security", "ne", "साँचो र सुरक्षा",
                        "subcategories", List.of(
                                Map.of("id", "house_keys", "en", "House Keys", "ne", "घरको साँचो"),
                                Map.of("id", "vehicle_keys", "en", "Vehicle Keys", "ne", "गाडीको साँचो"),
                                Map.of("id", "other", "en", "Other", "ne", "अन्य")
                        )),
                Map.of("id", "other", "en", "Others", "ne", "अन्य",
                        "subcategories", List.of(
                                Map.of("id", "misc", "en", "Miscellaneous", "ne", "विविध"),
                                Map.of("id", "other", "en", "Other", "ne", "अन्य")
                        ))
        ));
    }

    @GetMapping("/office")
    public ResponseEntity<?> office() {
        return ResponseEntity.ok(Map.of(
                "name", "Khoj Nepal Admin Office",
                "nameNe", "खोज नेपाल प्रशासन कार्यालय",
                "location", "New Baneshwor, Kathmandu",
                "locationNe", "नयाँ बानेश्वर, काठमाडौं",
                "hours", "Sun–Fri: 10:00 AM – 5:00 PM",
                "hoursNe", "आइत–शुक्र: बिहान १० – बेलुका ५",
                "phone", "+977-1-5550123",
                "email", "office@khojnepal.com",
                "instructions", "Valuable found items should be submitted to the Admin Office. Do not hand over items directly to strangers.",
                "instructionsNe", "महत्त्वपूर्ण भेटिएका सामान प्रशासन कार्यालयमा बुझाउनुहोस्। अपरिचितलाई सिधै नदिनुहोस्।"
        ));
    }

    @GetMapping("/reward-levels")
    public ResponseEntity<?> rewardLevels() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "bronze", "min", 0, "max", 99, "en", "Bronze Helper", "ne", "कांस्य सहयोगी"),
                Map.of("id", "silver", "min", 100, "max", 249, "en", "Silver Finder", "ne", "रजत खोजकर्ता"),
                Map.of("id", "gold", "min", 250, "max", 499, "en", "Gold Guardian", "ne", "स्वर्ण संरक्षक"),
                Map.of("id", "hero", "min", 500, "max", 99999, "en", "Community Hero", "ne", "समुदाय नायक")
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "app", "KhojNepal"));
    }
}
