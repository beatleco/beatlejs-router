import { useService } from 'beatlejs/integrations/react';
import { RouterService } from './RouterService';

export function useRouter() {
  return useService([RouterService])[0];
}
