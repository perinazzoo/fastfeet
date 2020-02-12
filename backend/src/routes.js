import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DelivererController from './app/controllers/DelivererController';
import FileController from './app/controllers/FileController';
import DeliveryController from './app/controllers/DeliveryController';
import PendingController from './app/controllers/PendingController';
import DeliveredController from './app/controllers/DeliveredController';
import CheckInController from './app/controllers/CheckInController';
import CheckOutController from './app/controllers/CheckOutController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.get('/deliveryman/:id/pending', PendingController.index);
routes.put(
  '/deliveryman/:deliverymanId/pending/:deliveryId/withdraw',
  CheckInController.update
);
routes.put(
  '/deliveryman/:deliverymanId/pending/:deliveryId/conclude',
  CheckOutController.update
);
routes.get('/deliveryman/:id/delivered', DeliveredController.index);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/deliverers', DelivererController.index);
routes.post('/deliverers', DelivererController.store);
routes.put('/deliverers/:id', DelivererController.update);
routes.delete('/deliverers/:id', DelivererController.destroy);

routes.get('/deliveries', DeliveryController.index);
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.destroy);

export default routes;
