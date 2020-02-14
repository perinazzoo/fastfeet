import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import Admin from '../app/models/Admin';
import Recipient from '../app/models/Recipient';
import Deliverer from '../app/models/Deliverer';
import File from '../app/models/File';
import Delivery from '../app/models/Delivery';
import DeliveryProblem from '../app/models/DeliveryProblem';

const models = [Admin, Recipient, Deliverer, File, Delivery, DeliveryProblem];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
