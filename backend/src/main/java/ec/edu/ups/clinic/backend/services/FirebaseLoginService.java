package ec.edu.ups.clinic.backend.services;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import ec.edu.ups.clinic.backend.dao.UserDAO;
import ec.edu.ups.clinic.backend.model.User;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FirebaseLoginService {

    @Inject
    private UserDAO userDAO;

    @POST
    @Path("/login")
    public Response loginWithFirebase(@HeaderParam("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Falta el token Authorization").build();
        }

        String idToken = authHeader.substring(7); // Remover "Bearer "
        try {
            // Validar token con Firebase Admin SDK
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();
            String name = decodedToken.getName();

            if (email == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Token inválido: no contiene email").build();
            }

            // Buscar usuario en PostgreSQL
            User user = userDAO.findByEmail(email);
            if (user == null) {
                // Si no existe, lo creamos
                user = new User();
                user.setEmail(email.toLowerCase());
                user.setName(name != null ? name : "Usuario sin nombre");
                user.setRole("admin"); // Por defecto, puedes ajustar
                userDAO.insert(user);
            }

            // Retornar el usuario (ya sea nuevo o existente)
            return Response.ok(user).build();

        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Token inválido o expirado").build();
        }
    }
}
