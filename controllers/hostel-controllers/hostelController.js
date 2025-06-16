const { PrismaClient } = require('@prisma/client');
const { uploadToS3 } = require('../../utils/s3');
const { DataBrew } = require('aws-sdk');

const prisma = new PrismaClient();

// // controllers/bookingController.js
// const bookingController = {
//   requestBooking: async (req, res) => {
//     try {
//       const { hostelId, fullName, mobileNumber, preferredRoomType, message } = req.body;

//       if (!hostelId || !fullName || !mobileNumber || !preferredRoomType) {
//         return res.status(400).json({ message: 'Missing required fields.' });
//       }

//       // Optionally: log to a file, send email, or just console
//       console.log('Booking Request:', {
//         hostelId,
//         fullName,
//         mobileNumber,
//         preferredRoomType,
//         message,
//       });

//       return res.status(200).json({ message: 'Booking request received.' });
//     } catch (error) {
//       console.error('Error in booking request:', error);
//       return res.status(500).json({ message: 'Internal server error.' });
//     }
//   }
// };



// const hostelminimumprice = {
//   getMinimumPrice: async (req, res) => {
//     try {
//       const { hostelId } = req.params;

//       const minPriceRoom = await prisma.room.findFirst({
//         where: { hostelId: parseInt(hostelId) },
//         orderBy: { price: 'asc' },
//         select: { price: true },
//       });

//       if (!minPriceRoom) {
//         return res.status(404).json({ message: 'No rooms found for this hostel.' });
//       }

//       return res.json({
//         hostelId: parseInt(hostelId),
//         minPrice: minPriceRoom.price,
//       });
//     } catch (error) {
//       console.error('Error fetching minimum price:', error);
//       return res.status(500).json({ message: 'Internal server error.' });
//     }
//   }
// };




const hostelDetailsController = {
  // Get rooms by hostel ID
  getRoomsByHostelId: async (req, res) => {
    try {
      const { hostelId } = req.params;

      const rooms = await prisma.room.findMany({
        where: { hostelId: parseInt(hostelId) },
        orderBy: { roomNumber: 'asc' },
        select: {
          id: true,
          roomNumber: true,
          roomType: true,
          price: true,
          ac: true,
          bathrooms: true,
          status: true,
          occupiedBeds: true,
          images: {
            select: {
              id: true,
              url: true, // Adjust fields based on your Image model
            },
          },
        }
      });
      

      // Group rooms by type
      const roomsByType = rooms.reduce((acc, room) => {
        const type = room.roomType;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push({
          id: room.id,
          roomNumber: room.roomNumber,
          price: room.price,
          ac: room.ac,
          bathrooms: room.bathrooms,
          status: room.status,
          occupiedBeds: room.occupiedBeds
        });
        return acc;
      }, {});

      const formattedRooms = Object.entries(roomsByType).map(([type, rooms]) => ({
        type: parseInt(type),
        rooms,
        priceRange: {
          min: Math.min(...rooms.map(r => r.price)),
          max: Math.max(...rooms.map(r => r.price))
        },
        availability: rooms.filter(r => r.status === 'AVAILABLE').length
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
  }
  }

  // Get hostel amenities and location
//   getHostelAmenitiesAndLocation: async (req, res) => {
//     try {
//       const { hostelId } = req.params;

//       const hostel = await prisma.hostel.findUnique({
//         where: { id: parseInt(hostelId) },
//         select: {
//           name: true,
//           description: true,
//           address: true,
//           mapLocationLat: true,
//           mapLocationLng: true,
//           amenities: true,
//           images:true,
//           contactNumber: true,
//           email: true,
//           rooms: {
//   select: {
//     id: true,
//     roomNumber: true,
//     roomType: true,
//     price: true,
    
//   }
// },
//           owner: {
//             select: {
//               fullName: true,
//               mobileNumber: true,
//               email: true
//             }
//           }
//         }
//       });

//       if (!hostel) {
//         return res.status(404).json({
//           success: false,
//           error: 'Hostel not found'
//         });
//       }

//       const response = {
//         name: hostel.name,
//         description: hostel.description,
//         location: {
//           address: hostel.address,
//           coordinates: {
//             latitude: hostel.mapLocationLat,
//             longitude: hostel.mapLocationLng
//           }
//         },
//         amenities: (typeof hostel.amenities === 'string' ? hostel.amenities.split(',') : hostel.amenities).map(amenity => ({
//   name: amenity.trim(),
//   icon: amenity.trim().toLowerCase().replace(/\s+/g, '_')

//         })),
//         images: hostel.images, 
//         availableRooms: hostel.rooms.map(room => ({
//         id: room.id,
//         type: room.roomType,
//         price: room.price,
//         // image: getDefaultRoomImage(room.roomType)
// })),

//         contact: {
//           warden: {
//             name: hostel.owner.fullName,
//             phone: hostel.owner.mobileNumber,
//             email: hostel.owner.email
//           },
//           officeHours: 'Mon-Fri: 9:00 AM - 5:00 PM',
//         }
//       };

//       res.status(200).json({
//         success: true,
//         data: response
//       });
//     } catch (error) {   
//       console.error('Error fetching hostel details:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to fetch hostel details'
//       });
//     }
//   }
// };

const hostelController = {
    // Get detailed dashboard for a specific hostel
    getHostelDashboard: async (req, res) => {
        try {
            const { hostelId } = req.params;

            // Get hostel with rooms, residents, and payments
            const hostel = await prisma.hostel.findUnique({
  where: { id: parseInt(hostelId) },
  include: {
    owner: {
      select: {
        fullName: true,
        profileImage: true
      }
    },
    rooms: {
      include: {
        residents: {
          include: {
            payments: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        }
      }
    }
  }
});


            if (!hostel) {
                return res.status(404).json({
                    success: false,
                    error: 'Hostel not found'
                });
            }

            // Calculate occupancy metrics
            const totalBeds = hostel.rooms.reduce((acc, room) => {
                const roomTypeData = hostel.roomTypes[room.roomType];
                return acc + (roomTypeData ? roomTypeData.beds : 0);
            }, 0);

            const occupiedBeds = hostel.rooms.reduce((acc, room) => acc + room.occupiedBeds, 0);
            const availableBeds = totalBeds - occupiedBeds;

            // Get pending payments
            const currentDate = new Date();
            const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            
            const pendingPayments = hostel.rooms.flatMap(room =>
                room.residents.filter(resident => {
                    const hasCurrentMonthPayment = resident.payments.some(payment =>
                        payment.month === currentMonth
                    );
                    return !hasCurrentMonthPayment;
                })
            );

            // Get maintenance requests (assuming they're stored in resident records)
            const maintenanceRequests = hostel.rooms
                .filter(room => room.status === 'MAINTENANCE')
                .map(room => ({
                    roomNumber: room.roomNumber,
                    type: 'Maintenance Request'
                }));

            // Get today's activities
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const activities = [
                // New bookings (residents created today)
                ...hostel.rooms.flatMap(room =>
                    room.residents
                        .filter(resident => {
                            const createdDate = new Date(resident.createdAt);
                            return createdDate >= today;
                        })
                        .map(resident => ({
                            type: 'New booking',
                            description: `Room ${room.roomNumber}`,
                            timestamp: resident.createdAt
                        }))
                ),
                // Payments received today
                ...hostel.rooms.flatMap(room =>
                    room.residents.flatMap(resident =>
                        resident.payments
                            .filter(payment => {
                                const paymentDate = new Date(payment.createdAt);
                                return paymentDate >= today;
                            })
                            .map(payment => ({
                                type: 'Payment collected',
                                description: `$${payment.amount}`,
                                timestamp: payment.createdAt
                            }))
                    )
                ),
                // Include maintenance requests in activities
                ...maintenanceRequests.map(request => ({
                    type: 'Maintenance',
                    description: `Room ${request.roomNumber}`,
                    timestamp: new Date()
                }))
            ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Prepare urgent matters
            const urgentMatters = [
                ...maintenanceRequests.map(request => ({
                    type: 'maintenance',
                    description: `Room ${request.roomNumber}: Maintenance Request`
                })),
                pendingPayments.length > 0 ? {
                    type: 'payments',
                    description: `${pendingPayments.length} Pending Payments Due`
                } : null,
                // Add check-ins scheduled for today
                ...hostel.rooms.flatMap(room =>
                    room.residents
                        .filter(resident => {
                            const registrationDate = new Date(resident.dateOfRegistration);
                            return registrationDate.toDateString() === today.toDateString();
                        })
                        .map(() => ({
                            type: 'check-in',
                            description: 'New Resident Check-in Today'
                        }))
                )
            ].filter(Boolean);

            res.status(200).json({
                success: true,
                data: {
                    name: hostel.name,
                    revenue: {
                        amount: hostel.monthlyRevenue,
                        period: 'this month'
                    },
                    occupancy: {
                        available: availableBeds,
                        total: totalBeds,
                        occupied: occupiedBeds
                    },
                    urgentMatters,
                    todayActivities: activities
                }
            });

        } catch (error) {
            console.error('Error fetching hostel dashboard:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch dashboard data'
            });
        }
    },
    // Get dashboard metrics for owner's hostels
    getOwnerDashboard: async (req, res) => {
        try {
            const { ownerId } = req.params;

            // Get all hostels for the owner with their rooms and residents
            const hostels = await prisma.hostel.findMany({
    where: { ownerId: parseInt(ownerId) },
    include: {
        rooms: {
            include: {
                residents: true
            }
        },
        owner: {
            select: {
                fullName: true,
                profileImage: true
            }
        }
    }
});


            // Calculate metrics for each hostel
            const hostelMetrics = hostels.map(hostel => {
    const totalBeds = hostel.rooms.reduce((acc, room) => {
        const roomTypeData = hostel.roomTypes?.[room.roomType];
        return acc + (roomTypeData ? roomTypeData.beds : 0);
    }, 0);

    const occupiedBeds = hostel.rooms.reduce((acc, room) => acc + room.occupiedBeds, 0);
    const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

    return {
        id: hostel.id,
        name: hostel.name,
        occupancyStatus: `${occupiedBeds}/${totalBeds} beds occupied`,
        occupancyRate: Math.round(occupancyRate),
        monthlyRevenue: hostel.monthlyRevenue,
        images: hostel.images[0] || null,
        ownerName: hostel.owner?.fullName || null,
        ownerProfileImage: hostel.owner?.profileImage || null
    };
});


            // Calculate total monthly revenue
            const totalMonthlyRevenue = hostels.reduce((acc, hostel) => acc + hostel.monthlyRevenue, 0);

            // Get recent activities
            const recentActivities = await prisma.resident.findMany({
                where: {
                    room: {
                        hostel: {
                            ownerId: parseInt(ownerId)
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5,
                include: {
                    room: true,
                    payments: {
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 1
                    }
                }
            });

            res.status(200).json({
                success: true,
                data: {
                    totalMonthlyRevenue,
                    hostels: hostelMetrics,
                    recentActivities: recentActivities.map(activity => ({
                        type: activity.payments.length > 0 ? 'payment' : 'booking',
                        description: activity.payments.length > 0
                            ? `Payment received - $${activity.payments[0].amount}`
                            : `New booking - Room ${activity.room.roomNumber}`,
                        timestamp: activity.payments.length > 0
                            ? activity.payments[0].createdAt
                            : activity.createdAt
                    }))
                }
            });

        } catch (error) {
            console.error('Error fetching owner dashboard:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch dashboard data'
            });
        }
    },
    // Create a new hostel
    createHostel: async (req, res) => {
      try {
        const {
          name,
          description,
          address,
          mapLocationLat,
          mapLocationLng,
          contactNumber,
          email,
          amenities,
          ownerId,
          roomTypes
        } = req.body;
  
        // ✅ Handle image uploads to S3
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
          const uploadPromises = req.files.map(file => uploadToS3(file));
          imageUrls = await Promise.all(uploadPromises);
        }
  
        // ✅ Parse roomTypes (stringified JSON array)
        let parsedRoomTypes = [];
        try {
          parsedRoomTypes = JSON.parse(roomTypes);
        } catch (e) {
          return res.status(400).json({
            success: false,
            error: 'Invalid roomTypes format. Must be a JSON array.'
          });
        }
  
        // ✅ Ensure amenities is always an array
        const parsedAmenities = Array.isArray(amenities)
          ? amenities
          : [amenities];
  
        // ✅ Create hostel record
        const hostel = await prisma.hostel.create({
          data: {
            name,
            description,
            address,
            mapLocationLat: mapLocationLat ? parseFloat(mapLocationLat) : null,
            mapLocationLng: mapLocationLng ? parseFloat(mapLocationLng) : null,
            contactNumber,
            email,
            amenities: parsedAmenities,         // should be String[]
            images: imageUrls,                  // should be String[]
            ownerId: parseInt(ownerId),
            monthlyRevenue: 0.0,
            roomTypes: parsedRoomTypes          // should be Json type
          },
          include: {
            owner: true,
            // profileImage: true
          }
        });
  
        res.status(201).json({
          success: true,
          data: hostel
        });
  
      } catch (error) {
        console.error('Error creating hostel:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create hostel'
        });
      }
    },
  
  

  // Get all hostels
  getAllHostels: async (req, res) => {
    try {
      const hostels = await prisma.hostel.findMany({
        include: {
          owner: true
        }
      });

      res.status(200).json({
        success: true,
        data: hostels
      });
    } catch (error) {
      console.error('Error fetching hostels:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch hostels'
      });
    }
  },


  // Get basic hostel info by ID
getHostelById: async (req, res) => {
  try {
    const { id } = req.params;

    const hostel = await prisma.hostel.findUnique({
      where: { id: parseInt(id) },
      select: {
        name: true,
        images: true,
        address: true,
        mapLocationLat: true,
        mapLocationLng: true,
        amenities: true
      }
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        error: 'Hostel not found'
      });
    }

    const response = {
      name: hostel.name,
      images: hostel.images, // array of image URLs
      location: {
        address: hostel.address,
        coordinates: {
          latitude: hostel.mapLocationLat,
          longitude: hostel.mapLocationLng
        }
      },
      amenities: hostel.amenities.map(a => ({
        name: a,
        icon: a.toLowerCase().replace(/\s+/g, '_') // optional icon format
      }))
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching hostel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hostel'
    });
  }
},



  // Update hostel
  updateHostel: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Handle new image uploads
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file => uploadToS3(file));
        const newImageUrls = await Promise.all(uploadPromises);

        // Get existing images and append new ones
        const existingHostel = await prisma.hostel.findUnique({
          where: { id: parseInt(id) },
          select: { images: true }
        });

        updateData.images = [...(existingHostel.images || []), ...newImageUrls];
      }

      // Convert numeric fields
      if (updateData.mapLocationLat) updateData.mapLocationLat = parseFloat(updateData.mapLocationLat);
      if (updateData.mapLocationLng) updateData.mapLocationLng = parseFloat(updateData.mapLocationLng);
      if (updateData.ownerId) updateData.ownerId = parseInt(updateData.ownerId);

      const hostel = await prisma.hostel.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          owner: true
        }
      });

      res.status(200).json({
        success: true,
        data: hostel
      });
    } catch (error) {
      console.error('Error updating hostel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update hostel'
      });
    }
  }
};


module.exports = hostelController;