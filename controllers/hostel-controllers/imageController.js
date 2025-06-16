const { PrismaClient } = require('@prisma/client');
const { uploadToS3 } = require('../../utils/s3');

const prisma = new PrismaClient();

const imageController = {
  // Upload images for a hostel
  uploadImages: async (req, res) => {
    console.log(req.files);
    
    try {
      const { hostelId } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No images provided'
        });
      }

      // Upload images to S3
      const uploadPromises = req.files.map(file => uploadToS3(file));
      const imageUrls = await Promise.all(uploadPromises);

      // Get existing hostel and update images array
      const existingHostel = await prisma.hostel.findUnique({
        where: { id: parseInt(hostelId) },
        select: { images: true }
      });

      if (!existingHostel) {
        return res.status(404).json({
          success: false,
          error: 'Hostel not found'
        });
      }

      // Update hostel with new images
      const updatedHostel = await prisma.hostel.update({
        where: { id: parseInt(hostelId) },
        data: {
          images: [...(existingHostel.images || []), ...imageUrls]
        },
        select: { images: true }
      });

      res.status(200).json({
        success: true,
        data: {
          images: updatedHostel.images
        }
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload images'
      });
    }
  },

  // Delete an image from a hostel
  deleteImage: async (req, res) => {
    try {
      const { hostelId } = req.params;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: 'Image URL is required'
        });
      }

      // Get existing hostel
      const existingHostel = await prisma.hostel.findUnique({
        where: { id: parseInt(hostelId) },
        select: { images: true }
      });

      if (!existingHostel) {
        return res.status(404).json({
          success: false,
          error: 'Hostel not found'
        });
      }

      // Remove the specified image URL from the array
      const updatedImages = existingHostel.images.filter(img => img !== imageUrl);

      // Update hostel with new images array
      const updatedHostel = await prisma.hostel.update({
        where: { id: parseInt(hostelId) },
        data: {
          images: updatedImages
        },
        select: { images: true }
      });

      res.status(200).json({
        success: true,
        data: {
          images: updatedHostel.images
        }
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete image'
      });
    }
  },

  // Get all images for a hostel
  getImages: async (req, res) => {
    try {
      const { hostelId } = req.params;

      const hostel = await prisma.hostel.findUnique({
        where: { id: parseInt(hostelId) },
        select: { images: true }
      });

      if (!hostel) {
        return res.status(404).json({
          success: false,
          error: 'Hostel not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          images: hostel.images
        }
      });
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch images'
      });
    }
  }
};

module.exports = imageController;