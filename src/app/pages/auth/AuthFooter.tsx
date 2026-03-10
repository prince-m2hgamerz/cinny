import React from 'react';
import { Box, Text } from 'folds';
import * as css from './styles.css';

export function AuthFooter() {
  return (
    <Box className={css.AuthFooter} justifyContent="Center" gap="400" wrap="Wrap">
      <Text as="a" size="T300" href="https://m2hio.in" target="_blank" rel="noreferrer">
        About
      </Text>
      <Text
        as="a"
        size="T300"
        href="https://github.com/prince-m2hgamerz"
        target="_blank"
        rel="noreferrer"
      >
        v4.10.5
      </Text>
      <Text as="a" size="T300" href="https://twitter.com/m2hgamerz" target="_blank" rel="noreferrer">
        Twitter
      </Text>
      <Text as="a" size="T300" href="https://m2hio.in" target="_blank" rel="noreferrer">
        Powered by M2H
      </Text>
    </Box>
  );
}
