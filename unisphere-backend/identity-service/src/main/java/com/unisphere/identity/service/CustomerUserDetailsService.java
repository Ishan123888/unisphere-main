package com.unisphere.identity.service;

import com.unisphere.identity.entity.UserCredential;
import com.unisphere.identity.repository.UserCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service // අනිවාර්යයෙන් තිබිය යුතුයි
public class CustomerUserDetailsService implements UserDetailsService {

    @Autowired
    private UserCredentialRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<UserCredential> user = repository.findByUsername(username);

        // DB එකේ user ඉන්නවා නම් එයාගේ විස්තර Spring වලට හඳුනාගත හැකි UserDetails object එකක් විදිහට දෙනවා
        return user.map(CustomerUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}