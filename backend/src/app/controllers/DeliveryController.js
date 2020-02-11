import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliverer from '../models/Deliverer';
import File from '../models/File';

import Queue from '../../lib/Queue';
import RegistrationMail from '../jobs/RegistrationMail';

class DeliveryController {
  async index(req, res) {
    let { page = 1 } = req.query;

    if (page < 1) page = 1;

    const deliveries = await Delivery.findAll({
      order: [['created_at', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'product', 'cancelled_at', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'state',
            'city',
            'zip_code',
            'complement',
          ],
        },
        {
          model: Deliverer,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number()
        .integer()
        .required(),
      deliveryman_id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { product, recipient_id, deliveryman_id } = req.body;

    const recipientExists = await Recipient.findByPk(recipient_id);

    if (!recipientExists) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const delivererExists = await Deliverer.findByPk(deliveryman_id);

    if (!delivererExists) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    const delivery = await Delivery.create({
      product,
      recipient_id,
      deliveryman_id,
    });

    await Queue.add(RegistrationMail.key, {
      recipientExists,
      delivererExists,
      product,
    });

    return res.json(delivery);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number().integer(),
      deliveryman_id: Yup.number().integer(),
      signature_id: Yup.number()
        .integer()
        .when('end_date', (end_date, field) =>
          end_date ? field.required() : field
        ),
      cancelled_at: Yup.date(),
      start_date: Yup.date().when('end_date', (end_date, field) =>
        end_date ? field.required() : field
      ),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const updatedDelivery = await delivery.update(req.body);

    return res.json(updatedDelivery);
  }

  async destroy(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (delivery.cancelled_at == null) {
      return res
        .status(401)
        .json({ error: 'You cant delete a delivery that was not canceled' });
    }

    await delivery.destroy();

    return res.json();
  }
}

export default new DeliveryController();
