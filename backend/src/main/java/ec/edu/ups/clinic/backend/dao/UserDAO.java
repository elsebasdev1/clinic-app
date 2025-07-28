package ec.edu.ups.clinic.backend.dao;

import ec.edu.ups.clinic.backend.model.User;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class UserDAO {

    @PersistenceContext
    private EntityManager em;

    public void insert(User user) {
        try {
            em.persist(user);
            System.out.println("✅ Usuario insertado: " + user.getEmail());
        } catch (Exception e) {
            e.printStackTrace(); // Asegúrate de ver errores en consola
        }
    }


    public User findById(Long id) {
        return em.find(User.class, id);
    }

    public void update(User user) {
        em.merge(user);
    }

    public void delete(Long id) {
        User user = findById(id);
        if (user != null) {
            em.remove(user);
        }
    }

    public List<User> findAll() {
        return em.createQuery("SELECT u FROM User u", User.class).getResultList();
    }

    public User findByEmail(String email) {
        try {
            return em.createQuery("SELECT u FROM User u WHERE LOWER(u.email) = :email", User.class)
                     .setParameter("email", email.toLowerCase())
                     .getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

    public List<User> findByRole(String role) {
        return em.createQuery("SELECT u FROM User u WHERE u.role = :role", User.class)
                 .setParameter("role", role)
                 .getResultList();
    }

}
