const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { uploadToS3 } = require('../../utils/s3');

const prisma = new PrismaClient();

// Create new user
const createUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumberPrimary,
      mobileNumberSecondary,
      address,
      password,
      occupation
    } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload images to S3 if provided
    let profileImageUrl = '';
    let identityDocImageUrl = '';

    if (req.files) {
      if (req.files.profileImage) {
        profileImageUrl = await uploadToS3(req.files.profileImage[0]);
      }
      if (req.files.identityDocImage) {
        identityDocImageUrl = await uploadToS3(req.files.identityDocImage[0]);
      }
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        mobileNumberPrimary,
        mobileNumberSecondary,
        address,
        password: hashedPassword,
        occupation,
        profileImage: profileImageUrl,
        identityDocImage: identityDocImageUrl
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumberPrimary: true,
        mobileNumberSecondary: true,
        address: true,
        occupation: true,
        profileImage: true,
        identityDocImage: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumberPrimary: true,
        mobileNumberSecondary: true,
        address: true,
        occupation: true,
        profileImage: true,
        identityDocImage: true,
        createdAt: true,
        updatedAt: true,
        residents: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      mobileNumberPrimary,
      mobileNumberSecondary,
      address,
      occupation
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Handle image uploads if provided
    let updateData = {
      fullName,
      email,
      mobileNumberPrimary,
      mobileNumberSecondary,
      address,
      occupation
    };

    if (req.files) {
      if (req.files.profileImage) {
        updateData.profileImage = await uploadToS3(req.files.profileImage[0]);
      }
      if (req.files.identityDocImage) {
        updateData.identityDocImage = await uploadToS3(req.files.identityDocImage[0]);
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumberPrimary: true,
        mobileNumberSecondary: true,
        address: true,
        occupation: true,
        profileImage: true,
        identityDocImage: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};