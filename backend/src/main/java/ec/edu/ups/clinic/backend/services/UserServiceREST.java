package ec.edu.ups.clinic.backend.services;

import ec.edu.ups.clinic.backend.dao.UserDAO;
import ec.edu.ups.clinic.backend.model.User;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

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
    public Response updateUser(@PathParam("id") Long id, User partialUser) {
        User existingUser = userDAO.findById(id);

        if (existingUser == null) {
            return Response.status(Response.Status.NOT_FOUND)
                           .entity("Usuario no encontrado").build();
        }

        if (partialUser.getRole() != null) existingUser.setRole(partialUser.getRole());
        if (partialUser.getName() != null) existingUser.setName(partialUser.getName());
        if (partialUser.getAddress() != null) existingUser.setAddress(partialUser.getAddress());
        if (partialUser.getPhone() != null) existingUser.setPhone(partialUser.getPhone());

        userDAO.update(existingUser);

        return Response.ok(existingUser).build();
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
