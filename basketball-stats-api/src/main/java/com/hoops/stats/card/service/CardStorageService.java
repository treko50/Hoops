package com.hoops.stats.card.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoops.stats.card.model.PlayerCard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.zip.GZIPInputStream;

/**
 * Card Storage Service
 * Retrieves compressed cards from R2
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CardStorageService {

    private final S3Client s3Client;
    private final ObjectMapper objectMapper;

    private static final String BUCKET_NAME = "hoops";
    private static final String CARDS_PREFIX = "cards/";

    /**
     * Retrieve all cards for a player from R2
     */
    public Optional<Map<String, PlayerCard>> getPlayerCards(String season, String playerId) {
        String key = CARDS_PREFIX + season + "/" + playerId + ".json.gz";

        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(key)
                    .build();

            ResponseInputStream<?> response = s3Client.getObject(getRequest);
            byte[] compressedData = response.readAllBytes();

            // Decompress GZIP data
            byte[] decompressedData = decompressData(compressedData);

            // Parse JSON
            String json = new String(decompressedData);
            Map<String, PlayerCard> cards = objectMapper.readValue(json,
                    new TypeReference<Map<String, PlayerCard>>() {});

            log.debug("Retrieved {} cards for {} from R2 (decompressed {} bytes)",
                    cards.size(), playerId, decompressedData.length);

            return Optional.of(cards);

        } catch (NoSuchKeyException e) {
            log.debug("Cards not found for player {} in season {}", playerId, season);
            return Optional.empty();

        } catch (Exception e) {
            log.error("Error retrieving cards for player {}: {}", playerId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Retrieve specific card type for a player
     */
    public Optional<PlayerCard> getPlayerCard(String season, String playerId, String cardType) {
        Optional<Map<String, PlayerCard>> allCards = getPlayerCards(season, playerId);

        if (allCards.isEmpty()) {
            return Optional.empty();
        }

        return Optional.ofNullable(allCards.get().get(cardType.toUpperCase()));
    }

    /**
     * Decompress GZIP data
     */
    private byte[] decompressData(byte[] compressedData) throws IOException {
        ByteArrayInputStream byteStream = new ByteArrayInputStream(compressedData);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try (GZIPInputStream gzipStream = new GZIPInputStream(byteStream)) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = gzipStream.read(buffer)) > 0) {
                outputStream.write(buffer, 0, len);
            }
        }

        return outputStream.toByteArray();
    }

    /**
     * Check if cards exist for a player
     */
    public boolean cardsExist(String season, String playerId) {
        String key = CARDS_PREFIX + season + "/" + playerId + ".json.gz";

        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(key)
                    .build();

            s3Client.getObject(getRequest).close();
            return true;

        } catch (NoSuchKeyException e) {
            return false;

        } catch (Exception e) {
            log.error("Error checking if cards exist for {}: {}", playerId, e.getMessage());
            return false;
        }
    }

    /**
     * Get card with fallback to live generation
     */
    public PlayerCard getOrGenerateCard(String season, String playerId, String cardType,
                                        CardGenerationService cardService) {
        // Try to get from R2 first
        Optional<PlayerCard> stored = getPlayerCard(season, playerId, cardType);
        if (stored.isPresent()) {
            log.debug("Retrieved {} card for {} from R2 cache", cardType, playerId);
            return stored.get();
        }

        // Generate on-the-fly if not in R2
        log.debug("Generating {} card for {} on-the-fly (not in R2)", cardType, playerId);
        if ("BASE".equalsIgnoreCase(cardType)) {
            return cardService.generateBaseCard(playerId);
        } else {
            PlayerCard.CardType type = PlayerCard.CardType.valueOf(cardType.toUpperCase());
            return cardService.generateSpecialCard(playerId, type);
        }
    }
}
