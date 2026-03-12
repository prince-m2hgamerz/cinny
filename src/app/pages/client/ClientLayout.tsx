import React, { ReactNode } from 'react';
import classNames from 'classnames';
import { Box } from 'folds';
import * as css from './ClientLayout.css';

type ClientLayoutProps = {
  nav: ReactNode;
  children: ReactNode;
};
export function ClientLayout({ nav, children }: ClientLayoutProps) {
  return (
    <Box grow="Yes" className={css.ClientLayoutRoot}>
      <Box shrink="No">{nav}</Box>
      <Box grow="Yes" className={classNames(css.ClientLayoutBody)}>
        {children}
      </Box>
    </Box>
  );
}
