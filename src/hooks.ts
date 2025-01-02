import { useService } from 'beatlejs/integrations/react';
import { $Router } from './$Router';

export function useRouter() {
  return useService([$Router])[0];
}
