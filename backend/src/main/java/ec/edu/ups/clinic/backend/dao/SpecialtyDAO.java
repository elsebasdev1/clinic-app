package ec.edu.ups.clinic.backend.dao;

import ec.edu.ups.clinic.backend.model.Specialty;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class SpecialtyDAO {

    @PersistenceContext
    private EntityManager em;

    public void insert(Specialty specialty) {
        em.persist(specialty);
    }

    public Specialty findById(Long id) {
        return em.find(Specialty.class, id);
    }

    public void update(Specialty specialty) {
        em.merge(specialty);
    }

    public void delete(Long id) {
        Specialty s = findById(id);
        if (s != null) {
            em.remove(s);
        }
    }

    public List<Specialty> getAll() {
        return em.createQuery("SELECT s FROM Specialty s", Specialty.class).getResultList();
    }
    
    public Specialty findByName(String name) {
        try {
            return em.createQuery("SELECT s FROM Specialty s WHERE s.name = :name", Specialty.class)
                     .setParameter("name", name)
                     .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

}
