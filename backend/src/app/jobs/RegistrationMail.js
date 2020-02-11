import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { recipientExists, delivererExists, product } = data;

    await Mail.sendMail({
      to: `${delivererExists.name} <${delivererExists.email}>`,
      subject: 'Nova encomenda',
      template: 'registration',
      context: {
        deliveryman: delivererExists.name,
        recipient: recipientExists.name,
        street: recipientExists.street,
        number: recipientExists.number,
        complement: recipientExists.complement,
        city: recipientExists.city,
        state: recipientExists.state,
        zip_code: recipientExists.zip_code,
        product,
      },
    });
  }
}

export default new RegistrationMail();
