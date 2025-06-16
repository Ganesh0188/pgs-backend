const { PrismaClient, PaymentType } = require('@prisma/client');
const { uploadToS3 } = require('../../utils/s3');
const prisma = new PrismaClient();
const dayjs = require('dayjs');


// const paymentduenotification={getPaymentDueNotification : async (req, res) => {
//   const residentId = parseInt(req.params.residentId, 10);

//   if (isNaN(residentId)) {
//     return res.status(400).json({ error: 'Invalid resident ID' });
//   }

//   try {
//     const currentMonth = dayjs().format('YYYY-MM');

//     const existingPayment = await prisma.payment.findFirst({
//       where: {
//         residentId,
//         month: currentMonth
//       }
//     });

//     if (!existingPayment) {
//       return res.status(200).json({
//         due: true,
//         title: "Payment Due: Monthly Rent",
//         message: "Your monthly rent payment is due in 3 days",
//         type: "PAYMENT_DUE",
//         action: "Pay Now",
//         timeAgo: "2h ago"
//       });
//     } else {
//       return res.status(200).json({
//         due: false,
//         message: "Rent already paid for this month"
//       });
//     }
//   } catch (error) {
//     console.error('Error fetching payment due:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }
// };



// const residentnotifications={getResidentNotifications :async (req, res) => {
//   const residentId = parseInt(req.params.residentId, 10);

//   if (isNaN(residentId)) {
//     return res.status(400).json({ error: "Invalid resident ID" });
//   }

//   try {
//     const currentMonth = dayjs().format('YYYY-MM');

//     const payment = await prisma.payment.findFirst({
//       where: {
//         residentId,
//         month: currentMonth
//       }
//     });

//     const notifications = [];

//     if (!payment) {
//       notifications.push({
//         title: "Payment Due: Monthly Rent",
//         message: "Your monthly rent payment is due in 3 days",
//         type: "PAYMENT_DUE",
//         action: "Pay Now",
//         timeAgo: "2h ago"
//       });
//     }

//     notifications.push({
//       title: "Request Approved",
//       message: "Your maintenance request #1234 has been approved",
//       type: "REQUEST_APPROVED",
//       timeAgo: "5h ago"
//     });

//     notifications.push({
//       title: "Meal Plan Update",
//       message: "Your meal plan will expire in 7 days",
//       type: "MEAL_PLAN",
//       action: "Renew",
//       timeAgo: "1d ago"
//     });

//     notifications.push({
//       title: "Room Change Request",
//       message: "Your room change request is under review",
//       type: "ROOM_CHANGE",
//       timeAgo: "1d ago"
//     });

//     res.status(200).json(notifications);
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }
// };



// const residentpaymenthistory ={getResidentPaymentHistory: async (req, res) => {
//   const { residentId } = req.params;
//   const { range } = req.query;

//   const filter = { residentId: Number(residentId) };

//   // Optional filtering by date range
//   const now = new Date();
//   if (range) {
//     const monthsMap = {
//       lastMonth: 1,
//       "3months": 3,
//       "6months": 6
//     };

//     const monthsAgo = monthsMap[range];
//     if (monthsAgo) {
//       const fromDate = new Date(now.setMonth(now.getMonth() - monthsAgo));
//       filter.paidDate = {
//         gte: fromDate
//       };
//     }
//   }

//   try {
//     const payments = await prisma.payment.findMany({
//       where: filter,
//       orderBy: { paidDate: 'desc' }
//     });

//     const formatted = payments.map(p => ({
//       id: p.id,
//       month: p.month,
//       paidDate: p.paidDate,
//       amount: p.amount,
//       paymentType: p.paymentType,
//       status: "Paid"
//     }));

//     res.json(formatted);
//   } catch (err) {
//     console.error("History Error:", err);
//     res.status(500).json({ message: "Failed to fetch payment history" });
//   }
// }
// };


// const residentpaymentdashboard={getResidentPaymentDashboard : async (req, res) => {
//   const { residentId } = req.params;

//   try {
//     // Get all payments for the resident
//     const payments = await prisma.payment.findMany({
//       where: { residentId: Number(residentId) },
//       orderBy: { paidDate: 'asc' },
//     });

//     // Aggregate calculations
//     const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
//     const totalTransactions = payments.length;
//     const averagePayment = totalTransactions > 0 ? totalPaid / totalTransactions : 0;

//     // Get latest paid month
//     const latestPayment = payments[payments.length - 1];
//     const nextDueMonth = latestPayment
//       ? new Date(new Date(latestPayment.month + "-01").setMonth(new Date(latestPayment.month + "-01").getMonth() + 1))
//       : new Date();

//     // Get resident room price
//     const resident = await prisma.resident.findUnique({
//       where: { id: Number(residentId) },
//       include: {
//         room: true
//       }
//     });

//     const roomPrice = resident?.room?.price || 0;

//     const upcomingDue = {
//       month: nextDueMonth.toISOString().slice(0, 7),
//       amount: roomPrice,
//       dueDate: new Date(nextDueMonth.getFullYear(), nextDueMonth.getMonth(), 15) // e.g., 15th of the month
//     };

//     res.json({
//       totalPaid,
//       totalTransactions,
//       averagePayment: Number(averagePayment.toFixed(2)),
//       upcomingDue
//     });

//   } catch (err) {
//     console.error("Dashboard Error:", err);
//     res.status(500).json({ message: "Failed to fetch payment dashboard" });
//   }
// }
// };



// const getresidentController = {
//   getResidentProfile: async (req, res) => {
//     try {
//       const { userId } = req.params;

//       const stays = await prisma.resident.findMany({
//         where: { residentId: parseInt(userId) },
//         include: {
//           room: {
//             include: {
//               hostel: true,
//             },
//           },
//           payments: true,
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       });

//       const totalStays = stays.length;
//       const totalPayments = stays.reduce((sum, stay) =>
//         sum + stay.payments.reduce((pSum, p) => pSum + p.amount, 0), 0);

//       const cities = new Set(
//         stays.map(stay => stay.room.hostel.address.split(',').pop().trim())
//       );

//       const hostelIds = new Set(
//         stays.map(stay => stay.room.hostel.id)
//       );

//       res.json({
//         success: true,
//         data: {
//           summary: {
//             totalStays,
//             totalHostels: hostelIds.size,
//             totalCities: cities.size,
//             totalPayments,
//           },
//           stays
//         }
//       });

//     } catch (error) {
//       console.error("Error fetching resident profile:", error);
//       res.status(500).json({ success: false, message: "Internal server error" });
//     }
//   }
// };




// const createPayment = async (req, res) => {
//   try {
//     const { residentId } = req.params;
//     const { month, amount, paymentType, paidDate } = req.body;

//     const payment = await prisma.payment.create({
//       data: {
//         residentId: parseInt(residentId),
//         month,
//         amount,
//         paymentType,
//         paidDate: paidDate ? new Date(paidDate) : undefined,
//       },
//     });

//     res.status(201).json(payment);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to create payment', error: err.message });
//   }
// };


// const getResidentPaymentHistory = async (req, res) => {
//   try {
//     const { residentId } = req.params;

//     const payments = await prisma.payment.findMany({
//       where: { residentId: parseInt(residentId) },
//       orderBy: { paidDate: 'desc' }
//     });

//     res.json(payments);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch payment history', error: err.message });
//   }
// };

// controllers/residentController.js

// const getResidentDashboard = async (req, res) => {
//   try {
//     const { residentId } = req.params;

//     const resident = await prisma.resident.findUnique({
//       where: { id: parseInt(residentId) },
//       include: {
//         room: {
//           include: { hostel: true },
//         },
//         payments: {
//           orderBy: { paidDate: 'desc' },
//           take: 1, // latest payment
//         },
//       },
//     });

//     if (!resident) return res.status(404).json({ message: 'Resident not found' });

//     res.json({
//       id: resident.id,
//       fullName: resident.fullName,
//       status: "Active Resident",
//       room: {
//         roomNumber: resident.room.roomNumber,
//         block: resident.room.hostel.name,
//         since: resident.dateOfRegistration,
//       },
//       latestPayment: resident.payments[0] || null,
//       profileImage: resident.profileImage,
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch dashboard', error: err.message });
//   }
// };


const residentController = {
  // Get available payment methods
  getPaymentMethods: async (req, res) => {
    try {
      const paymentMethods = Object.values(PaymentType);

      
      res.status(200).json({
        success: true,
        data: paymentMethods
      });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment methods'
      });
    }
  },
  // Get detailed resident information with payment history
  getResidentDetails: async (req, res) => {
    try {
      const { id } = req.params;
      console.log("id", req.params);
      
      
      const resident = await prisma.resident.findUnique({
        where: { id: parseInt(id) },
        include: {
          room:{
            include:{
         hostel:true
            }
          },
          payments: {
            orderBy: {
              month: 'desc'
            }
          }
        }
      });

      if (!resident) {
        return res.status(404).json({
          success: false,
          error: 'Resident not found'
        });
      }

      // Calculate total due and next due date
      const currentDate = new Date();
      const currentMonth = currentDate.toISOString().slice(0, 7);
      const roomPrice = resident.room.price;
      
      // Get all months from registration date to current month
      const months = [];
      const startDate = new Date(resident.dateOfRegistration);
      while (startDate <= currentDate) {
        months.push(startDate.toISOString().slice(0, 7));
        startDate.setMonth(startDate.getMonth() + 1);
      }

      // Calculate total due by checking unpaid months
      const paidMonths = new Set(resident.payments.map(payment => payment.month));
      const unpaidMonths = months.filter(month => !paidMonths.has(month));
      const totalDue = unpaidMonths.length * roomPrice;

      // Calculate next due date (15th of next month)
      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      nextDueDate.setDate(15);

      // Format payment history
      const paymentHistory = resident.payments.map(payment => ({
        month: payment.month,
        amount: payment.amount,
        paymentType: payment.paymentType,
        paidDate: payment.paidDate.toISOString().slice(0, 10),
        status: 'Paid'
      }));

      // Add pending payments to history
      unpaidMonths.forEach(month => {
        paymentHistory.push({
          month,
          amount: roomPrice,
          status: 'Pending'
        });
      });

      // Sort payment history by month in descending order
      paymentHistory.sort((a, b) => b.month.localeCompare(a.month));

      const residentDetails = {
        id: resident.id,
        hostelName: resident.room.hostel.name,
        fullName: resident.fullName,
        roomNumber: resident.room.roomNumber,
        mobileNumberPrimary: resident.mobileNumberPrimary,
        email: resident.email,
        profileImage: resident.profileImage,
        totalDue,
        nextDueDate: nextDueDate.toISOString().slice(0, 10),
        paymentHistory
      };

      res.status(200).json({
        success: true,
        data: residentDetails
      });
    } catch (error) {
      console.error('Error fetching resident details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch resident details'
      });
    }
  },

  // Record new payment
  recordPayment: async (req, res) => {
    try {
      const { residentId } = req.params;
      const { month, amount, paymentType, paymentDate } = req.body;

      const resident = await prisma.resident.findUnique({
        where: { id: parseInt(residentId) },
        include: { room: true }
      });

      if (!resident) {
        return res.status(404).json({
          success: false,
          error: 'Resident not found'
        });
      }

      const existingPayment = await prisma.payment.findFirst({
        where: {
          residentId: parseInt(residentId),
          month
        }
      });

      if (existingPayment) {
        return res.status(400).json({
          success: false,
          error: 'Payment for this month already exists'
        });
      }

      const payment = await prisma.payment.create({
        data: {
          residentId: parseInt(residentId),
          month,
          paidDate: new Date(paymentDate),
          amount: parseFloat(amount),
          paymentType
        }
      });

      res.status(201).json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record payment'
      });
    }
  },

  getResidentStatistics: async (req, res) => {
    try {
      const { hostelId } = req.params;

      const totalResidents = await prisma.resident.count({
        where: {
          room: {
            hostelId: parseInt(hostelId)
          }
        }
      });

      const vacantRooms = await prisma.room.count({
        where: {
          hostelId: parseInt(hostelId),
          status: 'AVAILABLE'
        }
      });

      const currentMonth = new Date().toISOString().slice(0, 7);
      const residentsWithPendingPayments = await prisma.resident.count({
        where: {
          room: { hostelId: parseInt(hostelId) },
          NOT: {
            payments: {
              some: { month: currentMonth }
            }
          }
        }
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const newRequests = await prisma.resident.count({
        where: {
          room: { hostelId: parseInt(hostelId) },
          dateOfRegistration: { gte: sevenDaysAgo }
        }
      });

      res.status(200).json({
        success: true,
        data: {
          totalResidents,
          vacantRooms,
          pendingPayments: residentsWithPendingPayments,
          newRequests
        }
      });
    } catch (error) {
      console.error('Error fetching resident statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch resident statistics'
      });
    }
  },

  searchResidents: async (req, res) => {
    try {
      const { hostelId } = req.params;
      const { query } = req.query;

      const filters = {
        room: {
          hostelId: parseInt(hostelId)
        }
      };

      if (query) {
        filters.OR = [
          { fullName: { contains: query, mode: 'insensitive' } },
          { residentId: { contains: query, mode: 'insensitive' } },
          { room: { roomNumber: { contains: query, mode: 'insensitive' } } }
        ];
      }

      const residents = await prisma.resident.findMany({
        where: filters,
        include: {
          room: true,
          payments: {
            orderBy: {
              paidDate: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          fullName: 'asc'
        }
      });

      const currentMonth = new Date().toISOString().slice(0, 7);
      const formattedResidents = residents.map(resident => {
        const latestPayment = resident.payments[0];
        const paymentStatus = latestPayment && latestPayment.month === currentMonth ? 'Paid' : 'Pending';

        return {
          id: resident.id,
          fullName: resident.fullName,
          roomNumber: resident.room.roomNumber,
          paymentStatus
        };
      });

      res.status(200).json({
        success: true,
        data: formattedResidents
      });
    } catch (error) {
      console.error('Error searching residents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search residents'
      });
    }
  },

  getResidentsByHostel: async (req, res) => {
    try {
      const { hostelId } = req.params;

      const residents = await prisma.resident.findMany({
        where: {
          room: {
            hostelId: parseInt(hostelId)
          }
        },
        include: {
          room: true,
          payments: {
            orderBy: {
              paidDate: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          fullName: 'asc'
        }
      });

      const currentMonth = new Date().toISOString().slice(0, 7);
      const formattedResidents = residents.map(resident => {
        const latestPayment = resident.payments[0];
        const paymentStatus = latestPayment && latestPayment.month === currentMonth ? 'Paid' : 'Pending';

        return {
          id: resident.id,
          fullName: resident.fullName,
          roomNumber: resident.room.roomNumber,
          paymentStatus
        };
      });

      res.status(200).json({
        success: true,
        data: formattedResidents
      });
    } catch (error) {
      console.error('Error fetching residents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch residents'
      });
    }
  },

  getResidentsByRoom: async (req, res) => {
    try {
      const { roomId } = req.params;
      const residents = await prisma.resident.findMany({
        where: { roomId: parseInt(roomId) },
        include: {
          room: true,
          payments: true
        }
      });

      res.status(200).json({
        success: true,
        data: residents
      });
    } catch (error) {
      console.error('Error fetching residents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch residents'
      });
    }
  },

  createResident: async (req, res) => {
    try {
      const {
        hostelId,
        roomNumber,
        fullName,
        residentId,
        mobileNumberPrimary,
        mobileNumberSecondary,
        identityDocImage,
        profileImage,
        email,
        address,
        occupation
      } = req.body;

      const room = await prisma.room.findUnique({
        where: {
          roomNumber_hostelId: {
            roomNumber: roomNumber,
            hostelId: parseInt(hostelId)
          }
        },
        include: { residents: true }
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }

      if (room.occupiedBeds >= room.capacity) {
        return res.status(400).json({
          success: false,
          error: 'Room is at full capacity'
        });
      }

      const resident = await prisma.resident.create({
        data: {
          fullName,
          mobileNumberPrimary,
          mobileNumberSecondary: mobileNumberSecondary ?? mobileNumberPrimary,
          email,
          address,
          occupation,
          profileImage,
          identityDocImage,
          dateOfRegistration: new Date(),
          room: { connect: { id: room.id } },
          user: { connect: { id: parseInt(residentId) } }
        }
      });

      await prisma.room.update({
        where: { id: room.id },
        data: {
          occupiedBeds: room.occupiedBeds + 1,
          status: room.occupiedBeds + 1 >= room.capacity ? 'OCCUPIED' : 'AVAILABLE'
        }
      });

      res.status(201).json({
        success: true,
        data: resident
      });
    } catch (error) {
      console.error('Error creating resident:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create resident'
      });
    }
  },

  updateResident: async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, mobileNumberPrimary, mobileNumberSecondary, email, address, occupation } = req.body;

      const existingResident = await prisma.resident.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingResident) {
        return res.status(404).json({
          success: false,
          error: 'Resident not found'
        });
      }

      const updatedResident = await prisma.resident.update({
        where: { id: parseInt(id) },
        data: {
          fullName,
          mobileNumberPrimary,
          mobileNumberSecondary,
          email,
          address,
          occupation,
          updatedAt: new Date()
        }
      });

      res.status(200).json({
        success: true,
        data: updatedResident
      });
    } catch (error) {
      console.error('Error updating resident:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update resident'
      });
    }
  },

  deleteResident: async (req, res) => {
    try {
      const { id } = req.params;

      const existingResident = await prisma.resident.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingResident) {
        return res.status(404).json({
          success: false,
          error: 'Resident not found'
        });
      }

      await prisma.payment.deleteMany({
        where: { residentId: parseInt(id) }
      });

      await prisma.resident.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({
        success: true,
        message: 'Resident deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting resident:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete resident'
      });
    }
  },

  getResidentById: async (req, res) => {
    try {
      const { id } = req.params;
      const resident = await prisma.resident.findUnique({
        where: { id: parseInt(id) },
        include: {
          room: true,
          payments: true
        }
      });

      if (!resident) {
        return res.status(404).json({
          success: false,
          error: 'Resident not found'
        });
      }

      res.status(200).json({
        success: true,
        data: resident
      });
    } catch (error) {
      console.error('Error fetching resident:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch resident'
      });
    }
  }
};

module.exports = residentController;
