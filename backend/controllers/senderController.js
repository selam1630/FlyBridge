import prisma from "../config/db.js";
import { sendShipmentEmail } from './emailController.js';
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
    const { flightId, itemWeight, acceptorName, acceptorPhone, acceptorEmail, acceptorNationalID } = req.body;
    const senderId = req.user.id;

    if (!flightId || !itemWeight || !acceptorName || !acceptorPhone || !acceptorEmail || !acceptorNationalID) {
      return res.status(400).json({ message: "Recipient name, phone, email, and ID are required" });
    }
    if (typeof acceptorEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(acceptorEmail.trim())) {
      return res.status(400).json({ message: "Enter a valid recipient email address" });
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
        acceptorEmail: acceptorEmail.trim().toLowerCase(),
        acceptorNationalID,
        itemWeight: parseFloat(itemWeight),
        acceptorVerified: false,
      },
    });
    const trackingCode = `SHIP-${shipment.id.slice(-6).toUpperCase()}`;
    const shipmentWithTracking = await prisma.shipment.update({
      where: { id: shipment.id },
      data: { trackingCode },
    });
    let emailSent = false;
    try {
      await sendShipmentEmail(acceptorEmail, {
        recipientName: acceptorName,
        senderName: req.user.fullName,
        from: flight.from,
        to: flight.to,
        departureDate: new Date(flight.departureDate).toLocaleDateString(),
        trackingCode,
      });
      emailSent = true;
    } catch (emailError) {
      console.error('Shipment email notification failed:', emailError.message);
    }

    res.status(201).json({
      message: emailSent
        ? "Shipment request created and email notification sent"
        : "Shipment request created, but the email notification could not be sent",
      emailSent,
      shipment: shipmentWithTracking,
    });
  } catch (error) {
    console.error("Error creating shipment:", error);
    res.status(500).json({ message: "Failed to create shipment" });
  }
};

