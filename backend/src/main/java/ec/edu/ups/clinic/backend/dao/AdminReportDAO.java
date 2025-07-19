package ec.edu.ups.clinic.backend.dao;

import ec.edu.ups.clinic.backend.model.AdminReport;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

@Stateless
public class AdminReportDAO {

    @PersistenceContext
    private EntityManager em;

    public List<AdminReport> getAppointmentsByDoctor() {
        return em.createQuery(
                "SELECT new ec.edu.ups.clinic.backend.model.AdminReport(a.doctor.name, COUNT(a)) " +
                "FROM Appointment a GROUP BY a.doctor.name", AdminReport.class)
                .getResultList();
    }

    public List<AdminReport> getAppointmentsBySpecialty() {
        return em.createQuery(
                "SELECT new ec.edu.ups.clinic.backend.model.AdminReport(a.specialty, COUNT(a)) " +
                "FROM Appointment a GROUP BY a.specialty", AdminReport.class)
                .getResultList();
    }

    public List<AdminReport> getAppointmentsByDate() {
        List<Object[]> results = em.createQuery(
            "SELECT CAST(a.dateTime AS date), COUNT(a) FROM Appointment a GROUP BY CAST(a.dateTime AS date)",
            Object[].class).getResultList();

        return results.stream()
                .map(r -> new AdminReport(r[0].toString(), (Long) r[1]))
                .toList();
    }
}
