import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Deliverer from '../models/Deliverer';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveredController {
  async index(req, res) {
    const { id } = req.params;

    const delivererExists = await Deliverer.findByPk(id);

    if (!delivererExists) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    const delivered = await Delivery.findAll({
      where: {
        end_date: { [Op.not]: null },
      },
      attributes: ['id', 'product', 'start_date', 'end_date'],
      order: [['end_date', 'DESC']],
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
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(delivered);
  }
}

export default new DeliveredController();
