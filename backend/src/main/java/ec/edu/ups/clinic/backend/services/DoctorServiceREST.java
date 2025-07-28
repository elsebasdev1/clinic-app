package ec.edu.ups.clinic.backend.services;

import ec.edu.ups.clinic.backend.dao.*;
import ec.edu.ups.clinic.backend.dto.DoctorDTO;
import ec.edu.ups.clinic.backend.model.*;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.util.*;
import java.util.stream.Collectors;

@Path("/doctors")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DoctorServiceREST {

    @Inject
    private UserDAO userDAO;

    @Inject
    private SpecialtyDAO specialtyDAO;

    @Inject
    private DoctorScheduleDAO doctorScheduleDAO;

    // GET: Listar todos los doctores con sus horarios agrupados
    @GET
    public Response getAllDoctors() {
        List<User> doctors = userDAO.findByRole("doctor");
        List<DoctorSchedule> schedules = doctorScheduleDAO.getAll();

        List<DoctorDTO> result = new ArrayList<>();

        for (User doctor : doctors) {
            DoctorDTO dto = new DoctorDTO();
            dto.setId(doctor.getId());
            dto.setName(doctor.getName());
            dto.setEmail(doctor.getEmail());
            dto.setPhone(doctor.getPhone());
            dto.setSpecialty(
                doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : "Sin especialidad"
            );
            dto.setRole("doctor");

            // Filtrar horarios de este doctor
            List<DoctorSchedule> doctorSchedules = schedules.stream()
                .filter(s -> s.getDoctor().getId().equals(doctor.getId()))
                .collect(Collectors.toList());

            dto.setDays(
                doctorSchedules.stream()
                    .map(DoctorSchedule::getDay)
                    .distinct()
                    .collect(Collectors.toList())
            );

            dto.setSlots(
                doctorSchedules.stream()
                    .map(DoctorSchedule::getTime)
                    .distinct()
                    .collect(Collectors.toList())
            );

            result.add(dto);
        }

        return Response.ok(result).build();
    }

    // POST: Crear nuevo doctor + horarios
    @POST
    @Transactional
    public Response createDoctor(DoctorDTO dto) {
        if (dto.getEmail() == null || dto.getSpecialty() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Faltan campos obligatorios (email o especialidad)").build();
        }

        // Verificar si ya existe un usuario con ese correo
        User existing = userDAO.findByEmail(dto.getEmail());
        if (existing != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("Ya existe un doctor con ese correo").build();
        }

        // Buscar especialidad por nombre
        Specialty specialty = specialtyDAO.findByName(dto.getSpecialty());
        if (specialty == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Especialidad no encontrada: " + dto.getSpecialty()).build();
        }

        // Crear usuario
        User doctor = new User();
        doctor.setName(dto.getName());
        doctor.setEmail(dto.getEmail());
        doctor.setPhone(dto.getPhone());
        doctor.setRole("doctor");
        doctor.setSpecialty(specialty);
        userDAO.insert(doctor);

        // Crear horarios
        if (dto.getDays() != null && dto.getSlots() != null) {
            for (String day : dto.getDays()) {
                for (String slot : dto.getSlots()) {
                    DoctorSchedule schedule = new DoctorSchedule();
                    schedule.setDoctor(doctor);
                    schedule.setDay(day);
                    schedule.setTime(slot);
                    doctorScheduleDAO.insert(schedule);
                }
            }
        }

        return Response.status(Response.Status.CREATED).entity("Doctor creado con éxito").build();
    }
}
