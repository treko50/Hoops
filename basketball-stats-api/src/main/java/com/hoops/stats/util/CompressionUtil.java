package com.hoops.stats.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.*;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

/**
 * Compression Utility
 * Handles GZIP compression/decompression for large JSON files
 */
@Slf4j
@Component
public class CompressionUtil {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Compress object to GZIP bytes
     */
    public byte[] compressToGzip(Object data) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (GZIPOutputStream gzipOut = new GZIPOutputStream(baos)) {
            String json = objectMapper.writeValueAsString(data);
            gzipOut.write(json.getBytes("UTF-8"));
        }

        byte[] compressed = baos.toByteArray();
        log.info("Compressed data from {} bytes to {} bytes ({}% reduction)",
                objectMapper.writeValueAsString(data).getBytes().length,
                compressed.length,
                100 - (compressed.length * 100 / objectMapper.writeValueAsString(data).getBytes().length));

        return compressed;
    }

    /**
     * Decompress GZIP bytes to object
     */
    public <T> T decompressFromGzip(byte[] compressed, Class<T> type) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (GZIPInputStream gzipIn = new GZIPInputStream(new ByteArrayInputStream(compressed))) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = gzipIn.read(buffer)) > 0) {
                baos.write(buffer, 0, len);
            }
        }

        String json = baos.toString("UTF-8");
        log.info("Decompressed data from {} bytes to {} bytes",
                compressed.length, json.getBytes().length);

        return objectMapper.readValue(json, type);
    }

    /**
     * Compress object to GZIP bytes (InputStream version)
     */
    public InputStream compressToGzipStream(Object data) throws IOException {
        byte[] compressed = compressToGzip(data);
        return new ByteArrayInputStream(compressed);
    }

    /**
     * Decompress GZIP InputStream to object
     */
    public <T> T decompressFromGzipStream(InputStream gzipStream, Class<T> type) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (GZIPInputStream gzipIn = new GZIPInputStream(gzipStream)) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = gzipIn.read(buffer)) > 0) {
                baos.write(buffer, 0, len);
            }
        }

        String json = baos.toString("UTF-8");
        return objectMapper.readValue(json, type);
    }

    /**
     * Check if compression is beneficial (only if > 10MB uncompressed)
     */
    public boolean shouldCompress(Object data) throws IOException {
        String json = objectMapper.writeValueAsString(data);
        long sizeInBytes = json.getBytes("UTF-8").length;
        long sizeInMB = sizeInBytes / (1024 * 1024);

        log.info("Data size: {} MB", sizeInMB);
        return sizeInMB > 10;
    }

    /**
     * Get uncompressed size in MB
     */
    public double getUncompressedSizeMB(Object data) throws IOException {
        String json = objectMapper.writeValueAsString(data);
        return json.getBytes("UTF-8").length / (1024.0 * 1024.0);
    }

    /**
     * Get compressed size in MB
     */
    public double getCompressedSizeMB(Object data) throws IOException {
        byte[] compressed = compressToGzip(data);
        return compressed.length / (1024.0 * 1024.0);
    }
}
