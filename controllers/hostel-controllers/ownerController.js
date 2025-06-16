const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ownerController = {
  // Create Owner
  createOwner: async (req, res) => {
    try {
      const { fullName, email, mobileNumber, address, profileImage } = req.body;

      const existingOwner = await prisma.owner.findUnique({ where: { email } });
      if (existingOwner) {
        return res.status(409).json({ error: 'Owner with this email already exists.' });
      }

      const owner = await prisma.owner.create({
        data: {
          fullName,
          email,
          mobileNumber,
          address,
          profileImage,
        },
      });

      res.status(201).json(owner);
    } catch (error) {
      console.error('Create Owner Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get All Owners
  getAllOwners: async (req, res) => {
    try {
      const owners = await prisma.owner.findMany({
        include: {
          hostels: true,
        },
      });
      res.status(200).json(owners);
    } catch (error) {
      console.error('Get All Owners Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get Owner by ID
  getOwnerById: async (req, res) => {
    try {
      const { id } = req.params;
      const owner = await prisma.owner.findUnique({
        where: { id: parseInt(id) },
        include: {
          hostels: true,
        },
      });

      if (!owner) {
        return res.status(404).json({ error: 'Owner not found' });
      }

      res.status(200).json(owner);
    } catch (error) {
      console.error('Get Owner Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update Owner
  updateOwner: async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, email, mobileNumber, address, profileImage } = req.body;

      const owner = await prisma.owner.update({
        where: { id: parseInt(id) },
        data: {
          fullName,
          email,
          mobileNumber,
          address,
          profileImage,
        },
      });

      res.status(200).json(owner);
    } catch (error) {
      console.error('Update Owner Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete Owner
  deleteOwner: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.owner.delete({ where: { id: parseInt(id) } });
      res.status(204).send();
    } catch (error) {
      console.error('Delete Owner Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = ownerController;
