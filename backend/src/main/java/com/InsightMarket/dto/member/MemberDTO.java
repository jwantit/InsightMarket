package com.InsightMarket.dto.member;

import java.util.HashMap;
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

    public MemberDTO(String email, String password, String name, boolean isSocial, String roleName) {
        super(email, password, List.of(new SimpleGrantedAuthority("ROLE_" + roleName)));
        this.email = email;
        this.name = name;
        this.isSocial = isSocial;
        this.roleNames = List.of(roleName);
    }

    // JWT 발급용 claims 제공
    public Map<String, Object> getClaims() {

        Map<String, Object> dataMap = new HashMap<>();

        dataMap.put("email", email);
        dataMap.put("name", name);
        dataMap.put("isSocial", isSocial);
        dataMap.put("role", roleNames.get(0));

        return dataMap;
    }
}
