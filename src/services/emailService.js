import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init("YOUR_EMAILJS_PUBLIC_KEY"); // You'll need to replace this with your actual EmailJS public key

class EmailService {
  constructor() {
    this.serviceId = "YOUR_EMAILJS_SERVICE_ID"; // Replace with your EmailJS service ID
    this.templateId = "YOUR_EMAILJS_TEMPLATE_ID"; // Replace with your EmailJS template ID
  }

  // Send barber invitation email
  async sendBarberInvitation(inviterName, inviterEmail, inviteeEmail, invitationLink) {
    try {
      const templateParams = {
        inviter_name: inviterName,
        inviter_email: inviterEmail,
        invitee_email: inviteeEmail,
        invitation_link: invitationLink,
        platform_name: "Le Barber",
        current_date: new Date().toLocaleDateString()
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      return { success: true, messageId: response.text };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(barberName, clientName, clientEmail, bookingDetails) {
    try {
      const templateParams = {
        barber_name: barberName,
        client_name: clientName,
        client_email: clientEmail,
        service: bookingDetails.service,
        date: bookingDetails.date,
        time: bookingDetails.time,
        price: bookingDetails.price,
        platform_name: "Le Barber"
      };

      const response = await emailjs.send(
        this.serviceId,
        "booking_confirmation_template", // You'll need to create this template
        templateParams
      );

      return { success: true, messageId: response.text };
    } catch (error) {
      console.error('Booking confirmation email failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send booking request notification to barber
  async sendBookingRequestNotification(barberEmail, barberName, clientName, requestDetails) {
    try {
      const templateParams = {
        barber_email: barberEmail,
        barber_name: barberName,
        client_name: clientName,
        service: requestDetails.service,
        preferred_date: requestDetails.preferredDate,
        preferred_time: requestDetails.preferredTime,
        max_price: requestDetails.maxPrice,
        notes: requestDetails.notes || "",
        platform_name: "Le Barber"
      };

      const response = await emailjs.send(
        this.serviceId,
        "booking_request_template", // You'll need to create this template
        templateParams
      );

      return { success: true, messageId: response.text };
    } catch (error) {
      console.error('Booking request notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send rental space notification
  async sendRentalNotification(barberName, barberEmail, rentalDetails) {
    try {
      const templateParams = {
        barber_name: barberName,
        barber_email: barberEmail,
        rental_address: rentalDetails.address,
        rental_price: rentalDetails.price,
        rental_description: rentalDetails.description,
        contact_info: rentalDetails.contactInfo,
        platform_name: "Le Barber"
      };

      const response = await emailjs.send(
        this.serviceId,
        "rental_notification_template", // You'll need to create this template
        templateParams
      );

      return { success: true, messageId: response.text };
    } catch (error) {
      console.error('Rental notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate invitation link
  generateInvitationLink(inviterId, inviteeEmail) {
    const baseUrl = window.location.origin;
    const invitationCode = this.generateInvitationCode(inviterId, inviteeEmail);
    return `${baseUrl}/auth?invitation=${invitationCode}&type=barber&inviter=${inviterId}`;
  }

  // Generate unique invitation code
  generateInvitationCode(inviterId, inviteeEmail) {
    const timestamp = Date.now();
    const hash = btoa(`${inviterId}-${inviteeEmail}-${timestamp}`);
    return hash.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
  }

  // Validate invitation code
  validateInvitationCode(code, inviterId, inviteeEmail) {
    // In a real app, you'd validate this against stored invitations
    return code.length === 12;
  }
}

export default new EmailService(); 