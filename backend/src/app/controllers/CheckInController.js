import {
  isBefore,
  isAfter,
  setSeconds,
  setMinutes,
  setHours,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Op } from 'sequelize';

import Delivery from '../models/Delivery';

class CheckInController {
  async update(req, res) {
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

    if (delivery.start_date !== null) {
      return res
        .status(401)
        .json({ error: 'You can only withdraw a package one time' });
    }

    const startDate = setSeconds(setMinutes(setHours(new Date(), 8), 0), 0);

    const endDate = setSeconds(setMinutes(setHours(new Date(), 18), 0), 0);

    const isBetween =
      isAfter(new Date(), startDate) && isBefore(new Date(), endDate);

    if (!isBetween) {
      return res
        .status(401)
        .json({ error: 'You cannot withdraw before 8h and after 18h' });
    }

    const dailyCheckIn = await Delivery.findAll({
      where: {
        deliveryman_id: deliverymanId,
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
      },
    });

    if (dailyCheckIn.length >= 5) {
      return res
        .status(401)
        .json({ error: 'You cannot withdraw more than 5 packages per day' });
    }

    delivery.start_date = new Date();

    delivery.save();

    return res.json(delivery);
  }
}

export default new CheckInController();
