import { useService } from 'beatlejs/react';
import { $Router } from './$Router';

export function useRouter() {
  return useService([$Router])[0];
}
