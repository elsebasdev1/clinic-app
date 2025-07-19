package ec.edu.ups.clinic.backend.dao;

import ec.edu.ups.clinic.backend.model.DoctorSchedule;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class DoctorScheduleDAO {

    @PersistenceContext
    private EntityManager em;

    public void insert(DoctorSchedule schedule) {
        em.persist(schedule);
    }

    public DoctorSchedule findById(Long id) {
        return em.find(DoctorSchedule.class, id);
    }

    public void update(DoctorSchedule schedule) {
        em.merge(schedule);
    }

    public void delete(Long id) {
        DoctorSchedule schedule = findById(id);
        if (schedule != null) {
            em.remove(schedule);
        }
    }

    public List<DoctorSchedule> getAll() {
        return em.createQuery("SELECT ds FROM DoctorSchedule ds", DoctorSchedule.class).getResultList();
    }

    public List<DoctorSchedule> getByDoctorId(Long doctorId) {
        return em.createQuery(
            "SELECT ds FROM DoctorSchedule ds WHERE ds.doctor.id = :doctorId",
            DoctorSchedule.class
        ).setParameter("doctorId", doctorId).getResultList();
    }
}
