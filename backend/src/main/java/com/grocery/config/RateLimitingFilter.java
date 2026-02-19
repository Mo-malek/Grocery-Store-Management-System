package com.grocery.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple IP-based rate limiting filter.
 * Limits each IP to 100 requests per minute.
 */
@Component
public class RateLimitingFilter implements Filter {

    private final Map<String, UserRequestInfo> requestCounts = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 100;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (!(request instanceof HttpServletRequest httpRequest)) {
            chain.doFilter(request, response);
            return;
        }

        String ip = httpRequest.getRemoteAddr();
        long now = System.currentTimeMillis();

        UserRequestInfo info = requestCounts.compute(ip, (key, val) -> {
            if (val == null || (now - val.startTime) > TimeUnit.MINUTES.toMillis(1)) {
                return new UserRequestInfo(now, new AtomicInteger(1));
            }
            val.count.incrementAndGet();
            return val;
        });

        if (info.count.get() > MAX_REQUESTS_PER_MINUTE) {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.setContentType("application/json");
            httpResponse.setCharacterEncoding("UTF-8");
            httpResponse.getWriter().write("{\"error\": \"تم تجاوز حد الطلبات المسموح به. يرجى المحاولة بعد دقيقة.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private static class UserRequestInfo {
        long startTime;
        AtomicInteger count;

        UserRequestInfo(long startTime, AtomicInteger count) {
            this.startTime = startTime;
            this.count = count;
        }
    }
}
