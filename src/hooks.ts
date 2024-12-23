import { useService } from 'beatlejs/react';
import { $Nav } from './$Nav';

export function useNav() {
  return useService([$Nav])[0];
}
