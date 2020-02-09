import * as Yup from 'yup';

import Deliverer from '../models/Deliverer';

class DelivererController {
  async index(req, res) {
    const deliverers = await Deliverer.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
    });

    return res.json(deliverers);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.number().integer(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const registeredEmail = await Deliverer.findOne({
      where: { email: req.body.email },
    });

    if (registeredEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const deliverer = await Deliverer.create(req.body);

    return res.json(deliverer);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number().integer(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;

    const deliverer = await Deliverer.findByPk(id);

    if (!deliverer) {
      return res.status(404).json({ error: 'Deliverer not found' });
    }

    const { name, email, avatar_id } = req.body;

    if (email && email !== deliverer.email) {
      const registeredEmail = await Deliverer.findOne({ where: { email } });

      if (registeredEmail) {
        return res.status(401).json({ error: 'Email already registered' });
      }
    }

    const updatedDeliverer = await deliverer.update({
      name,
      email,
      avatar_id,
    });

    return res.json(updatedDeliverer);
  }

  async destroy(req, res) {
    const { id } = req.params;

    const deliverer = await Deliverer.findByPk(id);

    if (!deliverer) {
      return res.status(404).json({ error: 'Deliverer not found' });
    }

    await deliverer.destroy();

    return res.json();
  }
}

export default new DelivererController();
