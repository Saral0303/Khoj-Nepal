package io.virinchi.khojnepal.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
public class MetaController {

    @GetMapping("/categories")
    @ResponseBody
    public ResponseEntity<?> categories() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "devices", "en", "Devices", "ne", "\u0909\u092a\u0915\u0930\u0923",
                        "subcategories", List.of(
                                Map.of("id", "mobile", "en", "Mobile", "ne", "\u092e\u094b\u092c\u093e\u0907\u0932"),
                                Map.of("id", "laptop", "en", "Laptop", "ne", "\u0932\u094d\u092f\u093e\u092a\u091f\u092a"),
                                Map.of("id", "tablet", "en", "Tablet", "ne", "\u091f\u094d\u092f\u093e\u092c\u094d\u0932\u0947\u091f"),
                                Map.of("id", "earbuds", "en", "Earbuds / Headphones", "ne", "\u0907\u092f\u0930\u092c\u0921 / \u0939\u0947\u0921\u092b\u094b\u0928"),
                                Map.of("id", "other", "en", "Other", "ne", "\u0905\u0928\u094d\u092f")
                        )),
                Map.of("id", "documents", "en", "Documents", "ne", "\u0915\u093e\u0917\u091c\u093e\u0924",
                        "subcategories", List.of(
                                Map.of("id", "citizenship", "en", "Citizenship", "ne", "\u0928\u093e\u0917\u0930\u093f\u0915\u0924\u093e"),
                                Map.of("id", "license", "en", "License", "ne", "\u0932\u093e\u0907\u0938\u0947\u0902\u0938"),
                                Map.of("id", "nid", "en", "National ID", "ne", "\u0930\u093e\u0937\u094d\u091f\u094d\u0930\u093f\u092f \u092a\u0930\u093f\u091a\u092f \u092a\u0924\u094d\u0930"),
                                Map.of("id", "certificate", "en", "Certificate", "ne", "\u092a\u094d\u0930\u092e\u093e\u0923\u092a\u0924\u094d\u0930"),
                                Map.of("id", "other", "en", "Other", "ne", "\u0905\u0928\u094d\u092f")
                        )),
                Map.of("id", "animals", "en", "Animals / Pets", "ne", "\u091c\u0928\u093e\u0935\u0930 / \u092a\u093e\u0932\u094d\u0924\u0941",
                        "subcategories", List.of(
                                Map.of("id", "dog", "en", "Dog", "ne", "\u0915\u0941\u0915\u0941\u0930"),
                                Map.of("id", "cat", "en", "Cat", "ne", "\u092c\u093f\u0930\u093e\u0932\u094b"),
                                Map.of("id", "other_pet", "en", "Other Pet", "ne", "\u0905\u0928\u094d\u092f \u092a\u093e\u0932\u094d\u0924\u0941"),
                                Map.of("id", "other", "en", "Other", "ne", "\u0905\u0928\u094d\u092f")
                        )),
                Map.of("id", "accessories", "en", "Personal Accessories", "ne", "\u0935\u094d\u092f\u0915\u094d\u0924\u093f\u0917\u0924 \u0938\u093e\u092e\u093e\u0928",
                        "subcategories", List.of(
                                Map.of("id", "wallet", "en", "Wallet", "ne", "\u092a\u0930\u094d\u0938"),
                                Map.of("id", "bag", "en", "Bag / Backpack", "ne", "\u091d\u094b\u0932\u093e"),
                                Map.of("id", "jewelry", "en", "Jewelry", "ne", "\u0917\u0939\u0928\u093e"),
                                Map.of("id", "watch", "en", "Watch", "ne", "\u0918\u0921\u0940"),
                                Map.of("id", "other", "en", "Other", "ne", "\u0905\u0928\u094d\u092f")
                        )),
                Map.of("id", "vehicle", "en", "Vehicle & Transport", "ne", "\u0938\u0935\u093e\u0930\u0940 \u0938\u093e\u0927\u0928",
                        "subcategories", List.of(
                                Map.of("id", "helmet", "en", "Helmet", "ne", "\u0939\u0947\u0932\u094d\u092e\u0947\u091f"),
                                Map.of("id", "number_plate", "en", "Number Plate", "ne", "\u0928\u092e\u094d\u092c\u0930 \u092a\u094d\u0932\u0947\u091f"),
                                Map.of("id", "vehicle_docs", "en", "Vehicle Documents", "ne", "\u0938\u0935\u093e\u0930\u0940 \u0915\u093e\u0917\u091c\u093e\u0924"),
                                Map.of("id", "other", "en", "Other", "ne", "\u0905\u0928\u094d\u092f")
                        )),
                Map.of("id", "keys", "en", "Keys & Security", "ne", "\u0938\u093e\u0901\u091a\u094b \u0930 \u0938\u0941\u0930\u0915\u094d\u0937\u093e",
                        "subcategories", List.of(
                                Map.of("id", "house_keys", "en", "House Keys", "ne", "\u0918\u0930\u0915\u094b \u0938\u093e\u0901\u091a\u094b"),
                                Map.of("id", "vehicle_keys", "en", "Vehicle Keys", "ne", "\u0917\u093e\u0921\u0940\u0915\u094b \u0938\u093e\u0901\u091a\u094b"),
                                Map.of("id", "other", "en", "Other", "ne", "\u0905\u0928\u094d\u092f")
                        )),
                Map.of("id", "other", "en", "Others", "ne", "\u0905\u0928\u094d\u092f",
                        "subcategories", List.of(
                                Map.of("id", "misc", "en", "Miscellaneous", "ne", "\u0935\u093f\u0935\u093f\u0927"),
                                Map.of("id", "other", "en", "Other", "ne", "\u0905\u0928\u094d\u092f")
                        ))
        ));
    }

    @GetMapping("/office-data")
    @ResponseBody
    public ResponseEntity<?> office() {
        return ResponseEntity.ok(Map.of(
                "name", "Khoj Nepal Admin Office",
                "nameNe", "\u0916\u094b\u091c \u0928\u0947\u092a\u093e\u0932 \u092a\u094d\u0930\u0936\u093e\u0938\u0928 \u0915\u093e\u0930\u094d\u092f\u093e\u0932\u092f",
                "location", "New Baneshwor, Kathmandu",
                "locationNe", "\u0928\u092f\u093e\u0901 \u092c\u093e\u0928\u0947\u0936\u094d\u0935\u0930, \u0915\u093e\u0920\u092e\u093e\u0921\u094c",
                "hours", "Sun\u2013Fri: 10:00 AM \u2013 5:00 PM",
                "hoursNe", "\u0906\u0907\u0924\u2013\u0936\u0941\u0915\u094d\u0930: \u092c\u093f\u0939\u093e\u0928 १० \u2013 \u092c\u0947\u0932\u0941\u0915\u093e ५",
                "phone", "+977-1-5550123",
                "email", "office@khojnepal.com",
                "instructions", "Valuable found items should be submitted to the Admin Office. Do not hand over items directly to strangers.",
                "instructionsNe", "\u092e\u0939\u0924\u094d\u0924\u094d\u0935\u092a\u0942\u0930\u094d\u0923 \u092d\u0947\u091f\u093f\u090f\u0915\u093e \u0938\u093e\u092e\u093e\u0928 \u092a\u094d\u0930\u0936\u093e\u0938\u0928 \u0915\u093e\u0930\u094d\u092f\u093e\u0932\u092f\u092e\u093e \u092c\u0941\u091d\u093e\u0909\u0928\u0941\u0939\u094b\u0938\u094d\u0902\u0964 \u0905\u092a\u0930\u093f\u091a\u093f\u0924\u0932\u093e\u0908\u0932\u093e\u0938\u093f\u0927\u0948\u0928\u0926\u093f\u0928\u0941\u0939\u094b\u0938\u094d\u0902\u0964"
        ));
    }

    @GetMapping("/reward-levels")
    @ResponseBody
    public ResponseEntity<?> rewardLevels() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "bronze", "min", 0, "max", 99, "en", "Bronze Helper", "ne", "\u0915\u093e\u0902\u0938\u094d\u092f \u0938\u0939\u092f\u094b\u0917\u0940"),
                Map.of("id", "silver", "min", 100, "max", 249, "en", "Silver Finder", "ne", "\u0930\u091c\u0924 \u0916\u094b\u091c\u0915\u0930\u094d\u0924\u093e"),
                Map.of("id", "gold", "min", 250, "max", 499, "en", "Gold Guardian", "ne", "\u0938\u094d\u0935\u0930\u094d\u0923 \u0938\u0902\u0930\u0915\u094d\u0937\u0915"),
                Map.of("id", "hero", "min", 500, "max", 99999, "en", "Community Hero", "ne", "\u0938\u092e\u0941\u0926\u093e\u092f \u0928\u093e\u092f\u0915")
        ));
    }

    @GetMapping("/health")
    @ResponseBody
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "app", "KhojNepal"));
    }
}
