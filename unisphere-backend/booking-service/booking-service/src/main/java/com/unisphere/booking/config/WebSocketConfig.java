package com.unisphere.booking.config;

// 🚀 මෙම Import එක නිවැරදිව තියෙනවාද බලන්න
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Backend එකෙන් Frontend එකට message යවන path එක
        config.enableSimpleBroker("/topic");

        // Frontend එකෙන් Backend එකට message එවනවා නම් prefix එක (Optional for now)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Next.js app එක connect වෙන්න ඕනේ endpoint එක
        registry.addEndpoint("/ws-booking")
                .setAllowedOrigins("http://localhost:3000") // Frontend URL එක
                .withSockJS();
    }
}