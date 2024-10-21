const checkOwnership = (model, entityName) => {
  return async (req, res, next) => {
    const entityId = req.params[`${entityName}Id`];
    const userId = req.user._id;

    try {
      const entity = await model.findById(entityId);

      if (!entity) {
        return res.status(404).json({ message: `${entityName} not found` });
      }

      if (entity.user.toString() !== userId.toString()) {
        return res.status(403).json({
          message: `You are not authorized to edit or delete this ${entityName}`,
        });
      }

      // Proceed if ownership check passed
      next();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
};

module.exports = checkOwnership;
