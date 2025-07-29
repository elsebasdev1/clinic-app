package ec.edu.ups.clinic.backend.util;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

public class WhatsAppUtil {
	
	public static final String ACCOUNT_SID = "TU_SID";
    public static final String AUTH_TOKEN = "TU_TOKEN";
    public static final String FROM = "whatsapp:+14155238886"; // Número Twilio

    public static void enviarMensaje(String to, String mensajeTexto) {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);

        Message message = Message.creator(
                new PhoneNumber("whatsapp:" + to),
                new PhoneNumber(FROM),
                mensajeTexto
        ).create();

        System.out.println("Mensaje enviado con SID: " + message.getSid());
    }

}
