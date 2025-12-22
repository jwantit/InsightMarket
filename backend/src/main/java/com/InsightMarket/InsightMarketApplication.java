package com.InsightMarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing//시간
public class InsightMarketApplication {

	public static void main(String[] args) {
		SpringApplication.run(InsightMarketApplication.class, args);
	}

}
