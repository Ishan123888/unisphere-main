package com.unisphere.booking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PayHereController {

    // ⚠ Move these to application.properties / environment variables in production
    private static final String MERCHANT_ID     = "1235116";
    private static final String MERCHANT_SECRET = "dataI123@#"; // replace this

    /**
     * POST /api/payments/hash
     * Body: { "orderId": "USP-xxx", "amount": 2625, "currency": "LKR" }
     * Returns: { "hash": "XXXXXX", "merchantId": "1235116" }
     */
    @PostMapping("/hash")
    public ResponseEntity<?> generateHash(@RequestBody Map<String, Object> body) {
        try {
            String orderId   = String.valueOf(body.get("orderId"));
            int    amountInt = Integer.parseInt(String.valueOf(body.get("amount")));
            String currency  = String.valueOf(body.getOrDefault("currency", "LKR"));

            // PayHere expects amount as "2625.00" format
            String amountFormatted = new BigDecimal(amountInt)
                    .setScale(2, RoundingMode.HALF_UP)
                    .toPlainString();

            // Hash = MD5(merchant_id + order_id + amount + currency + MD5(secret).toUpperCase())
            String secretHash = md5(MERCHANT_SECRET).toUpperCase();
            String raw        = MERCHANT_ID + orderId + amountFormatted + currency + secretHash;
            String hash       = md5(raw).toUpperCase();

            return ResponseEntity.ok(Map.of(
                    "hash",       hash,
                    "merchantId", MERCHANT_ID,
                    "amount",     amountFormatted,
                    "currency",   currency,
                    "orderId",    orderId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/payments/notify  (PayHere server-to-server callback)
     */
    @PostMapping("/notify")
    public ResponseEntity<String> notify(@RequestParam Map<String, String> params) {
        // TODO: verify md5sig, update booking status in DB
        System.out.println("PayHere notify: " + params);
        return ResponseEntity.ok("OK");
    }

    // ── MD5 helper ──────────────────────────────────────────
    private String md5(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] bytes     = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}