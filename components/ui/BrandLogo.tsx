import React from 'react';
import officialLogo from '../../src/assets/miniaturas-horus/logo.png';

/** The approved artwork, unchanged and always displayed in its original proportions. */
export const BrandLogo: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <img src={officialLogo} alt="HÓRUS GYM" className={`horus-brand-logo ${className}`} style={style} />
);
