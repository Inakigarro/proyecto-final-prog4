import { Router } from 'express';
import { AddressService } from '../services/rbac/address.service';
import { crearAddressController } from '../controllers/addressController';
import { verificarToken } from '../middlewares/auth';

/**
 * Router para el recurso Direcciones.
 * Todas las rutas requieren estar autenticado y operan sobre las direcciones
 * propias del usuario que hizo la petición (no hay listado global).
 */
const router = Router();
const controller = crearAddressController(new AddressService());

router.use(verificarToken);

router.get('/me',     controller.listarMias);
router.delete('/:id', controller.eliminar);

export default router;
