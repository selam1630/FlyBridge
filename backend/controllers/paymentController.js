import fetch from "node-fetch";
import prisma from "../config/db.js";
export const initializePayment = async (req, res) => {
  try {
    const { shipmentId, amount, currency, customerEmail, customerName } = req.body;
    if (!shipmentId || !amount || !customerEmail || !customerName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const response = await fetch(process.env.CHAPA_BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        email: customerEmail,
        first_name: customerName,
        callback_url: "https://yourfrontend.com/payment/callback",
        reference: `shipment_${shipmentId}`,
      }),
    });

    const data = await response.json();

    if (!data.status || data.status !== "success") {
      return res.status(400).json({ message: "Failed to initialize payment", data });
    }
    const reference = data?.data?.reference || `shipment_${shipmentId}_${Date.now()}`;
    const payment = await prisma.payment.create({
      data: {
        shipmentId,
        reference,
        amount,
        status: "pending",
      },
    });

    res.status(200).json({
      message: "Payment initialized",
      checkoutUrl: data.data.checkout_url,
      payment,
    });
  } catch (err) {
    console.error("Payment initialization error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const releasePayment = async (req, res) => {
  try {
    const { shipmentId } = req.body;

    const payment = await prisma.payment.findFirst({
      where: { shipmentId },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    const feePercentage = 0.10;
    const platformFee = payment.amount * feePercentage;
    const amountToCarrier = payment.amount - platformFee;

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "released",
        releasedAt: new Date(),
        platformFee, 
      },
    });
    res.status(200).json({
      message: "Payment released to carrier minus platform fee",
      payment: updatedPayment,
      amountToCarrier,
      platformFee,
    });
  } catch (err) {
    console.error("Payment release error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const verifyUrl = `https://api.chapa.co/v1/transaction/verify/${reference}`;
    const response = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.status || data.status !== "success") {
      return res.status(400).json({ message: "Payment verification failed", data });
    }

    const payment = await prisma.payment.updateMany({
      where: { reference },
      data: { status: "paid" },
    });

    res.status(200).json({
      message: "Payment verified successfully",
      payment,
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
