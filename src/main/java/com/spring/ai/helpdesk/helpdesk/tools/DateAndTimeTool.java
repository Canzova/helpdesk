package com.spring.ai.helpdesk.helpdesk.tools;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Component
public class DateAndTimeTool {

    @Tool(description = "Use this tool whenever the user asks about the current date and time, or what time or day it is right now. Returns current date and time in IST (India Standard Time).")
    public String getCurrentDateAndTime() {
        ZoneId ist = ZoneId.of("Asia/Kolkata");
        return Instant.now()
                .atZone(ist)
                .format(DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy HH:mm:ss z"));
    }

    @Tool(description = "Use this tool whenever the user asks what today's date is. Returns today's date in IST (India Standard Time).")
    public String getLocalDate() {
        return LocalDate.now(ZoneId.of("Asia/Kolkata"))
                .format(DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy"));
    }

    @Tool(description = "Use this tool whenever the user asks what the current time is. Returns current time in IST (India Standard Time).")
    public String getLocalTime() {
        return LocalTime.now(ZoneId.of("Asia/Kolkata"))
                .format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }

}
