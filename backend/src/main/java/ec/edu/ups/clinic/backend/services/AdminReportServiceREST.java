package ec.edu.ups.clinic.backend.services;

import ec.edu.ups.clinic.backend.dao.AdminReportDAO;
import ec.edu.ups.clinic.backend.model.AdminReport;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/reports")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminReportServiceREST {

    @Inject
    private AdminReportDAO reportDAO;

    @GET
    @Path("/by-doctor")
    public List<AdminReport> getByDoctor() {
        return reportDAO.getAppointmentsByDoctor();
    }

    @GET
    @Path("/by-specialty")
    public List<AdminReport> getBySpecialty() {
        return reportDAO.getAppointmentsBySpecialty();
    }

    @GET
    @Path("/by-date")
    public List<AdminReport> getByDate() {
        return reportDAO.getAppointmentsByDate();
    }
}
