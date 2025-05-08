const router = require("express").Router();
const Payment = require("../models/Payment");
const Item = require("../models/Item");
const { protect, admin } = require("../middleware/auth");


// Existing create payment route
router.route("/create").post(async (req, res) => {
    try {
        const { userId, items, cardDetails } = req.body;
        console.log("Creating payment for userId:", userId); // Debug log

        // Validate items and calculate total amount
        let totalAmount = 0;
        const processedItems = await Promise.all(items.map(async (item) => {
            const dbItem = await Item.findById(item.itemId);
            
            if (!dbItem) {
                throw new Error(`Item with ID ${item.itemId} not found`);
            }

            // Reduce item count
            dbItem.count -= item.quantity;
            await dbItem.save();

            const itemTotal = dbItem.price * item.quantity;
            totalAmount += itemTotal;

            return {
                itemId: item.itemId,
                quantity: item.quantity,
                price: dbItem.price
            };
        }));

        // Create new payment
        const newPayment = new Payment({
            userId,
            items: processedItems,
            totalAmount,
            paymentStatus: 'Completed',
            approvalStatus: 'Pending', // Default to pending approval
            cardDetails: {
                lastFourDigits: cardDetails.lastFourDigits
            }
        });

        await newPayment.save();

        res.status(201).json({
            message: "Payment successful",
            paymentId: newPayment._id,
            totalAmount
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ 
            message: "Payment processing failed", 
            error: error.message 
        });
    }
});

// Get all payments (with optional user filter)
router.route("/").get(protect, async (req, res) => {
    try {
        const { userId } = req.query;
        console.log("GET /payment - Request query:", req.query); // Debug log
        console.log("UserId from query:", userId); // Debug log
        console.log("Current user ID:", req.user.id); // Debug log
        console.log("Current user role:", req.user.role); // Debug log
        
        // If not admin, force filter by the authenticated user's ID
        const isAdmin = req.user && req.user.role === 'admin';
        let query = {};
        
        if (isAdmin) {
            // If admin and userId provided, filter by that userId
            if (userId) {
                query = { userId: userId.toString() };
            }
            // Otherwise, admin sees all payments
        } else {
            // Non-admin users can only see their own payments
            query = { userId: req.user.id.toString() };
        }
            
        console.log("MongoDB query:", query); // Debug log
        
        const payments = await Payment.find(query)
            .populate({
                path: 'items.itemId',
                select: 'name price description'
            })
            .sort({ paymentDate: -1 })
            .limit(50); // Limit to prevent overwhelming data

        console.log(`Found ${payments.length} payments`); // Debug log
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ 
            message: "Error fetching payments", 
            error: error.message 
        });
    }
});

// Get pending orders for admin
router.route("/pending").get(protect, async (req, res) => {
    try {
        console.log("Fetching pending orders endpoint called");
        console.log("Current user ID:", req.user.id); 
        console.log("Current user role:", req.user.role);
        
        // Check if user is admin
        const isAdmin = req.user && req.user.role === 'admin';
        if (!isAdmin) {
            console.log(`User ${req.user.id} attempted to access admin-only endpoint with role ${req.user.role}`);
            return res.status(403).json({ message: "Unauthorized access. Admin privileges required." });
        }
        
        console.log("Admin check passed, querying for pending orders");
        
        try {
            const pendingOrders = await Payment.find({ approvalStatus: 'Pending' })
                .populate({
                    path: 'items.itemId',
                    select: 'name price description'
                })
                .sort({ paymentDate: -1 });

            console.log(`Found ${pendingOrders.length} pending orders`); 
            
            // Debug each pending order
            if (pendingOrders.length > 0) {
                pendingOrders.forEach((order, index) => {
                    console.log(`Order ${index + 1}:`, {
                        id: order._id,
                        userId: order.userId,
                        status: order.approvalStatus,
                        paymentStatus: order.paymentStatus,
                        items: order.items.length,
                        totalAmount: order.totalAmount
                    });
                });
            } else {
                console.log("No pending orders found in the database");
            }
            
            res.json(pendingOrders);
        } catch (dbError) {
            console.error('Database error when fetching pending orders:', dbError);
            return res.status(500).json({ 
                message: "Database error fetching pending orders", 
                error: dbError.message 
            });
        }
    } catch (error) {
        console.error('Error in pending orders endpoint:', error);
        return res.status(500).json({ 
            message: "Error fetching pending orders", 
            error: error.message 
        });
    }
});

// Approve an order
router.route("/approve/:id").put(protect, async (req, res) => {
    try {
        console.log("Approving order:", req.params.id);
        console.log("Current user ID:", req.user.id);
        console.log("Current user role:", req.user.role);
        
        // Check if user is admin
        const isAdmin = req.user && req.user.role === 'admin';
        if (!isAdmin) {
            console.log("Unauthorized: user is not admin");
            return res.status(403).json({ message: "Unauthorized access. Admin privileges required." });
        }
        
        const payment = await Payment.findById(req.params.id);
        
        if (!payment) {
            console.log("Order not found:", req.params.id);
            return res.status(404).json({ message: "Order not found" });
        }
        
        console.log("Order found:", {
            id: payment._id,
            userId: payment.userId,
            currentStatus: payment.approvalStatus
        });
        
        payment.approvalStatus = 'Approved';
        await payment.save();
        
        console.log("Order approved successfully");
        res.json({ 
            message: "Order approved successfully", 
            payment 
        });
    } catch (error) {
        console.error('Error approving order:', error);
        res.status(500).json({ 
            message: "Error approving order", 
            error: error.message 
        });
    }
});

// Reject an order
router.route("/reject/:id").put(protect, async (req, res) => {
    try {
        console.log("Rejecting order:", req.params.id);
        console.log("Current user ID:", req.user.id);
        console.log("Current user role:", req.user.role);
        
        // Check if user is admin
        const isAdmin = req.user && req.user.role === 'admin';
        if (!isAdmin) {
            console.log("Unauthorized: user is not admin");
            return res.status(403).json({ message: "Unauthorized access. Admin privileges required." });
        }
        
        const payment = await Payment.findById(req.params.id);
        
        if (!payment) {
            console.log("Order not found:", req.params.id);
            return res.status(404).json({ message: "Order not found" });
        }
        
        console.log("Order found:", {
            id: payment._id,
            userId: payment.userId,
            currentStatus: payment.approvalStatus
        });
        
        payment.approvalStatus = 'Rejected';
        await payment.save();
        
        console.log("Order rejected successfully");
        res.json({ 
            message: "Order rejected successfully", 
            payment 
        });
    } catch (error) {
        console.error('Error rejecting order:', error);
        res.status(500).json({ 
            message: "Error rejecting order", 
            error: error.message 
        });
    }
});

// Get a single payment by ID
router.route("/:id").get(protect, async (req, res) => {
    try {
        console.log("Fetching order with ID:", req.params.id); // Debug log
        console.log("Current user ID:", req.user.id); // Debug log
        console.log("Current user role:", req.user.role); // Debug log
        
        const payment = await Payment.findById(req.params.id)
            .populate({
                path: 'items.itemId',
                select: 'name price description'
            });
        
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        
        console.log("Payment userId:", payment.userId); 
        console.log("User id from request:", req.user.id);
        
        // Check if the user is admin or the owner of the payment
        const isAdmin = req.user && req.user.role === 'admin';
        const isOwner = payment.userId === req.user.id.toString();
        
        console.log("Is admin:", isAdmin);
        console.log("Is owner:", isOwner);
        
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: "Unauthorized access to this order" });
        }
        
        res.json(payment);
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ 
            message: "Error fetching payment", 
            error: error.message 
        });
    }
});

// Add test endpoint to verify authentication
router.route("/auth-test").get(protect, async (req, res) => {
    try {
        const user = req.user;
        console.log("Auth test successful. User:", {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
        
        res.status(200).json({
            message: "Authentication successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Auth test error:', error);
        res.status(500).json({ 
            message: "Authentication test failed", 
            error: error.message 
        });
    }
});

// Create a test pending order
router.route("/create-test-pending").post(protect, async (req, res) => {
    try {
        console.log("Creating test pending order");
        
        // Current user ID for the order
        const userId = req.user.id;
        console.log("Creating test order for user:", userId);
        
        // Create a simple test payment with pending approval
        const testPayment = new Payment({
            userId: userId,
            items: [
                {
                    itemId: "60d21b4967d0d8992e610c85", // Default ID, will be replaced if it exists
                    quantity: 1,
                    price: 100
                }
            ],
            totalAmount: 100,
            paymentStatus: 'Completed',
            approvalStatus: 'Pending',
            cardDetails: {
                lastFourDigits: "1234"
            }
        });
        
        // If there's an item in the database, use that item's ID
        try {
            const anyItem = await Item.findOne();
            if (anyItem) {
                console.log("Found item to use in test order:", anyItem._id);
                testPayment.items[0].itemId = anyItem._id;
            } else {
                console.log("No items found in database, using placeholder ID");
            }
        } catch (itemError) {
            console.log("Error finding an item:", itemError.message);
        }
        
        // Save the test payment
        await testPayment.save();
        console.log("Test pending order created with ID:", testPayment._id);
        
        res.status(201).json({
            message: "Test pending order created successfully",
            orderId: testPayment._id
        });
    } catch (error) {
        console.error('Error creating test pending order:', error);
        res.status(500).json({ 
            message: "Error creating test pending order", 
            error: error.message 
        });
    }
});

// Check for pending orders and create some if needed
router.route("/ensure-pending-orders").post(protect, admin, async (req, res) => {
    try {
        console.log("Checking for pending orders");
        
        // Check how many pending orders exist
        const pendingCount = await Payment.countDocuments({ approvalStatus: 'Pending' });
        console.log(`Found ${pendingCount} existing pending orders`);
        
        // If there are already pending orders, just return the count
        if (pendingCount > 0) {
            return res.status(200).json({
                message: `${pendingCount} pending orders already exist`,
                created: 0,
                totalPending: pendingCount
            });
        }
        
        // Create 3 test pending orders
        const createdOrders = [];
        const userId = req.user.id;
        
        // Find an item to use in the test orders
        let itemId = "60d21b4967d0d8992e610c85"; // Default placeholder ID
        try {
            const anyItem = await Item.findOne();
            if (anyItem) {
                console.log("Found item to use in test orders:", anyItem._id);
                itemId = anyItem._id;
            } else {
                console.log("No items found in database, using placeholder ID");
            }
        } catch (itemError) {
            console.log("Error finding an item:", itemError.message);
        }
        
        // Create 3 test pending orders
        for (let i = 0; i < 3; i++) {
            const testPayment = new Payment({
                userId: userId,
                items: [
                    {
                        itemId: itemId,
                        quantity: i + 1,
                        price: 100 * (i + 1)
                    }
                ],
                totalAmount: 100 * (i + 1),
                paymentStatus: 'Completed',
                approvalStatus: 'Pending',
                cardDetails: {
                    lastFourDigits: String(1000 + i).slice(-4)
                }
            });
            
            await testPayment.save();
            createdOrders.push(testPayment._id);
            console.log(`Created test pending order ${i+1} with ID:`, testPayment._id);
        }
        
        res.status(201).json({
            message: "Test pending orders created successfully",
            created: createdOrders.length,
            orderIds: createdOrders,
            totalPending: createdOrders.length
        });
    } catch (error) {
        console.error('Error ensuring pending orders exist:', error);
        res.status(500).json({ 
            message: "Error ensuring pending orders exist", 
            error: error.message 
        });
    }
});

module.exports = router;