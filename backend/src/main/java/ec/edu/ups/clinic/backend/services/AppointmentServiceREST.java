package ec.edu.ups.clinic.backend.services;

import ec.edu.ups.clinic.backend.dao.AppointmentDAO;
import ec.edu.ups.clinic.backend.model.Appointment;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.time.LocalDateTime;
import java.util.List;

@Path("/appointments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AppointmentServiceREST {

    @Inject
    private AppointmentDAO appointmentDAO;

    @GET
    public List<Appointment> getAllAppointments() {
        return appointmentDAO.getAll();
    }

    @GET
    @Path("/{id}")
    public Appointment getAppointmentById(@PathParam("id") Long id) {
        return appointmentDAO.findById(id);
    }

    @POST
    public void createAppointment(Appointment appointment) {
        appointmentDAO.insert(appointment);
    }

    @PUT
    @Path("/{id}")
    public void updateAppointment(@PathParam("id") Long id, Appointment appointment) {
        appointment.setId(id);
        appointmentDAO.update(appointment);
    }

    @DELETE
    @Path("/{id}")
    public void deleteAppointment(@PathParam("id") Long id) {
        appointmentDAO.delete(id);
    }
    
    public List<Appointment> getPastAppointmentsByPatient(Long patientId) {
        return appointmentDAO.findPastByPatientId(patientId);
    }

    public List<Appointment> getPastAppointmentsByDoctor(Long doctorId) {
        return appointmentDAO.findPastByDoctorId(doctorId);
    }

    public List<Appointment> filterAppointments(LocalDateTime from, LocalDateTime to, String specialty, String status) {
        return appointmentDAO.filterAppointments(from, to, specialty, status);
    }

}
