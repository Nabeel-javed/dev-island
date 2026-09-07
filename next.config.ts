import type { NextConfig } from 'next';
const config: NextConfig = {
  // Validate personal islands before sending headers, including for ordinary browsers.
  htmlLimitedBots: /.*/,
};
export default config;
