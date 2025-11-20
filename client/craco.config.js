const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      if (env === 'production') {
        // Find and modify CSS minimizer
        const minimizerIndex = webpackConfig.optimization.minimizer.findIndex(
          (plugin) => plugin.constructor.name === 'CssMinimizerPlugin'
        );
        
        if (minimizerIndex !== -1) {
          // Remove the problematic CSS minimizer
          webpackConfig.optimization.minimizer.splice(minimizerIndex, 1);
        }
      }
      
      return webpackConfig;
    },
  },
};