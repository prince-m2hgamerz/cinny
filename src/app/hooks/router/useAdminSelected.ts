import { useMatch } from 'react-router-dom';
import { getAdminPath } from '../../pages/pathUtils';

export const useAdminSelected = (): boolean => {
  const match = useMatch({
    path: getAdminPath(),
    caseSensitive: true,
    end: false,
  });

  return !!match;
};
