import Delivery from '../models/Delivery';
import Deliverer from '../models/Deliverer';
import Recipient from '../models/Recipient';

class PendingController {
  async index(req, res) {
    const { id } = req.params;

    const delivererExists = await Deliverer.findByPk(id);

    if (!delivererExists) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    const pendingDeliveries = await Delivery.findAll({
      where: {
        deliveryman_id: id,
        cancelled_at: null,
        end_date: null,
      },
      attributes: ['id', 'product'],
      order: [['created_at', 'DESC']],
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
      ],
    });

    return res.json(pendingDeliveries);
  }
}

export default new PendingController();
