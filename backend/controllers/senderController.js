import prisma from "../config/db.js";
import { sendSms } from './smsController.js'; 
export const getAvailableFlights = async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      where: {
        availableKg: {
          gt: 0,
        },
        status: "on-time",
      },
      include: {
        carrier: {
          select: {
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: {
        departureDate: "asc",
      },
    });

    res.status(200).json(flights);
  } catch (error) {
    console.error("Error fetching flights for sender:", error);
    res.status(500).json({ message: "Failed to fetch flights" });
  }
};
export const createShipment = async (req, res) => {
  try {
    const { flightId, itemWeight, acceptorName, acceptorPhone, acceptorNationalID } = req.body;
    const senderId = req.user.id; 

    if (!flightId || !itemWeight || !acceptorName || !acceptorPhone || !acceptorNationalID) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
      include: { carrier: { select: { fullName: true, phone: true } } }
    });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    if (itemWeight > flight.availableKg) {
      return res.status(400).json({ message: "Item weight exceeds available flight capacity" });
    }
    await prisma.flight.update({
      where: { id: flightId },
      data: { availableKg: flight.availableKg - itemWeight },
    });
    const shipment = await prisma.shipment.create({
      data: {
        senderId,
        carrierId: flight.carrierId,
        flightId,
        acceptorName,
        acceptorPhone,
        acceptorNationalID,
        itemWeight: parseFloat(itemWeight),
        acceptorVerified: false,
      },
    });
    const trackingCode = `SHIP-${shipment.id.slice(-6).toUpperCase()}`;
    await prisma.shipment.update({
      where: { id: shipment.id },
      data: { trackingCode },
    });
    const message = `Hello ${acceptorName}, you have a new item shipment from ${req.user.fullName}. 
Track your package using code: ${trackingCode}. 
Flight from ${flight.from} to ${flight.to} departs on ${new Date(flight.departureDate).toLocaleDateString()}.`;
    await sendSms(acceptorPhone, message);

    res.status(201).json({ message: "Shipment request created and SMS sent", shipment });
  } catch (error) {
    console.error("Error creating shipment:", error);
    res.status(500).json({ message: "Failed to create shipment" });
  }
};

