import * as Yup from 'yup';

import File from '../models/File';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliverer from '../models/Deliverer';
import DeliveryProblem from '../models/DeliveryProblem';

import CancellationMail from '../jobs/CancellationMail';

import Queue from '../../lib/Queue';

class DeliveryProblemController {
  async index(req, res) {
    const { id } = req.params;

    const deliveryExists = await Delivery.findByPk(id);

    if (!deliveryExists) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const problems = await DeliveryProblem.findAll({
      where: {
        delivery_id: id,
      },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product', 'start_date'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: [
                'id',
                'name',
                'street',
                'number',
                'complement',
                'state',
                'city',
                'zip_code',
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
          ],
        },
      ],
    });

    if (!problems) {
      return res
        .status(404)
        .json({ error: 'There are no problems with this delivery' });
    }

    return res.json(problems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Validation failed: description is required' });
    }

    const { id } = req.params;

    const deliveryExists = await Delivery.findByPk(id);

    if (!deliveryExists) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const problem = await DeliveryProblem.create({
      description: req.body.description,
      delivery_id: id,
    });

    return res.json(problem);
  }

  async destroy(req, res) {
    const { id } = req.params;

    const problem = await DeliveryProblem.findByPk(id);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const { delivery_id } = problem;

    const delivery = await Delivery.findByPk(delivery_id, {
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
        {
          model: Deliverer,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (delivery.cancelled_at !== null) {
      return res.status(400).json({ error: 'Delivery already canceled' });
    }

    if (delivery.end_date !== null) {
      return res.status(400).json({ error: 'Package already delivered' });
    }

    delivery.cancelled_at = new Date();

    await delivery.save();

    await Queue.add(CancellationMail.key, {
      delivery,
      problem,
    });

    return res.json(delivery);
  }
}

export default new DeliveryProblemController();
