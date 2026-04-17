import { Router } from 'express';
import {
  getNetwork,
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  removeConnection,
  getConnectionRequests
} from '#controllers';

import { verifyToken } from '#middleware';

const networkRoutes = Router();

networkRoutes.get('/', verifyToken, getNetwork);

networkRoutes.get('/requests', verifyToken, getConnectionRequests);

networkRoutes.post('/request/:targetUserId', verifyToken, sendConnectionRequest);

networkRoutes.post('/accept/:fromUserId', verifyToken, acceptConnectionRequest);

networkRoutes.delete('/decline/:fromUserId', verifyToken, declineConnectionRequest);

networkRoutes.delete('/:userId', verifyToken, removeConnection);

export default networkRoutes;