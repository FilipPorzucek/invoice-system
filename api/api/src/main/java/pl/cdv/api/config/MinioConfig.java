package pl.cdv.api.config;

import io.minio.MinioClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Bean
    public MinioClient minioClient(){
        return MinioClient.builder()
                .endpoint("http://localhost:9000") // Adres API Twojego MinIO
                .credentials("admin_super_user", "TrudneHasloProdukcyjne123!") // Login i hasło (domyślne w Dockerze)
                .build();
     }
    }

