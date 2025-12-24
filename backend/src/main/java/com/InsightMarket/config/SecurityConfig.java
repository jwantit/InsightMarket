package com.InsightMarket.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.InsightMarket.security.filter.JWTCheckFilter;
import com.InsightMarket.security.handler.LoginFailHandler;
import com.InsightMarket.security.handler.LoginSuccessHandler;
import com.InsightMarket.security.handler.LoginAccessDeniedHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Configuration
@Log4j2
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        log.info("---------------------security config---------------------------");

        http.cors(httpSecurityCorsConfigurer -> {
            httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource());
        });

        http.sessionManagement(sessionConfig -> sessionConfig.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.csrf(config -> config.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll()  // 개발 중 전부 오픈
                        .anyRequest().permitAll()
                );;

        http.formLogin(config -> {
            config.loginPage("/member/login");
            config.successHandler(new LoginSuccessHandler());
            config.failureHandler(new LoginFailHandler());
        });

        // http.addFilterBefore(new JWTCheckFilter(), UsernamePasswordAuthenticationFilter.class); // JWT 체크

        // 인증은 됐는데 권한이 없을 때 실행되는 핸들러, @PreAuthorize("hasRole('ADMIN')") 로 설정된 주소에 'user' 가 접근 시 발생
        http.exceptionHandling(config -> {
            config.accessDeniedHandler(new LoginAccessDeniedHandler());
        });
        return http.build();
    }

    // Spring Security / Spring MVC에서 CORS(Cross-Origin Resource Sharing) 정책을 정의하는 설정
    // 프론트엔드(다른 출처)에서 우리 백엔드 API를 호출해도 되게 허용 규칙을 정한 것
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("HEAD", "GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}