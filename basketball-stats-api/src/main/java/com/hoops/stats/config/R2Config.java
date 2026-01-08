package com.hoops.stats.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

/**
 * Cloudflare R2 Configuration
 * S3-compatible object storage with FREE tier
 */
@Slf4j
@Configuration
public class R2Config {

    @Value("${r2.endpoint:}")
    private String r2Endpoint;

    @Value("${r2.access-key:}")
    private String accessKey;

    @Value("${r2.secret-key:}")
    private String secretKey;

    @Value("${r2.bucket-name:basketball-stats}")
    private String bucketName;

    @Value("${r2.enabled:false}")
    private boolean r2Enabled;

    /**
     * Create S3Client configured for Cloudflare R2
     * R2 uses S3-compatible API - same SDK, different endpoint!
     */
    @Bean
    public S3Client r2Client() {
        if (!r2Enabled) {
            log.warn("R2 is disabled. Set r2.enabled=true to enable R2 storage.");
            return null;
        }

        if (r2Endpoint == null || r2Endpoint.isEmpty()) {
            log.error("R2 endpoint not configured! Set r2.endpoint in application.properties");
            return null;
        }

        try {
            AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

            S3Client client = S3Client.builder()
                    .endpointOverride(URI.create(r2Endpoint))
                    .credentialsProvider(StaticCredentialsProvider.create(credentials))
                    .region(Region.of("auto")) // R2 uses "auto" region
                    .build();

            log.info("Cloudflare R2 client initialized successfully");
            log.info("Endpoint: {}", r2Endpoint);
            log.info("Bucket: {}", bucketName);

            return client;

        } catch (Exception e) {
            log.error("Failed to initialize R2 client", e);
            throw new RuntimeException("R2 initialization failed", e);
        }
    }

    public String getBucketName() {
        return bucketName;
    }
}
