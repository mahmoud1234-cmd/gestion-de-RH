import { environment } from '../../environments/environment';

export const API_CONFIG = {
  AUTH: `${environment.backendUrl}/auth`,
  CONGES: `${environment.backendUrl}/conges`,
  POINTAGE: `${environment.backendUrl}/pointage`,
  SALAIRE: `${environment.backendUrl}/salaire`,
  UTILISATEURS: `${environment.backendUrl}/utilisateurs`
};
