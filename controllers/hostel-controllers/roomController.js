const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const roomController = {
  // Get room statistics
  getRoomStatistics: async (req, res) => {
    try {
      const { hostelId } = req.params;
      
      const rooms = await prisma.room.findMany({
        where: {
          hostelId: parseInt(hostelId)
        }
      });

      const statistics = {
        totalRooms: rooms.length,
        available: rooms.filter(room => room.status === 'AVAILABLE').length,
        occupied: rooms.filter(room => room.status === 'OCCUPIED').length,
        maintenance: rooms.filter(room => room.status === 'MAINTENANCE').length
      };

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error fetching room statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch room statistics'
      });
    }
  },

  // Search rooms
  searchRooms: async (req, res) => {
    try {
      const { hostelId } = req.params;
      const { query, status } = req.query;

      const whereClause = {
        hostelId: parseInt(hostelId)
      };

      if (query) {
        whereClause.OR = [
          { roomNumber: { contains: query, mode: 'insensitive' } }
        ];
      }

      if (status && status !== 'ALL') {
        whereClause.status = status;
      }

      const rooms = await prisma.room.findMany({
        where: whereClause,
        include: {
          residents: true
        },
        orderBy: [
          { floorNumber: 'asc' },
          { roomNumber: 'asc' }
        ]
      });

      res.status(200).json({
        success: true,
        data: rooms
      });
    } catch (error) {
      console.error('Error searching rooms:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search rooms'
      });
    }
  },

  // Update room status
  updateRoomStatus: async (req, res) => {
    try {
      const { roomId } = req.params;
      const { status } = req.body;

      const room = await prisma.room.update({
        where: { id: parseInt(roomId) },
        data: { status },
        include: {
          residents: true
        }
      });

      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error updating room status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update room status'
      });
    }
  },
  // Create a new room
  createRoom: async (req, res) => {
    try {
      const { hostelId, ac, bathrooms, price, roomType, floorNumber, roomNumber, status, occupiedBeds } = req.body.roomData;

      const existingRoom = await prisma.room.findFirst({
        where: {
          hostelId: parseInt(hostelId),
          roomNumber
        }
      });

      if (existingRoom) {
        return res.status(400).json({
          success: false,
          error: 'Room number already exists in this hostel'
        });
      }

      if (occupiedBeds > roomType.totalBeds) {
        return res.status(400).json({
          success: false,
          error: 'Occupied beds cannot exceed total beds in room type'
        });
      }

      const room = await prisma.room.create({
        data: {
          hostelId: parseInt(hostelId),
          floorNumber: parseInt(floorNumber),
          roomType,
          ac,
          price,
          bathrooms,
          roomNumber,
          status: status || 'AVAILABLE',
          occupiedBeds: parseInt(occupiedBeds) || 0
        },
        include: {
          hostel: true
        }
      });

      res.status(201).json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create room'
      });
    }
  },

  
  // Get all rooms for a hostel
  getRoomsByHostel: async (req, res) => {
    try {
      const { hostelId } = req.params;
      const rooms = await prisma.room.findMany({
        where: {
          hostelId: parseInt(hostelId)
        },
        include: {
          residents: {
            select: {
              id: true,
              fullName: true,
              residentId: true,
              mobileNumberPrimary: true
            }
          }
        },
        orderBy: [
          { floorNumber: 'asc' },
          { roomNumber: 'asc' }
        ]
      });

      // Format the response to include occupancy information
      const formattedRooms = rooms.map(room => ({
        ...room,
        occupancyInfo: `${room.occupiedBeds}/${room.roomType}`,
        price: parseFloat(room.price)
      }));

      res.status(200).json({
        success: true,
        data: formattedRooms
      });
    } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch rooms'
      });
    }
  },

  // Get room types for a hostel
  getRoomTypes: async (req, res) => {
    try {
      const { hostelId } = req.params;
      const roomTypes = await prisma.roomType.findMany({
        where: {
          hostelId: parseInt(hostelId)
        }
      });

      res.status(200).json({
        success: true,
        data: roomTypes
      });
    } catch (error) {
      console.error('Error fetching room types:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch room types'
      });
    }
  },
  // Get available rooms for a hostel
getAvailableRooms: async (req, res) => {
  try {
    const { hostelId } = req.params;

    if (!hostelId || isNaN(hostelId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing hostelId'
      });
    }

    const rooms = await prisma.room.findMany({
       where: {
        hostelId: parseInt(hostelId),
        status: 'AVAILABLE'
      },
            orderBy: [
          { floorNumber: 'asc' },
          { roomNumber: 'asc' }
        ]
      });

      // Format the response to include occupancy information
      const availableRooms = rooms.map(room => ({
        ...room,
        occupancyInfo: `${room.occupiedBeds}/${room.roomType}`,
        price: parseFloat(room.price)
      }));

    res.status(200).json({
      success: true,
      data: availableRooms
    });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available rooms'
    });
  }
},

  

  // ✅ Include this inside the roomController object
  // Update room
  updateRoom: async (req, res) => {
    try {
      const { roomId } = req.params;
      const { floorNumber, roomNumber, ac, bathrooms, price, roomType, status } = req.body;

      // Check if room exists
      const existingRoom = await prisma.room.findUnique({
        where: { id: parseInt(roomId) }
      });

      if (!existingRoom) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }

      // Check if new room number already exists (if room number is being changed)
      if (roomNumber && roomNumber !== existingRoom.roomNumber) {
        const duplicateRoom = await prisma.room.findFirst({
          where: {
            hostelId: existingRoom.hostelId,
            roomNumber,
            id: { not: parseInt(roomId) }
          }
        });

        if (duplicateRoom) {
          return res.status(400).json({
            success: false,
            error: 'Room number already exists in this hostel'
          });
        }
      }

      // Update room
      const updatedRoom = await prisma.room.update({
        where: { id: parseInt(roomId) },
        data: {
          floorNumber: floorNumber ? parseInt(floorNumber) : undefined,
          roomNumber,
          ac,
          bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
          price: price ? parseFloat(price) : undefined,
          roomType,
          status
        },
        include: {
          residents: true
        }
      });

      res.status(200).json({
        success: true,
        data: updatedRoom
      });
    } catch (error) {
      console.error('Error updating room:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update room'
      });
    }
  },

  // Delete room
  deleteRoom: async (req, res) => {
    try {
      const { roomId } = req.params;

      // Check if room exists and has no residents
      const room = await prisma.room.findUnique({
        where: { id: parseInt(roomId) },
        include: { residents: true }
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }

      if (room.residents.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete room with active residents'
        });
      }

      // Delete room
      await prisma.room.delete({
        where: { id: parseInt(roomId) }
      });

      res.status(200).json({
        success: true,
        message: 'Room deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete room'
      });
    }
  },

  getRoomTypesByHostel: async (req, res) => {
    try {
      const { hostelId } = req.params;

      if (!hostelId || isNaN(hostelId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or missing hostelId'
        });
      }

     const roomTypes = await prisma.hostel.findUnique({
  where: {
    id: parseInt(hostelId)
  },
  select: {
    roomTypes: true
  }
});

res.status(200).json({
  success: true,
  data: roomTypes?.roomTypes || []
});


     
    } catch (error) {
      console.error('Error fetching room types:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch room types'
      });
    }
  }
};

module.exports = roomController;
