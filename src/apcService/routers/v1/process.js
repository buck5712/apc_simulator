const express = require('express');

const { defaultStrategy, sharonStrategy } = require('../../utilities/strategyUtil');

const logger = require('../../../utilities/logger')('APC_SERVICE');

const router = express.Router();

router.post('/api/v1/process', async (req, res) => {
  const { id, type, thickness, moisture } = req.body;

  const handle = logger.begin({
    module: 'routers/v1/process',
    method: '/api/v1/process',
    id,
    type,
    thickness,
    moisture,
  });

  try {
    if (!global.cache) {
      throw new Error('the global cache is not existed');
    }
    const tFactor = global.cache.get('FACTOR_THICKNESS');
    const mFactor = global.cache.get('FACTOR_MOISTURE');

    let data = null;
    if (type === 'SHARON') {
      data = sharonStrategy(thickness, tFactor);
    } else {
      data = defaultStrategy(moisture, mFactor);
    }

    logger.info(`process (${id}) of APC has completed`, {
      module: 'routers/v1/process',
      method: '/api/v1/process',
      tFactor,
      mFactor,
      ...data,
    });

    logger.end(handle);

    return res.status(200).send({ ok: true, data: { ...data, tFactor, mFactor } });
  } catch (err) {
    logger.fail(handle, err.message);

    return res.status(500).send({ ok: false, message: err.message });
  }
});

module.exports = router;
