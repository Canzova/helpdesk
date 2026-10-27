package com.spring.ai.helpdesk.helpdesk.controller;

import com.spring.ai.helpdesk.helpdesk.Dto.TicketInputRequest;
import com.spring.ai.helpdesk.helpdesk.Dto.TicketResponse;
import com.spring.ai.helpdesk.helpdesk.entity.Ticket;
import com.spring.ai.helpdesk.helpdesk.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping("/create")
    public ResponseEntity<TicketResponse> createTicket(@RequestBody @Valid TicketInputRequest ticket) {
        return new ResponseEntity<>(ticketService.createTicket(ticket), HttpStatus.CREATED);
    }

    @GetMapping("/id")
    public ResponseEntity<TicketResponse> getTicketById(@RequestParam(name = "id", required = true) Long id) {
        return new ResponseEntity<>(ticketService.getTicketById(id), HttpStatus.OK);
    }


    @GetMapping("/email")
    public ResponseEntity<TicketResponse> getTicketByEmail(@RequestParam(name = "email", required = true) String email) {
        return new ResponseEntity<>(ticketService.getTicketByEmail(email), HttpStatus.OK);
    }

}
