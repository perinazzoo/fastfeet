import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().notRequired(),
      complement: Yup.string().notRequired(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Provided data Incorrect' });
    }

    const recipient = req.body;

    if (await Recipient.findOne({ where: { name: recipient.name } })) {
      return res.status(400).json({ error: 'Recipient already exists' });
    }

    const createdRecipient = await Recipient.create(recipient);

    return res.json(createdRecipient);
  }
}

export default new RecipientController();