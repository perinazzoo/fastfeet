import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import File from '../models/File';

class CheckOutController {
  async update(req, res) {
    const schema = Yup.object().shape({
      signature_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'A signature is required to conclude deliveries' });
    }

    const { deliverymanId, deliveryId } = req.params;

    const delivery = await Delivery.findOne({
      where: {
        id: deliveryId,
        deliveryman_id: deliverymanId,
      },
    });

    if (!delivery) {
      return res
        .status(404)
        .json({ error: 'Deliveryman and delivery does not match' });
    }

    const { signature_id } = req.body;

    const signatureExists = await File.findByPk(signature_id);

    if (!signatureExists) {
      return res.status(404).json({ error: 'Signature not found' });
    }

    delivery.end_date = new Date();

    delivery.signature_id = signature_id;

    delivery.save();

    return res.json(delivery);
  }
}

export default new CheckOutController();
