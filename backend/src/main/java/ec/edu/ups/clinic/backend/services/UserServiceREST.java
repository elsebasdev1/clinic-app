package ec.edu.ups.clinic.backend.services;

import ec.edu.ups.clinic.backend.dao.UserDAO;
import ec.edu.ups.clinic.backend.model.User;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserServiceREST {

    @Inject
    private UserDAO userDAO;

    @GET
    public List<User> getAllUsers() {
        return userDAO.findAll();
    }

    @GET
    @Path("/{id}")
    public User getUserById(@PathParam("id") Long id) {
        return userDAO.findById(id);
    }

    @POST
    public void createUser(User user) {
        userDAO.insert(user);
    }

    @PUT
    @Path("/{id}")
    public void updateUser(@PathParam("id") Long id, User user) {
        user.setId(id);
        userDAO.update(user);
    }

    @DELETE
    @Path("/{id}")
    public void deleteUser(@PathParam("id") Long id) {
        userDAO.delete(id);
    }

    @GET
    @Path("/by-email")
    public User getUserByEmail(@QueryParam("email") String email) {
        return userDAO.findByEmail(email);
    }
}
