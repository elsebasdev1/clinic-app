package ec.edu.ups.clinic.backend.util;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

public class WhatsAppUtil {
	
	public static final String ACCOUNT_SID = "ACc684937da49f828c85dad5d4d4416882";
    public static final String AUTH_TOKEN = "4344a821e17830b37cacbf28fa37358b";
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
