package com.spring.ai.helpdesk.helpdesk.service;

import com.spring.ai.helpdesk.helpdesk.Dto.TicketInputRequest;
import com.spring.ai.helpdesk.helpdesk.Dto.TicketResponse;
import com.spring.ai.helpdesk.helpdesk.Dto.TicketUpdateRequest;
import com.spring.ai.helpdesk.helpdesk.entity.Status;
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
        Ticket ticketEntity = modelMapper.map(ticket, Ticket.class);
        ticketEntity.setStatus(Status.OPEN);
        Ticket savedTicket = ticketRepository.save(ticketEntity);
        return modelMapper.map(savedTicket, TicketResponse.class);
    }

    @Override
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id).orElse(null);
        if (ticket == null) return null;
        return modelMapper.map(ticket, TicketResponse.class);
    }

    @Override
    public TicketResponse getTicketByEmail(String email) {
        Ticket ticket = ticketRepository.findByEmail(email).orElse(null);
        if (ticket == null) return null;
        return modelMapper.map(ticket, TicketResponse.class);
    }

    @Override
    public TicketResponse updateTicket(Long id, TicketUpdateRequest updateRequest) {
        Ticket ticket = ticketRepository.findById(id).orElse(null);
        if (ticket == null) return null;

        if (updateRequest.getIssueSummary() != null) ticket.setIssueSummary(updateRequest.getIssueSummary());
        if (updateRequest.getPriority() != null) ticket.setPriority(updateRequest.getPriority());
        if (updateRequest.getStatus() != null) ticket.setStatus(updateRequest.getStatus());
        if (updateRequest.getCategory() != null) ticket.setCategory(updateRequest.getCategory());
        if (updateRequest.getUserContactNumber() != null) ticket.setUserContactNumber(updateRequest.getUserContactNumber());

        Ticket updatedTicket = ticketRepository.save(ticket);
        return modelMapper.map(updatedTicket, TicketResponse.class);
    }
}
