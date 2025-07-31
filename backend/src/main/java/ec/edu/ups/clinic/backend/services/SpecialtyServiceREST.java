package ec.edu.ups.clinic.backend.services;

import ec.edu.ups.clinic.backend.dao.AppointmentDAO;
import ec.edu.ups.clinic.backend.dao.SpecialtyDAO;
import ec.edu.ups.clinic.backend.model.Appointment;
import ec.edu.ups.clinic.backend.model.Specialty;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/specialties")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SpecialtyServiceREST {

    @Inject
    private SpecialtyDAO specialtyDAO;
    
    @Inject
    private AppointmentDAO appointmentDAO;
    @GET
    public List<Specialty> list() {
        return specialtyDAO.getAll();
    }

    @GET
    @Path("/{id}")
    public Specialty getById(@PathParam("id") Long id) {
        return specialtyDAO.findById(id);
    }

    @POST
    public void create(Specialty specialty) {
        specialtyDAO.insert(specialty);
    }

    @PUT
    @Path("/{id}")
    public void update(@PathParam("id") Long id, Specialty specialty) {
        specialty.setId(id);
        specialtyDAO.update(specialty);
    }

    @DELETE
    @Path("/{id}")
    public void delete(@PathParam("id") Long id) {
        List<Appointment> citas = appointmentDAO.findBySpecialtyId(id);
        if (!citas.isEmpty()) {
            throw new WebApplicationException("No se puede eliminar: especialidad con citas agendadas", 400);
        }
        specialtyDAO.delete(id);
    }

}