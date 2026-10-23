package pl.cdv.api.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Value("${minio.url}")
    private String minioUrl;

    @Bean
    public MinioClient minioClient(){
        return MinioClient.builder()
                .endpoint(minioUrl)
                .credentials("admin_super_user", "TrudneHasloProdukcyjne123!")
                .build();
     }
    }

