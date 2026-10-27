package com.spring.ai.helpdesk.helpdesk.repository;

import com.spring.ai.helpdesk.helpdesk.entity.Ticket;
import org.hibernate.boot.models.JpaAnnotations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByEmail(String email);
}
