package ec.edu.ups.clinic.backend.util;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Startup
@Singleton
public class FirebaseInitializer {

    @PostConstruct
    public void init() {
        try {
        	InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase/clinic-app-tfm-firebase-adminsdk-fbsvc-e81bcfb34e.json"); // ← CAMBIA ESTA RUTA

            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase inicializado correctamente.");
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
