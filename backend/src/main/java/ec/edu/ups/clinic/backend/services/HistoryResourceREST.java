package ec.edu.ups.clinic.backend.services;

import ec.edu.ups.clinic.backend.model.Appointment;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.util.List;

@Path("/history")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class HistoryResourceREST {

    @Inject
    private AppointmentServiceREST appointmentService;

    @GET
    @Path("/patient/{patientId}")
    public Response getPastAppointmentsByPatient(@PathParam("patientId") Long patientId) {
        List<Appointment> pastAppointments = appointmentService.getPastAppointmentsByPatient(patientId);
        return Response.ok(pastAppointments).build();
    }

    @GET
    @Path("/doctor/{doctorId}")
    public Response getPastAppointmentsByDoctor(@PathParam("doctorId") Long doctorId) {
        List<Appointment> pastAppointments = appointmentService.getPastAppointmentsByDoctor(doctorId);
        return Response.ok(pastAppointments).build();
    }

    @GET
    @Path("/filter")
    public Response filterAppointments(
        @QueryParam("from") String fromDate,
        @QueryParam("to") String toDate,
        @QueryParam("specialty") String specialty,
        @QueryParam("status") String status
    ) {
        LocalDateTime from = fromDate != null ? LocalDateTime.parse(fromDate) : null;
        LocalDateTime to = toDate != null ? LocalDateTime.parse(toDate) : null;
        List<Appointment> results = appointmentService.filterAppointments(from, to, specialty, status);
        return Response.ok(results).build();
    }
}
