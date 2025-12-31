package com.InsightMarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing//시간
@EnableScheduling
public class InsightMarketApplication {

	public static void main(String[] args) {
		SpringApplication.run(InsightMarketApplication.class, args);
	}

}
