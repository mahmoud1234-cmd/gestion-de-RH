import { environment } from '../../environments/environment';

const BASE_URL = environment.backendUrl || 'https://gestion-de-rh-production.up.railway.app/api';

export const API_CONFIG = {
  AUTH: `${BASE_URL}/auth`,
  CONGES: `${BASE_URL}/conges`,
  POINTAGE: `${BASE_URL}/pointage`,
  SALAIRE: `${BASE_URL}/salaire`,
  UTILISATEURS: `${BASE_URL}/utilisateurs`
};
