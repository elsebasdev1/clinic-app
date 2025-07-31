package ec.edu.ups.clinic.backend.services;

import ec.edu.ups.clinic.backend.dao.AppointmentDAO;
import ec.edu.ups.clinic.backend.model.Appointment;
import ec.edu.ups.clinic.backend.util.EmailUtil;
import ec.edu.ups.clinic.backend.util.WhatsAppUtil;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;



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
            var specialty = em.find(ec.edu.ups.clinic.backend.model.Specialty.class, dto.getSpecialtyId());

            if (patient == null || doctor == null || specialty == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                               .entity("Paciente o doctor no encontrado").build();
            }

            // Crear la cita
            var appointment = new Appointment();
            appointment.setPatient(patient);
            appointment.setDoctor(doctor);
            appointment.setSpecialty(specialty);
            appointment.setDateTime(LocalDateTime.parse(dto.getDateTime()));
            appointment.setStatus("PENDIENTE");

            appointmentDAO.insert(appointment);

            // Notificaciones
            try {
            	WhatsAppUtil.enviarMensaje(
                        patient.getPhone(),
                        "Hola " + patient.getName() + ", recuerda que tu cita es el " + appointment.getDateTime()
                    );
				
			} catch (Exception e) {
				e.printStackTrace();
			}

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
    public Response updateAppointment(@PathParam("id") Long id, Appointment partialAppt) {
        Appointment existingAppt = appointmentDAO.findById(id);
        if (existingAppt == null) {
            return Response.status(Response.Status.NOT_FOUND)
                           .entity("Cita no encontrada").build();
        }

        if (partialAppt.getStatus() != null) existingAppt.setStatus(partialAppt.getStatus());
        if (partialAppt.getDateTime() != null) existingAppt.setDateTime(partialAppt.getDateTime());
        if (partialAppt.getDoctor() != null) existingAppt.setDoctor(partialAppt.getDoctor());
        if (partialAppt.getPatient() != null) existingAppt.setPatient(partialAppt.getPatient());
        if (partialAppt.getSpecialty() != null) existingAppt.setSpecialty(partialAppt.getSpecialty());

        appointmentDAO.update(existingAppt);
        return Response.ok(existingAppt).build();
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
    
    @GET
    @Path("/{id}/pdf")
    @Produces("application/pdf")
    public Response generateAppointmentPdf(@PathParam("id") Long id) {
        Appointment appt = appointmentDAO.findById(id);
        if (appt == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 50, 50);

        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            // Título centrado
            Paragraph title = new Paragraph("COMPROBANTE DE CITA MÉDICA", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16));
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Fecha de Emisión: " + LocalDate.now()));

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Datos del Paciente:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            doc.add(new Paragraph("Nombre: " + appt.getPatient().getName()));
            doc.add(new Paragraph("Dirección: " + appt.getPatient().getAddress()));
            doc.add(new Paragraph("Teléfono: " + appt.getPatient().getPhone()));

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Datos del Médico:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            doc.add(new Paragraph("Nombre: " + appt.getDoctor().getName()));
            if (appt.getDoctor().getSpecialty() != null) {
                doc.add(new Paragraph("Especialidad: " + appt.getDoctor().getSpecialty().getName()));
            }

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Detalles de la Cita:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            doc.add(new Paragraph("Fecha: " + appt.getDateTime().toLocalDate()));
            doc.add(new Paragraph("Hora: " + appt.getDateTime().toLocalTime()));
            doc.add(new Paragraph("Estado: " + appt.getStatus()));

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Gracias por confiar en nuestro servicio.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10)));

            doc.close();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity("Error al generar PDF").build();
        }

        return Response.ok(new ByteArrayInputStream(out.toByteArray()))
                       .header("Content-Disposition", "attachment; filename=cita_" + id + ".pdf")
                       .build();
    }

    @GET
    @Path("/reporte-doctores/pdf")
    @Produces("application/pdf")
    public Response generateFullDoctorsReportPdf() {
        List<Object[]> doctorStats = appointmentDAO.getAppointmentCountPerDoctor();

        if (doctorStats.isEmpty()) {
            return Response.status(Response.Status.NO_CONTENT).build();
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 50, 50);

        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            Paragraph title = new Paragraph("REPORTE DE CITAS POR DOCTOR", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16));
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Fecha de generación: " + LocalDate.now()));
            doc.add(new Paragraph(" "));

            for (Object[] row : doctorStats) {
                String doctorName = (String) row[0];
                Long totalCitas = (Long) row[1];

                doc.add(new Paragraph("Doctor: " + doctorName));
                doc.add(new Paragraph("Total de Citas: " + totalCitas));
                doc.add(new Paragraph(" "));
            }

            doc.add(new Paragraph("Fin del reporte.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10)));

            doc.close();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity("Error al generar el PDF").build();
        }

        return Response.ok(new ByteArrayInputStream(out.toByteArray()))
                       .header("Content-Disposition", "attachment; filename=reporte_citas_por_doctor.pdf")
                       .build();
    }
    
    @GET
    @Path("/reporte-especialidades/pdf")
    @Produces("application/pdf")
    public Response downloadSpecialtyReportPdf() {
        List<Object[]> specialtyStats = appointmentDAO.getAppointmentCountPerSpecialty();

        if (specialtyStats == null || specialtyStats.isEmpty()) {
            return Response.status(Response.Status.NO_CONTENT).build();
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 50, 50);

        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            // Título
            Paragraph title = new Paragraph("REPORTE DE CITAS POR ESPECIALIDAD",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16));
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Fecha de generación: " + LocalDate.now()));
            doc.add(new Paragraph(" "));

            // Datos por especialidad
            for (Object[] row : specialtyStats) {
                String specialtyName = (String) row[0];
                Long totalCitas = (Long) row[1];

                doc.add(new Paragraph("Especialidad: " + specialtyName,
                        FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
                doc.add(new Paragraph("Total de Citas: " + totalCitas));
                doc.add(new Paragraph(" "));
            }

            doc.add(new Paragraph("Fin del reporte.",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10)));

            doc.close();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity("Error al generar el PDF").build();
        }

        return Response.ok(new ByteArrayInputStream(out.toByteArray()))
                .header("Content-Disposition", "attachment; filename=reporte_citas_por_especialidad.pdf")
                .build();
    }

    
    @GET
    @Path("/reporte-ocupacion/pdf")
    @Produces("application/pdf")
    public Response generateDoctorOccupationReportPdf() {
        List<Object[]> report = appointmentDAO.getDoctorOccupationReport();

        if (report.isEmpty()) {
            return Response.status(Response.Status.NO_CONTENT).build();
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 50, 50);

        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            Paragraph title = new Paragraph("REPORTE DE OCUPACIÓN DE DOCTORES", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16));
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Fecha de generación: " + LocalDate.now()));
            doc.add(new Paragraph(" "));

            for (Object[] row : report) {
                String doctorName = (String) row[0];
                int totalAvailable = (Integer) row[1];
                int occupied = (Integer) row[2];
                double porcentaje = totalAvailable > 0 ? (occupied * 100.0) / totalAvailable : 0;

                doc.add(new Paragraph("Doctor: " + doctorName));
                doc.add(new Paragraph("Tiempo disponible (min): " + totalAvailable));
                doc.add(new Paragraph("Tiempo ocupado (min): " + occupied));
                doc.add(new Paragraph("Porcentaje ocupado: " + String.format("%.2f", porcentaje) + "%"));
                doc.add(new Paragraph(" "));
            }

            doc.close();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity("Error al generar el PDF").build();
        }

        return Response.ok(new ByteArrayInputStream(out.toByteArray()))
                       .header("Content-Disposition", "attachment; filename=reporte_ocupacion_doctores.pdf")
                       .build();
    }



}
