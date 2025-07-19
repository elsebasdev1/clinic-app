package ec.edu.ups.clinic.backend.model;

import java.time.LocalDate;

public class AdminReport {

    private String label;
    private Long count;

    public AdminReport() {}

    public AdminReport(String label, Long count) {
        this.label = label;
        this.count = count;
    }

    public AdminReport(LocalDate date, Long count) {
        this.label = date.toString(); // o puedes almacenar como LocalDate si prefieres
        this.count = count;
    }    
    
    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}

