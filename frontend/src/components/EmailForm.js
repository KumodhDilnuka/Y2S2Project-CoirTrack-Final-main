import React, { useState } from "react";

const EmailForm = ({ cart, totalAmount, onBack }) => {
    const [email, setEmail] = useState("");
    const [location, setLocation] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, location, cart, totalAmount }),
            });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error("Error sending email:", error);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Enter Email & Location</h2>
            <form onSubmit={handleSubmit}>
                <input className="w-full p-2 border rounded mb-2" type="email" placeholder="Customer Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="w-full p-2 border rounded mb-2" type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                <button className="w-full bg-blue-500 text-white p-2 rounded" type="submit">Send Email</button>
            </form>
            <button className="mt-2 w-full bg-gray-500 text-white p-2 rounded" onClick={onBack}>Back</button>
        </div>
    );
};

export default EmailForm;
