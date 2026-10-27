package com.spring.ai.helpdesk.helpdesk.service;

import com.spring.ai.helpdesk.helpdesk.Dto.TicketInputRequest;
import com.spring.ai.helpdesk.helpdesk.Dto.TicketResponse;
import com.spring.ai.helpdesk.helpdesk.entity.Ticket;
import com.spring.ai.helpdesk.helpdesk.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final ModelMapper modelMapper;

    @Override
    public TicketResponse createTicket(TicketInputRequest ticket) {

        // Step 1 : Convert into entity
        Ticket ticketEntity = modelMapper.map(ticket, Ticket.class);

        // Step 2 : Save
        ticketRepository.save(ticketEntity);

        // Step 3 : Return dto
        return modelMapper.map(ticketEntity, TicketResponse.class);
    }

    @Override
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id).orElse(null);
        return modelMapper.map(ticket, TicketResponse.class);
    }

    @Override
    public TicketResponse getTicketByEmail(String email) {
        Ticket ticket = ticketRepository.findByEmail(email).orElse(null);
        return modelMapper.map(ticket, TicketResponse.class);
    }
}
