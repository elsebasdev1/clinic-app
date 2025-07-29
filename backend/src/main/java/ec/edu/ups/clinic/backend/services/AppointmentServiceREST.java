package ec.edu.ups.clinic.backend.services;

import ec.edu.ups.clinic.backend.dao.AppointmentDAO;
import ec.edu.ups.clinic.backend.model.Appointment;
import ec.edu.ups.clinic.backend.util.EmailUtil;
import ec.edu.ups.clinic.backend.util.WhatsAppUtil;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.List;

@Path("/appointments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AppointmentServiceREST {
	
	@jakarta.persistence.PersistenceContext
	private jakarta.persistence.EntityManager em;

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
    public Response createAppointment(ec.edu.ups.clinic.backend.dto.AppointmentDTO dto) {
        try {
            // Buscar entidades
            var patient = em.find(ec.edu.ups.clinic.backend.model.User.class, dto.getPatientId());
            var doctor = em.find(ec.edu.ups.clinic.backend.model.User.class, dto.getDoctorId());

            if (patient == null || doctor == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                               .entity("Paciente o doctor no encontrado").build();
            }

            // Crear la cita
            var appointment = new Appointment();
            appointment.setPatient(patient);
            appointment.setDoctor(doctor);
            appointment.setDateTime(LocalDateTime.parse(dto.getDateTime()));
            appointment.setStatus("PENDIENTE");

            appointmentDAO.insert(appointment);

            // Notificaciones
            WhatsAppUtil.enviarMensaje(
                patient.getPhone(),
                "Hola " + patient.getName() + ", recuerda que tu cita es el " + appointment.getDateTime()
            );

            EmailUtil.enviarCorreo(
                patient.getEmail(),
                "Recordatorio de cita médica",
                "Hola " + patient.getName() + ", tu cita está programada para el " + appointment.getDateTime()
            );

            return Response.ok().build();

        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                           .entity("Error al crear la cita").build();
        }
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
