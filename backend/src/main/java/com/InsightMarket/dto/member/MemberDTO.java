package com.InsightMarket.dto.member;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import com.InsightMarket.domain.member.Member;

import lombok.Setter;
import lombok.ToString;
import lombok.Getter;

@Getter
@Setter
@ToString
public class MemberDTO extends User {

    private String email;
    private String name;
    private boolean isSocial;
    private List<String> roleNames;

    public MemberDTO(String email, String password, String name, boolean isSocial, List<String> roleNames) {
        super(email, password,
                roleNames.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList()));
        this.email = email;
        this.name = name;
        this.isSocial = isSocial;
        this.roleNames = roleNames;
    }

    // JWT 발급용 claims 제공
    public Map<String, Object> getClaims() {
        return Map.of(
                "email", email,
                "name", name,
                "social", isSocial,
                "roleNames", roleNames
        );
    }
}
