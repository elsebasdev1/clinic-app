package ec.edu.ups.clinic.backend.dao;

import ec.edu.ups.clinic.backend.model.Appointment;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import java.time.LocalDateTime;
import java.util.List;

@Stateless
public class AppointmentDAO {

    @PersistenceContext
    private EntityManager em;

    public void insert(Appointment appointment) {
        em.persist(appointment);
    }

    public Appointment findById(Long id) {
        return em.find(Appointment.class, id);
    }

    public void update(Appointment appointment) {
        em.merge(appointment);
    }

    public void delete(Long id) {
        Appointment appointment = findById(id);
        if (appointment != null) {
            em.remove(appointment);
        }
    }

    public List<Appointment> getAll() {
        return em.createQuery("SELECT a FROM Appointment a", Appointment.class).getResultList();
    }

    // ✅ Citas pasadas por paciente
    public List<Appointment> findPastByPatientId(Long patientId) {
        String jpql = "SELECT a FROM Appointment a WHERE a.patient.id = :id AND a.dateTime < :now";
        return em.createQuery(jpql, Appointment.class)
                 .setParameter("id", patientId)
                 .setParameter("now", LocalDateTime.now())
                 .getResultList();
    }

    // ✅ Citas pasadas por doctor
    public List<Appointment> findPastByDoctorId(Long doctorId) {
        String jpql = "SELECT a FROM Appointment a WHERE a.doctor.id = :id AND a.dateTime < :now";
        return em.createQuery(jpql, Appointment.class)
                 .setParameter("id", doctorId)
                 .setParameter("now", LocalDateTime.now())
                 .getResultList();
    }

    // ✅ Filtro por fecha, especialidad, estado (todos opcionales)
    public List<Appointment> filterAppointments(LocalDateTime from, LocalDateTime to, String specialty, String status) {
        StringBuilder jpql = new StringBuilder("SELECT a FROM Appointment a WHERE 1=1");
        if (from != null) {
            jpql.append(" AND a.dateTime >= :from");
        }
        if (to != null) {
            jpql.append(" AND a.dateTime <= :to");
        }
        if (specialty != null && !specialty.isEmpty()) {
            jpql.append(" AND a.specialty = :specialty");
        }
        if (status != null && !status.isEmpty()) {
            jpql.append(" AND a.status = :status");
        }

        TypedQuery<Appointment> query = em.createQuery(jpql.toString(), Appointment.class);

        if (from != null) {
            query.setParameter("from", from);
        }
        if (to != null) {
            query.setParameter("to", to);
        }
        if (specialty != null && !specialty.isEmpty()) {
            query.setParameter("specialty", specialty);
        }
        if (status != null && !status.isEmpty()) {
            query.setParameter("status", status);
        }

        return query.getResultList();
    }
}
