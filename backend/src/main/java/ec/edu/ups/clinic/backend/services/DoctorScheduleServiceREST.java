package ec.edu.ups.clinic.backend.services;

import ec.edu.ups.clinic.backend.dao.DoctorScheduleDAO;
import ec.edu.ups.clinic.backend.model.DoctorSchedule;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/schedules")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DoctorScheduleServiceREST {

    @Inject
    private DoctorScheduleDAO scheduleDAO;

    @GET
    public List<DoctorSchedule> listAll() {
        return scheduleDAO.getAll();
    }

    @GET
    @Path("/doctor/{id}")
    public List<DoctorSchedule> getByDoctor(@PathParam("id") Long doctorId) {
        return scheduleDAO.getByDoctorId(doctorId);
    }

    @POST
    public void create(DoctorSchedule schedule) {
        scheduleDAO.insert(schedule);
    }

    @PUT
    public void update(DoctorSchedule schedule) {
        scheduleDAO.update(schedule);
    }

    @DELETE
    @Path("/{id}")
    public void delete(@PathParam("id") Long id) {
        scheduleDAO.delete(id);
    }
}
